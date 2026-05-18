import type { UserPreferences } from '@/features/preferences/types';
import type { DigestCadenceInput } from '@/features/digest/types';

export function preferencesToCadence(preferences: UserPreferences): DigestCadenceInput {
  return {
    frequency: preferences.digestFrequency,
    timezone: preferences.timezone,
    preferredWeekday: preferences.preferredWeekday,
    preferredTime: preferences.preferredTime,
  };
}
