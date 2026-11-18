import type { Locale as LocaleType, Translation } from '../src/types';

const translations: Translation = {
  viewProfileOn: 'Lihat profil di {host}',
  follow: 'Ikuti',
  verified: 'Akun terverifikasi',

  likeTooltip: 'Sukai postingan ini',
  replyTooltip: 'Balas postingan ini',
  shareTooltip: 'Bagikan postingan ini',
  replyLabel: 'Balas',
  copyLabel: 'Salin tautan',
  copyToast: 'Disalin!',

  viewPost: 'View Post',
  showMore: 'Show More',
  readMoreOn: 'Read more on {host}',
  replies: 'Baca {count} balasan',

  watchVideoOn: 'Tonton video di {host}',
  watchOn: 'Tonton di {host}',
  viewReplies: 'Tampilkan balasan',
  copyVideoAddress: 'Salin alamat video',
  continueWatchingOn: 'Lanjut menonton di {host}',

  errorDeletedTitle: 'Tweet has been deleted',
  errorDeletedDescription: 'This tweet has been deleted by the author and cannot be rendered',
  errorNotFoundTitle: 'Tweet not found',
  errorNotFoundDescription: 'The requested tweet could not be found',
  errorUnknownTitle: 'Unknown Error',
  errorUnknownDescription: 'Failed to fetch tweet due to unexpected error',
};

export const Locale = {
  code: 'en-US',
  translations: translations,
} satisfies LocaleType;

export default Locale;
