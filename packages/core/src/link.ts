import type { Xitter, XitterHost } from "./types";

/**
 * Resolve link to Tweet / status relative with the host.
 *
 * @param {Xitter} tweet Tweet data
 * @param {XitterHost} host Host to be used when rendering tweet
 * @returns {string} A URL that resolves into full tweet / status link
 */
export function resolveTweetLink(tweet: Xitter, host: XitterHost): string {
  if (host.type === 'twitter') {
    return `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`;
  }

  return `${host.origin}/${tweet.user.screen_name}/status/${tweet.id_str}`;
}

/**
 * Resolve link to user profile relative with the host.
 *
 * @param {Xitter} tweet Tweet data
 * @param {XitterHost} host Host to be used when rendering tweet
 * @returns {string} A URL that resolves into user profile
 */
export function resolveUserProfile(tweet: Xitter, host: XitterHost): string {
  if (host.type === 'twitter') {
    return `https://x.com/${tweet.user.screen_name}`;
  }

  return `${host.origin}/${tweet.user.screen_name}`;
}

/**
 * Resolve link to an image media relative with the host.
 *
 * @param {Xitter} tweet Tweet data
 * @param {XitterHost} host Host to be used when rendering tweet
 * @param {number} index Index of the image media, relative with tweet data.
 * @returns {string} A URL that resolves into user profile
 */
export function resolvePhotoLink(tweet: Xitter, host: XitterHost, index: number): string {
  if (host.type === 'twitter') {
    return `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}/photo/${index + 1}`;
  }

  return tweet.photos?.at(index)?.url ?? '';
}
