import { NumberFormatterOptions } from './const';

/**
 * Locale-aware formatters used across the component tree.
 *
 * The digit set and the hour cycle are intentionally left to the locale, so
 * they follow the {@link https://cldr.unicode.org/ CLDR} data bundled with the
 * runtime. Callers that need a specific one can ask for it with a Unicode
 * locale extension, e.g. `ar-u-nu-arab` or `ja-u-hc-h12`.
 */

const TimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
} as const satisfies Intl.DateTimeFormatOptions;

const DateFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
} as const satisfies Intl.DateTimeFormatOptions;

export function createNumberFormatter(locale: Intl.LocalesArgument): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, NumberFormatterOptions);
}

export function createTimeFormatter(locale: Intl.LocalesArgument): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, TimeFormatOptions);
}

export function createDateFormatter(locale: Intl.LocalesArgument): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, DateFormatOptions);
}
