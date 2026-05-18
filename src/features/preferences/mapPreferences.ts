import {
  digestFrequencies,
  digestTones,
  userInterests,
  weekdays,
  type UserPreferences,
  type Weekday,
} from '@/features/preferences/types';
import { supportedLanguages } from '@/shared/i18n/translations';

function isStringArray(value: unknown, allowed: readonly string[]): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= allowed.length &&
    value.every((item) => typeof item === 'string' && allowed.includes(item))
  );
}

function parseWeekday(value: unknown): Weekday | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' && weekdays.includes(value as Weekday)) {
    return value as Weekday;
  }

  return null;
}

export function mapPreferences(data: unknown): UserPreferences | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  const language = record.language;
  const interests = record.interests;
  const digestTone = record.digestTone;
  const digestFrequency = record.digestFrequency;
  const preferredTime = record.preferredTime;
  const timezone = record.timezone;
  const preferredWeekday = parseWeekday(record.preferredWeekday);

  if (
    typeof language !== 'string' ||
    !(supportedLanguages as readonly string[]).includes(language) ||
    !isStringArray(interests, userInterests) ||
    new Set(interests).size !== interests.length ||
    typeof digestTone !== 'string' ||
    !digestTones.includes(digestTone as UserPreferences['digestTone']) ||
    typeof digestFrequency !== 'string' ||
    !digestFrequencies.includes(digestFrequency as UserPreferences['digestFrequency']) ||
    typeof preferredTime !== 'string' ||
    typeof timezone !== 'string' ||
    (record.preferredWeekday !== null &&
      record.preferredWeekday !== undefined &&
      preferredWeekday === null &&
      record.preferredWeekday !== '')
  ) {
    return null;
  }

  return {
    language: language as UserPreferences['language'],
    interests: interests as UserPreferences['interests'],
    digestTone: digestTone as UserPreferences['digestTone'],
    digestFrequency: digestFrequency as UserPreferences['digestFrequency'],
    preferredWeekday,
    preferredTime,
    timezone,
  };
}
