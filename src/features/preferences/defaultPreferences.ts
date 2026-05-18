import type { UserPreferences } from '@/features/preferences/types';

export const defaultUserPreferences: UserPreferences = {
  language: 'en',
  interests: [
    'react',
    'ai',
    'frontend',
    'architecture',
    'leadership',
    'platform',
    'security',
    'performance',
    'cloud',
  ],
  digestTone: 'balanced',
  digestFrequency: 'daily',
  preferredWeekday: null,
  preferredTime: '09:00',
  timezone: 'Europe/Warsaw',
};
