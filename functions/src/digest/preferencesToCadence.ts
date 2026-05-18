import type { DigestCadenceInput, UserPreferences } from './types.js';

export function preferencesToCadence(preferences: UserPreferences): DigestCadenceInput {
  return {
    frequency: preferences.digestFrequency,
    timezone: preferences.timezone,
    preferredWeekday: preferences.preferredWeekday,
    preferredTime: preferences.preferredTime,
  };
}
