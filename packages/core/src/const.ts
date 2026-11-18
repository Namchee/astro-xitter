export const TweetUserVerifiedType = {
  Business: 'Business',
  Government: 'Government',
} as const;

export const HostLabelMap = {
  twitter: 'X',
  nitter: 'Nitter',
} as const;

export const NumberFormatterOptions: Intl.NumberFormatOptions = {
  style: 'decimal',
  notation: 'compact',
  compactDisplay: 'short',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
};

export const ErrorCode = {
  Deleted: 1,
  NotFound: 404,
};
