import type { PluralTranslation, XitterHost } from './types';

import { HostLabelMap, NumberFormatterOptions } from './const';

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

export function createLabelFormatter(host: XitterHost): (template: string) => string {
  const brand = HostLabelMap[host.type];

  return template => template.replace('{host}', brand);
}

export function createPluralFormatter(
  locale: Intl.LocalesArgument,
  translations: PluralTranslation,
): (count: number, formatted: string) => string {
  const rules = new Intl.PluralRules(locale);

  return (count, formatted) => {
    const template = translations[rules.select(count)] ?? translations.other;

    return template.replace('{count}', formatted);
  };
}
