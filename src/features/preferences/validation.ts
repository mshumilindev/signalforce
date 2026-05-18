import {
  digestFrequencies,
  digestTones,
  userInterests,
  weekdays,
  type DigestFrequency,
  type PreferencesFormErrors,
  type PreferencesFormValues,
  type UserPreferences,
} from '@/features/preferences/types';
import { supportedLanguages, type TranslationKey } from '@/shared/i18n/translations';

export function frequencyRequiresWeekday(frequency: DigestFrequency): boolean {
  return frequency !== 'daily';
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function isValidTimezone(value: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function isSupportedLanguage(value: string): value is UserPreferences['language'] {
  return (supportedLanguages as readonly string[]).includes(value);
}

function validationKey(key: TranslationKey): TranslationKey {
  return key;
}

export function validatePreferencesForm(values: PreferencesFormValues): PreferencesFormErrors {
  const errors: PreferencesFormErrors = {};

  if (!values.language || !isSupportedLanguage(values.language)) {
    errors.language = validationKey('preferences.validation.languageRequired');
  }

  if (values.interests.length === 0) {
    errors.interests = validationKey('preferences.validation.interestsRequired');
  } else if (values.interests.length > userInterests.length) {
    errors.interests = validationKey('preferences.validation.interestsInvalid');
  } else if (new Set(values.interests).size !== values.interests.length) {
    errors.interests = validationKey('preferences.validation.interestsInvalid');
  } else if (values.interests.some((interest) => !userInterests.includes(interest))) {
    errors.interests = validationKey('preferences.validation.interestsInvalid');
  }

  if (!values.digestTone || !digestTones.includes(values.digestTone)) {
    errors.digestTone = validationKey('preferences.validation.toneRequired');
  }

  if (!values.digestFrequency || !digestFrequencies.includes(values.digestFrequency)) {
    errors.digestFrequency = validationKey('preferences.validation.frequencyRequired');
  }

  if (values.digestFrequency && frequencyRequiresWeekday(values.digestFrequency)) {
    if (!values.preferredWeekday || !weekdays.includes(values.preferredWeekday)) {
      errors.preferredWeekday = validationKey('preferences.validation.weekdayRequired');
    }
  }

  if (!values.preferredTime || !isValidTime(values.preferredTime)) {
    errors.preferredTime = validationKey('preferences.validation.timeRequired');
  }

  if (!values.timezone || !isValidTimezone(values.timezone)) {
    errors.timezone = validationKey('preferences.validation.timezoneRequired');
  }

  return errors;
}

export function hasValidationErrors(errors: PreferencesFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function assertPersistablePreferences(preferences: UserPreferences): void {
  const errors = validatePreferencesForm(
    preferencesToFormValues(preferences, preferences.timezone),
  );

  if (hasValidationErrors(errors)) {
    throw new Error('Cannot persist invalid preferences.');
  }
}

export function toUserPreferences(values: PreferencesFormValues): UserPreferences {
  if (
    !values.language ||
    !values.digestTone ||
    !values.digestFrequency ||
    !isValidTime(values.preferredTime) ||
    !isValidTimezone(values.timezone)
  ) {
    throw new Error('Cannot build preferences from invalid form values.');
  }

  const preferredWeekday =
    frequencyRequiresWeekday(values.digestFrequency) && values.preferredWeekday
      ? values.preferredWeekday
      : null;

  return {
    language: values.language,
    interests: [...values.interests],
    digestTone: values.digestTone,
    digestFrequency: values.digestFrequency,
    preferredWeekday,
    preferredTime: values.preferredTime,
    timezone: values.timezone,
  };
}

export function preferencesToFormValues(
  preferences: UserPreferences | null | undefined,
  fallbackTimezone: string,
): PreferencesFormValues {
  if (!preferences) {
    return {
      language: '',
      interests: [],
      digestTone: '',
      digestFrequency: '',
      preferredWeekday: '',
      preferredTime: '09:00',
      timezone: fallbackTimezone,
    };
  }

  return {
    language: preferences.language,
    interests: [...preferences.interests],
    digestTone: preferences.digestTone,
    digestFrequency: preferences.digestFrequency,
    preferredWeekday: preferences.preferredWeekday ?? '',
    preferredTime: preferences.preferredTime,
    timezone: preferences.timezone,
  };
}

export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
