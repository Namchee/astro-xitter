import type { Hashtag, Symbol, Tweet, Url, UserMention, XitterHost } from './types';

interface ContentPipelineOptions {
  interactive?: boolean;
  host?: XitterHost;
}

function renderEntity(text: string, href: string, interactive?: boolean): string {
  const isolated = `<bdi>${text}</bdi>`;

  if (!interactive) {
    return isolated;
  }

  return `<a href="${href}" target="_blank" rel="noreferrer noopener" class="astro-xitter-content-link astro-xitter-link">${isolated}</a>`;
}

export function processContent(tweet: Tweet, options?: ContentPipelineOptions) {
  const isTruncated = !!tweet.note_tweet;

  let content = tweet.text;

  const allEntities = [
    ...(tweet.entities?.urls || []).map(e => ({ ...e, type: 'url' })),
    ...(tweet.entities?.user_mentions || []).map(e => ({ ...e, type: 'mention' })),
    ...(tweet.entities?.hashtags || []).map(e => ({ ...e, type: 'hashtag' })),
    ...(tweet.entities?.media || []).map(e => ({ ...e, type: 'media' })),
    ...(tweet.entities?.symbols || []).map(e => ({ ...e, type: 'symbol' })),
  ];

  allEntities.sort((a, b) => b.indices[0] - a.indices[0]);

  for (const entity of allEntities) {
    const [start, end] = entity.indices;
    let replacement = '';

    switch (entity.type) {
      case 'url': {
        const { expanded_url, display_url, url } = entity as Url;

        replacement = renderEntity(display_url, expanded_url, options?.interactive);

        // remove if embed exist
        if (url === tweet.card?.url && !tweet.quoted_tweet) {
          replacement = '';
        }

        break;
      }
      case 'mention': {
        const { screen_name } = entity as UserMention;
        const href =
          options?.host?.type === 'nitter' ? `${options.host.origin}/${screen_name}` : `https://x.com/${screen_name}`;

        replacement = renderEntity(`@${screen_name}`, href, options?.interactive);

        // remove first mention on reply, but only if it replies to the correct parent
        if (start === 0 && tweet.parent && screen_name.toLowerCase() === tweet.in_reply_to_screen_name?.toLowerCase()) {
          replacement = '';
        }

        break;
      }
      case 'hashtag': {
        const { text } = entity as Hashtag;
        const href =
          options?.host?.type === 'nitter' ? `${options.host.origin}/hashtag/${text}` : `https://x.com/hashtag/${text}`;

        replacement = renderEntity(`#${text}`, href, options?.interactive);

        break;
      }
      case 'symbol': {
        const { text } = entity as Symbol;
        const href =
          options?.host?.type === 'nitter'
            ? `${options.host.origin}/search?q=%24${text}`
            : `https://x.com/search?q=%24${text}`;

        replacement = renderEntity(`$${text}`, href, options?.interactive);

        break;
      }
      case 'media':
        replacement = '';
        break;
    }

    const characters = [...content];

    const before = characters.slice(0, start).join('');
    const after = characters.slice(end).join('');

    content = `${before}${replacement}${after}`;
  }

  return {
    content: content.trim(),
    isTruncated: isTruncated,
  };
}

export function resolveWritingDirection(locale: Intl.LocalesArgument): 'ltr' | 'rtl' {
  const tag = Array.isArray(locale) ? locale[0] : String(locale);
  try {
    return new Intl.Locale(tag).getTextInfo().direction ?? 'ltr';
  } catch {
    return 'ltr';
  }
}
