import { describe, expect, it } from 'vitest';
import { getDigestHistoryStatus } from '@/features/digest/getDigestHistoryStatus';
import { sortDigestsForHistory } from '@/features/digest/sortDigestsForHistory';
import type { DigestDocument } from '@/features/digest/types';

function digest(overrides: Partial<DigestDocument> & Pick<DigestDocument, 'id' | 'generatedAt'>): DigestDocument {
  return {
    id: overrides.id,
    status: overrides.status ?? 'active',
    generatedAt: overrides.generatedAt,
    lastRefreshedAt: overrides.lastRefreshedAt ?? overrides.generatedAt,
    periodStart: overrides.periodStart ?? '2026-05-11T09:00:00.000Z',
    periodEnd: overrides.periodEnd ?? '2026-05-18T09:00:00.000Z',
    expiresAt: overrides.expiresAt ?? '2026-05-25T09:00:00.000Z',
    summary: overrides.summary ?? '',
    sections: overrides.sections ?? {
      executiveSummary: '',
      topSignals: [],
      signalVsNoise: [],
      leadershipImplications: [],
      aiOrchestrationImplications: [],
      frontendArchitectureImplications: [],
      recommendedAction: '',
    },
    items: overrides.items ?? [],
    termOfDay: overrides.termOfDay ?? null,
    reflectionPrompt: overrides.reflectionPrompt ?? '',
    refreshHistory: overrides.refreshHistory ?? [{ at: overrides.generatedAt, type: 'created' }],
  };
}

describe('sortDigestsForHistory', () => {
  it('orders digests by generatedAt descending', () => {
    const sorted = sortDigestsForHistory([
      digest({ id: 'older', generatedAt: '2026-05-01T00:00:00.000Z' }),
      digest({ id: 'newer', generatedAt: '2026-05-18T00:00:00.000Z' }),
    ]);

    expect(sorted.map((entry) => entry.id)).toEqual(['newer', 'older']);
  });
});

describe('getDigestHistoryStatus', () => {
  it('marks superseded digests regardless of expiry', () => {
    const status = getDigestHistoryStatus(
      digest({
        id: 'superseded',
        status: 'superseded',
        generatedAt: '2026-05-01T00:00:00.000Z',
        expiresAt: '2099-01-01T00:00:00.000Z',
      }),
    );

    expect(status).toBe('superseded');
  });

  it('marks active digests as expired after expiresAt', () => {
    const status = getDigestHistoryStatus(
      digest({
        id: 'expired',
        generatedAt: '2026-05-01T00:00:00.000Z',
        expiresAt: '2026-05-10T00:00:00.000Z',
      }),
      new Date('2026-05-18T00:00:00.000Z'),
    );

    expect(status).toBe('expired');
  });
});
