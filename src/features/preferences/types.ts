import type { SupportedLanguage, TranslationKey } from '@/shared/i18n/translations';

export const userInterests = [
  'react',
  'ai',
  'frontend',
  'architecture',
  'leadership',
  'platform',
  'security',
  'performance',
  'cloud',
] as const;
export type UserInterest = (typeof userInterests)[number];

export const digestTones = ['executive', 'balanced', 'technical'] as const;
export type DigestTone = (typeof digestTones)[number];

export const digestFrequencies = [
  'daily',
  'twicePerWeek',
  'weekly',
  'biweekly',
  'monthly',
] as const;
export type DigestFrequency = (typeof digestFrequencies)[number];

export const weekdays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof weekdays)[number];

export interface UserPreferences {
  readonly language: SupportedLanguage;
  readonly interests: readonly UserInterest[];
  readonly digestTone: DigestTone;
  readonly digestFrequency: DigestFrequency;
  readonly preferredWeekday: Weekday | null;
  readonly preferredTime: string;
  readonly timezone: string;
}

export interface PreferencesFormValues {
  readonly language: SupportedLanguage | '';
  readonly interests: readonly UserInterest[];
  readonly digestTone: DigestTone | '';
  readonly digestFrequency: DigestFrequency | '';
  readonly preferredWeekday: Weekday | '';
  readonly preferredTime: string;
  readonly timezone: string;
}

export type PreferencesFormField =
  | 'language'
  | 'interests'
  | 'digestTone'
  | 'digestFrequency'
  | 'preferredWeekday'
  | 'preferredTime'
  | 'timezone'
  | 'form';

export type PreferencesFormErrors = Partial<Record<PreferencesFormField, TranslationKey>>;
