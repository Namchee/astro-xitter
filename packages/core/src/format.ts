import { NumberFormatterOptions } from './const';

/**
 * Digit set used to render numbers and dates.
 *
 * The runtime picks a default from CLDR, but that default is not stable across
 * ICU versions: Node 24+ (CLDR 48) resolves `ar` to `latn`, while older ICU
 * resolves it to `arab`. Pass this value to pin the output, e.g. `arab` for
 * Arabic-Indic digits, `arabext` for Eastern Arabic-Indic / Persian digits, or
 * `latn` for Western digits.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#numberingsystem
 */
export type NumberingSystem = string;

/**
 * Hour cycle used to render the time.
 *
 * CLDR's choice does not always match X: `ja` resolves to `h23` (`17:00`), while
 * X renders `午後5:00`. Pass `h12` to match X.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#hourcycle
 */
export type HourCycle = 'h11' | 'h12' | 'h23' | 'h24';

export interface LocaleFormatOptions {
  numberingSystem?: NumberingSystem;
  hourCycle?: HourCycle;
}

const TimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
} as const satisfies Intl.DateTimeFormatOptions;

const DateFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
} as const satisfies Intl.DateTimeFormatOptions;

/**
 * Drops unset options so they are absent rather than `undefined`.
 *
 * `exactOptionalPropertyTypes` treats the two differently, and `Intl` throws a
 * `RangeError` for an empty numbering system while silently ignoring unknown
 * values.
 */
export function localeFormatProps(options: LocaleFormatOptions): LocaleFormatOptions {
  const props: LocaleFormatOptions = {};

  if (options.numberingSystem) {
    props.numberingSystem = options.numberingSystem;
  }

  if (options.hourCycle) {
    props.hourCycle = options.hourCycle;
  }

  return props;
}

export function createNumberFormatter(
  locale: Intl.LocalesArgument,
  options: LocaleFormatOptions = {},
): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, { ...NumberFormatterOptions, ...localeFormatProps(options) });
}

export function createTimeFormatter(
  locale: Intl.LocalesArgument,
  options: LocaleFormatOptions = {},
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { ...TimeFormatOptions, ...localeFormatProps(options) });
}

export function createDateFormatter(
  locale: Intl.LocalesArgument,
  options: LocaleFormatOptions = {},
): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { ...DateFormatOptions, ...localeFormatProps(options) });
}
