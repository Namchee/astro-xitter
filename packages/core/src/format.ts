import { NumberFormatterOptions } from './const';

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

const PLURAL_PATTERN = /\{(?<key>\w+),\s*plural,\s*(?<options>[^\s\{\}](?:[^\{\}]|\{[^\{\}]*\})*)\}/gv;

const OPTION_PATTERN = /(?<![\w\-])(?<category>=?[\w\-]+)\s*\{(?<value>[^\{\}]*)\}/gv;

const UNPARSED_PLURAL = /\{\w+,\s*plural,/v;

function interpolate(str: string, values: Record<string, string | number>, numbers: Intl.NumberFormat): string {
  return str.replaceAll(/\{(?<key>\w+)\}/gv, (match, key: string) => {
    if (!(key in values)) {
      return match;
    }

    const value = values[key];

    return typeof value === 'number' ? numbers.format(value) : String(value);
  });
}

/**
 * Format a label with ICU i18n standard syntax with pluralization support
 *
 * @param {string} template Label of the string. Should be written in ICU standard
 * @param {Record<string, string | number>} values Replacement value for template
 * @param {Intl.UnicodeBCP47LocaleIdentifier} locale The single locale of the UI. Drives the
 * plural rules, the numeral system, and the interpolation of numeric values.
 * @returns {string} Formatted string with correct replacement value and plurality
 */
export function formatLabel(
  template: string,
  values: Record<string, string | number>,
  locale: Intl.UnicodeBCP47LocaleIdentifier,
): string {
  const rules = new Intl.PluralRules(locale);
  const numbers = new Intl.NumberFormat(locale, NumberFormatterOptions);

  const pluralized = template.replaceAll(PLURAL_PATTERN, (match, key: string, options: string) => {
    const count = values[key];

    if (typeof count !== 'number') {
      return match;
    }

    const choices = Object.fromEntries(
      Array.from(options.matchAll(OPTION_PATTERN), ({ groups }) => [groups!.category, groups!.value]),
    );

    const exact = choices[`=${count}`];
    const category = rules.select(count);
    const selected = exact ?? choices[category] ?? choices.other;

    if (selected === undefined) {
      return match;
    }

    return interpolate(selected.replaceAll('#', numbers.format(count)), values, numbers);
  });

  // A plural directive that survived the pass above is beyond this parser, e.g. an option
  // body holding a nested placeholder. Leave it untouched rather than half-substituting it.
  if (UNPARSED_PLURAL.test(pluralized)) {
    return pluralized;
  }

  return interpolate(pluralized, values, numbers);
}
