import type { SupportedLanguage } from '@/shared/i18n/translations';

export function formatDigestTimestamp(
  isoTimestamp: string,
  language: SupportedLanguage,
  timezone: string,
): string {
  const date = new Date(isoTimestamp);

  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(date);
}

export function formatDigestPeriod(
  periodStart: string,
  periodEnd: string,
  language: SupportedLanguage,
  timezone: string,
): string {
  const start = formatDigestTimestamp(periodStart, language, timezone);
  const end = formatDigestTimestamp(periodEnd, language, timezone);

  return `${start} → ${end}`;
}
