interface HlsMediaSegment {
  url: string;
  duration: number;
}

interface HlsMedia {
  initSegment: string;
  segments: HlsMediaSegment[];
  duration: number;
}

interface PlaylistAttributes {
  BANDWIDTH: string;
  RESOLUTION: string;
  CODECS: string;
}

interface Variant {
  bandwidth: number;
  resolution: [number, number];
  codecs: string;
  url: string;
}

interface MediaPlaylist {
  playlist: HlsMedia;
  variant: Variant;
}

const LINE_SPLITTER = /\r?\n/v;
const URI_MATCHER = /URI="(?<uri>[^"]+)"/v;
const ATTRIBUTE_MATCHER = /(?<key>[-A-Z]+)=(?<value>"[^"]*"|[^,]*)/g;
const PLAYLIST_HEADER = '#EXT-X-STREAM-INF:';

export async function streamVideo(
  video: HTMLVideoElement,
  playlistUrl: string,
) {
  const { playlist, variant } = await fetchMediaPlaylist(playlistUrl);

  const mime = `video/mp4; codecs="${variant.codecs}"`;

  if (!MediaSource.isTypeSupported(mime)) {
    throw new Error(`MSE does not support ${mime}`);
  }

  const mediaSource = new MediaSource();
  const objectUrl = URL.createObjectURL(mediaSource);

  video.src = objectUrl;

  await once(mediaSource, 'sourceopen');

  URL.revokeObjectURL(objectUrl);

  const sourceBuffer = mediaSource.addSourceBuffer(mime);

  await append(
    sourceBuffer,
    await fetchBytes(playlist.initSegment),
  );

  for (const segment of playlist.segments) {
    await append(
      sourceBuffer,
      await fetchBytes(segment.url),
    );
  }

  if (mediaSource.readyState === 'open') {
    mediaSource.endOfStream();
  }
}

async function fetchMediaPlaylist(src: string): Promise<MediaPlaylist> {
  const variants = await fetchMasterPlaylist(src);

  const variant = variants
    .filter(({ resolution }) => resolution[1] <= 720)
    .sort((a, b) => b.resolution[1] - a.resolution[1])[0];

  if (!variant) {
    throw new Error('No suitable HLS variant found');
  }

  const response = await fetch(variant.url, {
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const mediaPlaylist = await response.text();
  return {
    playlist: parseMediaPlaylist(mediaPlaylist, variant.url),
    variant: variant,
  };
}

function parseMediaPlaylist(
  text: string,
  playlistUrl: string,
): HlsMedia {
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

      initSegment = new URL(
        match.groups?.uri ?? '',
        playlistUrl,
      ).href;

      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      pendingDuration = Number.parseFloat(
        line.slice('#EXTINF:'.length).split(',')[0] as string,
      );

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

async function fetchMasterPlaylist(url: string): Promise<Variant[]> {
  const response = await fetch(url, {
    referrerPolicy: 'no-referrer',
  });

  if (!response.ok) {
    return [];
  }

  const text = await response.text();

  return parseMasterPlaylist(text, url);
}

function parseMasterPlaylist(text: string, baseUrl: string): Variant[] {
  const lines = text.split(LINE_SPLITTER).map(line => line.trim()).filter(Boolean);

  const variants: Variant[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    if (!line?.startsWith(PLAYLIST_HEADER)) {
      continue;
    }

    const attributes = parseAttributes(
      line?.slice(PLAYLIST_HEADER.length)
    );

    const url = lines[idx + 1];

    if (!url || url.startsWith('#')) {
      continue;
    }

    const [width, height] = attributes.RESOLUTION.split('x').map(Number);

    variants.push({
      bandwidth: Number(attributes.BANDWIDTH),
      resolution: [width ?? 0, height ?? 0],
      codecs: attributes.CODECS,
      url: new URL(url, baseUrl).href,
    });
  }

  return variants;
}

function parseAttributes(input: string): PlaylistAttributes {
  const attributes: Record<string, string> = {};

  for (const match of input.matchAll(ATTRIBUTE_MATCHER)) {
    const { key, value } = match.groups as { key: string; value: string; };
    if (!key || !value) {
      continue;
    }

    attributes[key] = value.replaceAll(/^"|"$/gv, '');
  }

  return attributes as unknown as PlaylistAttributes;
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

function append(
  sourceBuffer: SourceBuffer,
  data: ArrayBuffer,
): Promise<void> {
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
      reject(error);
    }
  });
}

function once(
  target: EventTarget,
  event: string,
): Promise<void> {
  return new Promise(resolve => {
    target.addEventListener(event, () => resolve(), {
      once: true,
    });
  });
}
