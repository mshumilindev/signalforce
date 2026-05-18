import { describe, expect, it } from 'vitest';
import { testUserPreferences } from '../test/fixtures/preferences.js';
import { parseUserPreferences } from './validateUserPreferences.js';

describe('parseUserPreferences', () => {
  it('accepts valid preferences', () => {
    expect(parseUserPreferences(testUserPreferences)).toEqual(testUserPreferences);
  });

  it('requires a weekday for non-daily cadence', () => {
    expect(() =>
      parseUserPreferences({
        ...testUserPreferences,
        digestFrequency: 'weekly',
        preferredWeekday: null,
      }),
    ).toThrow();
  });

  it('rejects unknown fields in preferences payload', () => {
    expect(() =>
      parseUserPreferences({
        ...testUserPreferences,
        latestDigestId: 'digest-1',
      }),
    ).toThrow();
  });
});
