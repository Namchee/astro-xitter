interface HlsMediaSegment {
  url: string;
  duration: number;
}

interface HlsMedia {
  initSegment: string;
  segments: HlsMediaSegment[];
  duration: number;
}

interface Variant {
  bandwidth: number;
  resolution: [number, number];
  codecs: string;
  audioGroup: string | null;
  url: string;
}

interface AudioRendition {
  groupId: string;
  name: string;
  language: string | null;
  url: string;
}

interface MediaPlaylist {
  video: HlsMedia;
  audio: HlsMedia | null;
  variant: Variant;
}

interface MasterPlaylist {
  variants: Variant[];
  audioRenditions: AudioRendition[];
}

type Attributes = Record<string, string>;

const LINE_SPLITTER = /\r?\n/v;
const URI_MATCHER = /URI="(?<uri>[^"]+)"/v;
/* eslint-disable-next-line regexp/no-super-linear-move */
const ATTRIBUTE_MATCHER = /(?<key>[\-A-Z]+)=(?<value>"[^"]*"|[^,]*)/gv;
const PLAYLIST_HEADER = '#EXT-X-STREAM-INF:';
const MEDIA_HEADER = '#EXT-X-MEDIA:';

const VIDEO_CODEC = /^(?:av01|avc1|avc3|dvh1|dvhe|hev1|hvc1|vp0?9)/iv;
const AUDIO_CODEC = /^(?:ac-3|alac|ec-3|flac|mp4a|opus)/iv;

// DON'T FETCH ALL SEGMENTS DUH
const MIN_BUFFER = 5;
const MAX_BUFFER = 10;
const MAX_VIDEO_HEIGHT = 720;

export async function streamVideo(
  video: HTMLVideoElement,
  playlistUrl: string,
  overlay?: HTMLAnchorElement,
): Promise<void> {
  try {
    const { video: videoMedia, audio, variant } = await fetchMediaPlaylist(playlistUrl);

    const videoCodec = pickCodec(variant.codecs, VIDEO_CODEC);

    if (!videoCodec) {
      throw new Error(`No video codec found in ${variant.codecs}`);
    }

    const videoMime = `video/mp4; codecs="${videoCodec}"`;

    if (!MediaSource.isTypeSupported(videoMime)) {
      throw new Error(`MSE does not support ${videoMime}`);
    }

    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);

    video.src = objectUrl;

    await once(mediaSource, 'sourceopen');

    URL.revokeObjectURL(objectUrl);

    const videoBuffer = mediaSource.addSourceBuffer(videoMime);

    let audioBuffer: SourceBuffer | null = null;

    if (audio) {
      const audioCodec = pickCodec(variant.codecs, AUDIO_CODEC);
      const audioMime = audioCodec ? `audio/mp4; codecs="${audioCodec}"` : null;

      if (audioMime && MediaSource.isTypeSupported(audioMime)) {
        audioBuffer = mediaSource.addSourceBuffer(audioMime);
      }
    }

    await append(videoBuffer, await fetchBytes(videoMedia.initSegment));

    if (audio && audioBuffer) {
      await append(audioBuffer, await fetchBytes(audio.initSegment));
    }

    if (overlay) {
      overlay.setAttribute('aria-hidden', 'true');
    }

    const videoStarts = cumulativeStarts(videoMedia);
    const audioStarts = audio ? cumulativeStarts(audio) : [];

    let videoIndex = 0;
    let audioIndex = 0;
    let failed = false;
    let pumping = false;

    const isDone = () => videoIndex >= videoMedia.segments.length && audioIndex >= (audio?.segments.length ?? 0);

    const bufferedAhead = () => {
      const videoAhead = getBufferedAhead(videoBuffer, video.currentTime);
      const audioAhead = audioBuffer ? getBufferedAhead(audioBuffer, video.currentTime) : Number.POSITIVE_INFINITY;

      return Math.min(videoAhead, audioAhead);
    };

    const pump = async () => {
      if (pumping || failed) {
        return;
      }

      pumping = true;

      try {
        while (!isDone() && bufferedAhead() < MAX_BUFFER) {
          const nextVideoStart =
            videoIndex < videoMedia.segments.length
              ? (videoStarts[videoIndex] ?? Number.POSITIVE_INFINITY)
              : Number.POSITIVE_INFINITY;

          const nextAudioStart =
            audio && audioBuffer && audioIndex < audio.segments.length
              ? (audioStarts[audioIndex] ?? Number.POSITIVE_INFINITY)
              : Number.POSITIVE_INFINITY;

          if (nextVideoStart <= nextAudioStart) {
            const segment = videoMedia.segments[videoIndex];

            if (!segment) {
              break;
            }

            await append(videoBuffer, await fetchBytes(segment.url));
            videoIndex++;
          } else if (audio && audioBuffer) {
            const segment = audio.segments[audioIndex];

            if (!segment) {
              break;
            }

            await append(audioBuffer, await fetchBytes(segment.url));
            audioIndex++;
          } else {
            break;
          }
        }

        if (isDone() && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
        }
      } finally {
        pumping = false;
      }
    };

    const safePump = async () => {
      if (failed) {
        return;
      }

      try {
        await pump();
      } catch {
        failed = true;
      }
    };

    await safePump();

    const requestMore = () => {
      if (bufferedAhead() < MIN_BUFFER) {
        safePump();
      }
    };

    video.addEventListener('timeupdate', requestMore);

    video.addEventListener('seeking', requestMore);
    video.addEventListener('waiting', requestMore);
  } catch (error) {
    console.error('Failed to play Xitter video:', error);
  }
}

async function fetchMediaPlaylist(src: string): Promise<MediaPlaylist> {
  const { variants, audioRenditions } = await fetchMasterPlaylist(src);

  const variant = variants
    .filter(({ resolution }) => resolution[1] <= MAX_VIDEO_HEIGHT)
    .sort((a, b) => b.resolution[1] - a.resolution[1])[0];

  if (!variant) {
    throw new Error('No suitable HLS variant found');
  }

  const video = await fetchMediaPlaylistText(variant.url);

  const rendition = variant.audioGroup
    ? audioRenditions.find(({ groupId }) => groupId === variant.audioGroup)
    : undefined;

  const audio = rendition ? await fetchMediaPlaylistText(rendition.url) : null;

  return { video, audio, variant };
}

async function fetchMediaPlaylistText(url: string): Promise<HlsMedia> {
  const response = await fetch(url, {
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();

  return parseMediaPlaylist(text, url);
}

function parseMediaPlaylist(text: string, playlistUrl: string): HlsMedia {
  const lines = text
    .split(LINE_SPLITTER)
    .map(line => line.trim())
    .filter(Boolean);

  let initSegment: string | null = null;
  let duration = 0;

  const segments: HlsMedia['segments'] = [];

  let pendingDuration: number | null = null;

  for (const line of lines) {
    if (line.startsWith('#EXT-X-MAP:')) {
      const match = URI_MATCHER.exec(line);

      if (!match) {
        throw new Error('Invalid EXT-X-MAP');
      }

      initSegment = new URL(match.groups?.uri ?? '', playlistUrl).href;

      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      pendingDuration = Number.parseFloat(line.slice('#EXTINF:'.length).split(',')[0] as string);

      continue;
    }

    if (line.startsWith('#') || pendingDuration === null) {
      continue;
    }

    const url = new URL(line, playlistUrl).href;

    segments.push({
      url: url,
      duration: pendingDuration,
    });

    duration += pendingDuration;
    pendingDuration = null;
  }

  if (!initSegment) {
    throw new Error('HLS playlist has no initialization segment');
  }

  return {
    initSegment,
    segments,
    duration,
  };
}

async function fetchMasterPlaylist(url: string): Promise<MasterPlaylist> {
  const response = await fetch(url, {
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    return { variants: [], audioRenditions: [] };
  }

  const text = await response.text();

  return parseMasterPlaylist(text, url);
}

function parseMasterPlaylist(text: string, baseUrl: string): MasterPlaylist {
  const lines = text
    .split(LINE_SPLITTER)
    .map(line => line.trim())
    .filter(Boolean);

  const variants: Variant[] = [];
  const audioRenditions: AudioRendition[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    if (!line) {
      continue;
    }

    if (line.startsWith(MEDIA_HEADER)) {
      const attributes = parseAttributes(line.slice(MEDIA_HEADER.length));

      if (attributes.TYPE === 'AUDIO' && attributes.URI) {
        audioRenditions.push({
          groupId: attributes['GROUP-ID'] ?? '',
          name: attributes.NAME ?? '',
          language: attributes.LANGUAGE ?? null,
          url: new URL(attributes.URI, baseUrl).href,
        });
      }

      continue;
    }

    if (!line.startsWith(PLAYLIST_HEADER)) {
      continue;
    }

    const attributes = parseAttributes(line.slice(PLAYLIST_HEADER.length));

    const url = lines[idx + 1];

    if (!url || url.startsWith('#')) {
      continue;
    }

    const [width, height] = (attributes.RESOLUTION ?? '').split('x').map(Number);

    variants.push({
      bandwidth: Number(attributes.BANDWIDTH ?? 0),
      resolution: [width ?? 0, height ?? 0],
      codecs: attributes.CODECS ?? '',
      audioGroup: attributes.AUDIO ?? null,
      url: new URL(url, baseUrl).href,
    });
  }

  return { variants, audioRenditions };
}

function parseAttributes(input: string): Attributes {
  const attributes: Attributes = {};

  for (const match of input.matchAll(ATTRIBUTE_MATCHER)) {
    const { key, value } = match.groups as { key?: string; value?: string };

    if (!key || !value) {
      continue;
    }

    attributes[key] = value.replaceAll(/^"|"$/gv, '');
  }

  return attributes;
}

function pickCodec(codecs: string, pattern: RegExp): string | null {
  for (const codec of codecs.split(',')) {
    const candidate = codec.trim();

    if (candidate && pattern.test(candidate)) {
      return candidate;
    }
  }

  return null;
}

function cumulativeStarts(media: HlsMedia): number[] {
  const starts: number[] = [];
  let elapsed = 0;

  for (const segment of media.segments) {
    starts.push(elapsed);
    elapsed += segment.duration;
  }

  return starts;
}

async function fetchBytes(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url, {
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    throw new Error(`HLS segment: HTTP ${response.status}`);
  }

  return response.arrayBuffer();
}

function append(sourceBuffer: SourceBuffer, data: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const onUpdateEnd = () => {
      sourceBuffer.removeEventListener('updateend', onUpdateEnd);
      /* eslint-disable no-use-before-define */
      sourceBuffer.removeEventListener('error', onError);
      resolve();
    };

    const onError = () => {
      sourceBuffer.removeEventListener('updateend', onUpdateEnd);
      sourceBuffer.removeEventListener('error', onError);
      reject(new Error('SourceBuffer error'));
    };

    sourceBuffer.addEventListener('updateend', onUpdateEnd);
    sourceBuffer.addEventListener('error', onError);

    try {
      sourceBuffer.appendBuffer(data);
    } catch (error) {
      sourceBuffer.removeEventListener('updateend', onUpdateEnd);
      sourceBuffer.removeEventListener('error', onError);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function getBufferedAhead(sourceBuffer: SourceBuffer, currentTime: number): number {
  const { buffered } = sourceBuffer;

  for (let idx = 0; idx < buffered.length; idx++) {
    const start = buffered.start(idx);
    const end = buffered.end(idx);

    if (currentTime >= start && currentTime <= end) {
      return end - currentTime;
    }
  }

  return 0;
}

function once(target: EventTarget, event: string): Promise<void> {
  return new Promise(resolve => {
    target.addEventListener(event, () => resolve(), {
      once: true,
    });
  });
}
