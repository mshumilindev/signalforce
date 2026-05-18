import { describe, expect, it } from 'vitest';
import type { UserPreferences } from '../digest/types.js';
import { resolveSourcesForPreferences } from './registry.js';

const basePreferences: UserPreferences = {
  language: 'en',
  interests: ['react'],
  digestTone: 'balanced',
  digestFrequency: 'weekly',
  preferredWeekday: 'monday',
  preferredTime: '09:00',
  timezone: 'UTC',
};

describe('resolveSourcesForPreferences', () => {
  it('returns only sources matching user interests', () => {
    const sources = resolveSourcesForPreferences(basePreferences);

    expect(sources.some((source) => source.id === 'react-blog')).toBe(true);
    expect(sources.some((source) => source.id === 'signalforge-curated')).toBe(false);
  });

  it('includes static curated sources when architecture interest is selected', () => {
    const sources = resolveSourcesForPreferences({
      ...basePreferences,
      interests: ['architecture'],
    });

    expect(sources.some((source) => source.id === 'signalforge-curated')).toBe(true);
  });
});
