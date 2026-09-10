import type { Hashtag, Symbol, Url, UserMention, Xitter } from "./types";

interface ContentPipelineOptions {
  interactive?: boolean;
}

export function processContent(tweet: Xitter, options?: ContentPipelineOptions) {
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

        replacement = `<a href="${expanded_url}" target="_blank" rel="noreferrer noopener" class="astro-xitter-content-link astro-xitter-link">${display_url}</a>`;
        if (!options?.interactive) {
          replacement = display_url;
        }

        if (url === tweet.card?.url && !tweet.quoted_tweet) {
          replacement = '';
        }

        break;
      }
      case 'mention': {
        const { screen_name } = entity as UserMention;
        replacement = `<a href="https://x.com/${screen_name}" target="_blank" rel="noreferrer noopener" class="astro-xitter-content-link astro-xitter-link">@${screen_name}</a>`;
        if (!options?.interactive) {
          replacement = `@${screen_name}`;
        }

        break;
      }
      case 'hashtag': {
        const { text } = entity as Hashtag;
        replacement = `<a href="https://x.com/hashtag/${text}" target="_blank" rel="noreferrer noopener" class="astro-xitter-content-link astro-xitter-link">#${text}</a>`;
        if (!options?.interactive) {
          replacement = `#${text}`;
        }

        break;
      }
      case 'symbol': {
        const { text } = entity as Symbol;
        replacement = `<a href="https://x.com/search?q=%24${text}" target="_blank" rel="noreferrer noopener" class="astro-xitter-content-link astro-xitter-link">$${text}</a>`;
        if (!options?.interactive) {
          replacement = `$${text}`;
        }

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
