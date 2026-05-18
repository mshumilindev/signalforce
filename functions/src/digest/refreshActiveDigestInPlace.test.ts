import { describe, expect, it } from 'vitest';
import { generateNewDigest } from './lifecycle.js';
import { refreshActiveDigestInPlace } from './refreshActiveDigestInPlace.js';
import type { DigestItem } from './types.js';

const cadence = {
  frequency: 'weekly' as const,
  timezone: 'UTC',
  preferredWeekday: 'monday' as const,
  preferredTime: '09:00',
};

const newItem: DigestItem = {
  id: 'item-new',
  title: 'New signal',
  sourceId: 'react-blog',
  sourceLabel: 'React Blog',
  citationUrl: 'https://example.com/new',
  addedAt: '2026-05-18T11:00:00.000Z',
};

describe('refreshActiveDigestInPlace', () => {
  it('preserves digest identity and cadence timestamps', () => {
    const digest = generateNewDigest({
      digestId: 'digest-1',
      cadence,
      referenceDate: new Date('2026-05-18T10:00:00.000Z'),
    });

    const { digest: refreshed, appendedItems } = refreshActiveDigestInPlace({
      digest,
      newItems: [newItem],
      referenceDate: new Date('2026-05-18T11:00:00.000Z'),
    });

    expect(refreshed.id).toBe('digest-1');
    expect(refreshed.generatedAt).toBe(digest.generatedAt);
    expect(refreshed.expiresAt).toBe(digest.expiresAt);
    expect(refreshed.periodStart).toBe(digest.periodStart);
    expect(refreshed.periodEnd).toBe(digest.periodEnd);
    expect(appendedItems).toEqual([newItem]);
    expect(refreshed.refreshHistory.at(-1)?.type).toBe('refreshed');
  });
});
