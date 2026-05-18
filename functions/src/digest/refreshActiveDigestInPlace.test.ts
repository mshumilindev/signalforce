import { describe, expect, it } from 'vitest';
import { generateNewDigest, resolveDigestLifecycle } from './lifecycle.js';
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

  it('does not create a new digest when yesterday digest is refreshed before expiry', () => {
    const digest = {
      ...generateNewDigest({
        digestId: 'digest-1',
        cadence,
        referenceDate: new Date('2026-05-17T09:15:00.000Z'),
      }),
      periodStart: '2026-05-11T09:00:00.000Z',
      periodEnd: '2026-05-18T09:00:00.000Z',
      expiresAt: '2026-05-25T09:00:00.000Z',
    };

    const resolved = resolveDigestLifecycle({
      activeDigest: digest,
      cadence,
      referenceDate: new Date('2026-05-18T12:00:00.000Z'),
      newItems: [newItem],
      force: false,
      newDigestId: 'should-not-be-used',
    });

    expect(resolved.kind).toBe('refreshed');
    if (resolved.kind !== 'refreshed') {
      return;
    }

    expect(resolved.digest.id).toBe('digest-1');
    expect(resolved.digest.generatedAt).toBe('2026-05-17T09:15:00.000Z');
    expect(resolved.digest.periodStart).toBe('2026-05-11T09:00:00.000Z');
    expect(resolved.digest.periodEnd).toBe('2026-05-18T09:00:00.000Z');
    expect(resolved.digest.expiresAt).toBe('2026-05-25T09:00:00.000Z');
    expect(resolved.digest.lastRefreshedAt).toBe('2026-05-18T12:00:00.000Z');
  });
});
