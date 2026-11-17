import type { Locale as LocaleType, Translation } from '../src/types';

const translations: Translation = {
  viewProfileOn: 'View Profile on {host}',
  follow: 'Follow',
  verified: 'Verified Badge',

  likeTooltip: 'Like this Tweet',
  replyTooltip: 'Reply this Tweet',
  shareTooltip: 'Share this Tweet',
  replyLabel: 'Reply',
  copyLabel: 'Copy Link',
  copyToast: 'Copied!',

  viewPost: 'View Post',
  showMore: 'Show More',
  readMoreOn: 'Read more on {host}',
  replies: '{count, plural, one {Read # reply} other {Read # replies}}',

  watchVideoOn: 'Watch video on {host}',
  watchOn: 'Watch on {host}',
  viewReplies: 'View Replies',
  copyVideoAddress: 'Copy Video Address',
  continueWatchingOn: 'Continue watching on {host}',

  errorDeletedTitle: 'Tweet has been deleted',
  errorDeletedDescription: 'This tweet has been deleted by the author and cannot be rendered',
  errorNotFoundTitle: 'Tweet not found',
  errorNotFoundDescription: 'The requested tweet could not be found',
  errorUnknownTitle: 'Unknown Error',
  errorUnknownDescription: 'Failed to fetch tweet due to unexpected error',
};

export const Locale = {
  format: 'en-US',
  translations: translations,
} satisfies LocaleType;
