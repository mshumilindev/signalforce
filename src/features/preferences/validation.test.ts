import { describe, expect, it } from 'vitest';
import {
  assertPersistablePreferences,
  frequencyRequiresWeekday,
  hasValidationErrors,
  toUserPreferences,
  validatePreferencesForm,
} from '@/features/preferences/validation';

const validValues = {
  language: 'en',
  interests: ['react', 'ai'],
  digestTone: 'balanced',
  digestFrequency: 'weekly',
  preferredWeekday: 'monday',
  preferredTime: '09:00',
  timezone: 'Europe/Kyiv',
} as const;

describe('preferences validation', () => {
  it('requires a weekday for weekly cadence', () => {
    expect(frequencyRequiresWeekday('weekly')).toBe(true);
    expect(frequencyRequiresWeekday('daily')).toBe(false);
  });

  it('accepts valid preference values', () => {
    const errors = validatePreferencesForm(validValues);

    expect(hasValidationErrors(errors)).toBe(false);
  });

  it('requires at least one interest', () => {
    const errors = validatePreferencesForm({ ...validValues, interests: [] });

    expect(errors.interests).toBe('preferences.validation.interestsRequired');
  });

  it('rejects duplicate interests', () => {
    const errors = validatePreferencesForm({ ...validValues, interests: ['react', 'react'] });

    expect(errors.interests).toBe('preferences.validation.interestsInvalid');
  });

  it('builds persisted preferences', () => {
    const preferences = toUserPreferences(validValues);

    expect(preferences.preferredWeekday).toBe('monday');
    expect(preferences.language).toBe('en');
  });

  it('rejects invalid persisted preferences', () => {
    expect(() => {
      assertPersistablePreferences({
        ...toUserPreferences(validValues),
        preferredTime: '9:00',
      });
    }).toThrow('Cannot persist invalid preferences.');
  });
});
