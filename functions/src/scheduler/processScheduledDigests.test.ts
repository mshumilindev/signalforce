import { describe, expect, it, vi } from 'vitest';
import { processScheduledDigests } from './processScheduledDigests.js';
import type { UserRecord } from '../users/repository.js';

const preferences = {
  language: 'en' as const,
  interests: ['react'] as const,
  digestTone: 'balanced' as const,
  digestFrequency: 'weekly' as const,
  preferredWeekday: 'monday' as const,
  preferredTime: '09:00',
  timezone: 'UTC',
};

vi.mock('../users/listDueUsers.js', () => ({
  listDueUsers: vi.fn(),
}));

vi.mock('./scheduledDigestForUser.js', () => ({
  scheduledDigestForUser: vi.fn(),
}));

import { listDueUsers } from '../users/listDueUsers.js';
import { scheduledDigestForUser } from './scheduledDigestForUser.js';

const mockedListDueUsers = vi.mocked(listDueUsers);
const mockedScheduledDigestForUser = vi.mocked(scheduledDigestForUser);

function schedulableUser(uid: string, record: Partial<UserRecord> = {}) {
  return {
    uid,
    record: {
      preferences,
      latestDigestId: null,
      nextDigestDueAt: '2026-05-18T09:00:00.000Z',
      ...record,
    },
  };
}

describe('processScheduledDigests', () => {
  it('processes due users and skips non-due users with isolated failures', async () => {
    mockedListDueUsers.mockResolvedValue([
      schedulableUser('due-user'),
      schedulableUser('future-user', { nextDigestDueAt: '2099-01-01T00:00:00.000Z' }),
      schedulableUser('failing-user'),
    ]);

    mockedScheduledDigestForUser.mockImplementation(async (uid) => {
      if (uid === 'due-user') {
        return {
          status: 'processed',
          digestId: 'digest-1',
          nextDigestDueAt: '2026-05-25T09:00:00.000Z',
          outcome: 'created',
        };
      }

      if (uid === 'future-user') {
        return { status: 'skipped', reason: 'not_due' };
      }

      return { status: 'failed', errorMessage: 'OpenAI unavailable' };
    });

    const summary = await processScheduledDigests(new Date('2026-05-18T12:00:00.000Z'));

    expect(summary.candidateCount).toBe(3);
    expect(summary.processedCount).toBe(1);
    expect(summary.skippedCount).toBe(1);
    expect(summary.failedCount).toBe(1);
    expect(mockedScheduledDigestForUser).toHaveBeenCalledTimes(3);
  });
});
