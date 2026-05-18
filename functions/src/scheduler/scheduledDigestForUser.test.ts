import { describe, expect, it, vi, beforeEach } from 'vitest';
import { scheduledDigestForUser } from './scheduledDigestForUser.js';
import type { UserRecord } from '../users/repository.js';

vi.mock('../digest/digestRepository.js', () => ({
  getActiveDigest: vi.fn(),
}));

vi.mock('../digest/executeDigestOperation.js', () => ({
  executeDigestOperation: vi.fn(),
}));

import { getActiveDigest } from '../digest/digestRepository.js';
import { executeDigestOperation } from '../digest/executeDigestOperation.js';

const mockedGetActiveDigest = vi.mocked(getActiveDigest);
const mockedExecuteDigestOperation = vi.mocked(executeDigestOperation);

const preferences = {
  language: 'en' as const,
  interests: ['react'] as const,
  digestTone: 'balanced' as const,
  digestFrequency: 'weekly' as const,
  preferredWeekday: 'monday' as const,
  preferredTime: '09:00',
  timezone: 'UTC',
};

const user: UserRecord = {
  preferences,
  latestDigestId: 'digest-active',
  nextDigestDueAt: '2026-05-18T09:00:00.000Z',
};

describe('scheduledDigestForUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('skips users who are not yet due', async () => {
    const result = await scheduledDigestForUser(
      'user-1',
      { ...user, nextDigestDueAt: '2099-01-01T00:00:00.000Z' },
      new Date('2026-05-18T12:00:00.000Z'),
    );

    expect(result).toEqual({ status: 'skipped', reason: 'not_due' });
    expect(mockedExecuteDigestOperation).not.toHaveBeenCalled();
  });

  it('skips users with a non-expired active digest', async () => {
    mockedGetActiveDigest.mockResolvedValue({
      id: 'digest-active',
      status: 'active',
      generatedAt: '2026-05-18T10:00:00.000Z',
      lastRefreshedAt: '2026-05-18T10:00:00.000Z',
      periodStart: '2026-05-11T09:00:00.000Z',
      periodEnd: '2026-05-18T09:00:00.000Z',
      expiresAt: '2026-05-25T09:00:00.000Z',
      summary: '',
      sections: {
        executiveSummary: '',
        topSignals: [],
        signalVsNoise: [],
        leadershipImplications: [],
        aiOrchestrationImplications: [],
        frontendArchitectureImplications: [],
        recommendedAction: '',
      },
      items: [],
      termOfDay: null,
      reflectionPrompt: '',
      refreshHistory: [{ at: '2026-05-18T10:00:00.000Z', type: 'created' }],
    });

    const result = await scheduledDigestForUser(
      'user-1',
      user,
      new Date('2026-05-18T12:00:00.000Z'),
    );

    expect(result).toEqual({ status: 'skipped', reason: 'active_not_expired' });
    expect(mockedExecuteDigestOperation).not.toHaveBeenCalled();
  });

  it('processes due users and returns updated nextDigestDueAt', async () => {
    mockedGetActiveDigest.mockResolvedValue(null);
    mockedExecuteDigestOperation.mockResolvedValue({
      runId: 'run-1',
      digestId: 'digest-new',
      outcome: 'created',
      supersededDigestId: null,
      nextDigestDueAt: '2026-05-25T09:00:00.000Z',
    });

    const result = await scheduledDigestForUser(
      'user-1',
      user,
      new Date('2026-05-18T12:00:00.000Z'),
    );

    expect(result).toEqual({
      status: 'processed',
      digestId: 'digest-new',
      nextDigestDueAt: '2026-05-25T09:00:00.000Z',
      outcome: 'created',
    });
    expect(mockedExecuteDigestOperation).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'user-1', type: 'scheduled' }),
    );
  });
});
