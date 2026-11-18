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

  viewPost: 'Lihat postingan',
  showMore: 'Tampilkan lebih banyak',
  readMoreOn: 'Baca selengkapnya di {host}',
  replies: 'Baca {count} balasan',

  watchVideoOn: 'Tonton video di {host}',
  watchOn: 'Tonton di {host}',
  viewReplies: 'Tampilkan balasan',
  copyVideoAddress: 'Salin alamat video',
  continueWatchingOn: 'Lanjut menonton di {host}',

  errorDeletedTitle: 'Postingan sudah dihapus',
  errorDeletedDescription: 'Postingan ini sudah dihapus oleh pemilik dan tidak dapat dilihat lagi',
  errorNotFoundTitle: 'Postingan tidak ditemukan',
  errorNotFoundDescription: 'Postingan yang diminta tidak dapat ditemukan',
  errorUnknownTitle: 'Kesalahan tidak terduga',
  errorUnknownDescription: 'Gagal membaca postingan karena kesalahan tidak terduga',
};

export const Locale = {
  code: 'id-ID',
  translations: translations,
} satisfies LocaleType;

export default Locale;
