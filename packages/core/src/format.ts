
import { Locale } from '../locale/en-US';
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

const PLURAL_PATTERN =
  /\{(?<key>\w+),\s*plural,\s*(?<options>[^\s\{\}](?:[^\{\}]|\{[^\{\}]*\})*)\}/gv;

const OPTION_PATTERN = /(?<![\w\-])(?<category>=?[\w\-]+)\s*\{(?<value>[^\{\}]*)\}/gv;

function interpolate(str: string, values: Record<string, string | number>): string {
  return str.replaceAll(/\{(?<key>\w+)\}/gv, (match, key: string) => {
    if (key in values) {
      return String(values[key]);
    }

    return match;
  })
}

/**
 * Format a label with ICU i18n standard syntax with pluralization support
 *
 * @param {string} template Label of the string. Should be written in ICU standard
 * @param {Record<string, string | number>} values Replacement value for template
 * @param {Intl.UnicodeBCP47LocaleIdentifier} locale Locale to be used when determining plurality.
 * @returns {string} Formatted string with correct replacement value and plurality
 */
export function formatLabel(
  template: string,
  values: Record<string, string | number>,
  locale: Intl.UnicodeBCP47LocaleIdentifier = Locale.format
): string {
  const rules = new Intl.PluralRules(locale);

  return template.replaceAll(PLURAL_PATTERN, (match, key: string, options: string) => {
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

    return interpolate(selected.replaceAll('#', String(count)), values);
  }).replaceAll(/\{(?<key>\w+)\}/gv, (match, key: string) => key in values ? String(values[key]) : match);
}
