import { describe, expect, it } from 'vitest';
import { testUserPreferences } from '../test/fixtures/preferences.js';
import { isUserDueForScheduledDigest } from './isUserDueForScheduledDigest.js';
import type { UserRecord } from '../users/repository.js';

const preferences = {
  ...testUserPreferences,
  interests: ['react'] as const,
};

function user(overrides: Partial<UserRecord> = {}): UserRecord {
  return {
    preferences,
    latestDigestId: null,
    nextDigestDueAt: null,
    ...overrides,
  };
}

describe('isUserDueForScheduledDigest', () => {
  it('returns false when preferences are missing', () => {
    expect(
      isUserDueForScheduledDigest(
        user({ preferences: null }),
        new Date('2026-05-18T12:00:00.000Z'),
      ),
    ).toBe(false);
  });

  it('returns true when nextDigestDueAt is null', () => {
    expect(isUserDueForScheduledDigest(user(), new Date('2026-05-18T12:00:00.000Z'))).toBe(
      true,
    );
  });

  it('returns true when nextDigestDueAt is in the past', () => {
    expect(
      isUserDueForScheduledDigest(
        user({ nextDigestDueAt: '2026-05-18T09:00:00.000Z' }),
        new Date('2026-05-18T12:00:00.000Z'),
      ),
    ).toBe(true);
  });

  it('returns false when nextDigestDueAt is in the future', () => {
    expect(
      isUserDueForScheduledDigest(
        user({ nextDigestDueAt: '2026-05-25T09:00:00.000Z' }),
        new Date('2026-05-18T12:00:00.000Z'),
      ),
    ).toBe(false);
  });
});
