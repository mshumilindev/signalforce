import { describe, expect, it } from 'vitest';
import { calculateDigestWindow } from '@/features/digest/cadence';
import { isDigestExpired } from '@/features/digest/expiry';
import { compareNewSourceItems } from '@/features/digest/compareNewSourceItems';
import {
  forceUpdateDigest,
  generateNewDigest,
  refreshActiveDigest,
  resolveDigestLifecycle,
} from '@/features/digest/lifecycle';
import type { DigestCadenceInput, DigestDocument, DigestItem } from '@/features/digest/types';

const weeklyCadence: DigestCadenceInput = {
  frequency: 'weekly',
  timezone: 'UTC',
  preferredWeekday: 'monday',
  preferredTime: '09:00',
};

function createActiveDigest(overrides: Partial<DigestDocument> = {}): DigestDocument {
  const referenceDate = new Date('2026-05-18T10:00:00.000Z');
  const base = generateNewDigest({
    digestId: 'digest-1',
    cadence: weeklyCadence,
    referenceDate,
  });

  return { ...base, ...overrides };
}

const sampleItem: DigestItem = {
  id: 'item-1',
  title: 'React 19 release notes',
  sourceId: 'react',
  sourceLabel: 'React',
  citationUrl: 'https://react.dev/blog',
  addedAt: '2026-05-18T10:05:00.000Z',
};

describe('isDigestExpired', () => {
  it('returns false before expiresAt', () => {
    const digest = createActiveDigest({ expiresAt: '2026-05-25T09:00:00.000Z' });

    expect(isDigestExpired(digest, new Date('2026-05-20T09:00:00.000Z'))).toBe(false);
  });

  it('returns true at or after expiresAt', () => {
    const digest = createActiveDigest({ expiresAt: '2026-05-25T09:00:00.000Z' });

    expect(isDigestExpired(digest, new Date('2026-05-25T09:00:00.000Z'))).toBe(true);
  });
});

describe('calculateDigestWindow', () => {
  it('builds a weekly window ending on the preferred weekday and time', () => {
    const window = calculateDigestWindow(weeklyCadence, new Date('2026-05-20T12:00:00.000Z'));

    expect(window.periodEnd).toBe('2026-05-18T09:00:00.000Z');
    expect(window.periodStart).toBe('2026-05-11T09:00:00.000Z');
    expect(window.expiresAt).toBe('2026-05-25T09:00:00.000Z');
  });
});

describe('generateNewDigest', () => {
  it('creates an active digest with lifecycle timestamps', () => {
    const digest = generateNewDigest({
      digestId: 'digest-new',
      cadence: weeklyCadence,
      referenceDate: new Date('2026-05-18T10:00:00.000Z'),
    });

    expect(digest.status).toBe('active');
    expect(digest.generatedAt).toBe('2026-05-18T10:00:00.000Z');
    expect(digest.lastRefreshedAt).toBe('2026-05-18T10:00:00.000Z');
    expect(digest.items).toEqual([]);
    expect(digest.refreshHistory[0]?.type).toBe('created');
  });
});

describe('compareNewSourceItems', () => {
  it('filters duplicate URLs and ids', () => {
    const existing = [sampleItem];
    const candidates = [
      sampleItem,
      { ...sampleItem, id: 'item-2', citationUrl: 'https://react.dev/blog?utm_source=x' },
      {
        ...sampleItem,
        id: 'item-3',
        citationUrl: 'https://example.com/new',
        title: 'New',
      },
    ];

    const result = compareNewSourceItems(existing, candidates);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('item-3');
  });
});

describe('refreshActiveDigest', () => {
  it('preserves cadence timestamps and appends only new items', () => {
    const active = createActiveDigest();
    const refreshed = refreshActiveDigest(active, [sampleItem], new Date('2026-05-18T11:00:00.000Z'));

    expect(refreshed.generatedAt).toBe(active.generatedAt);
    expect(refreshed.periodStart).toBe(active.periodStart);
    expect(refreshed.periodEnd).toBe(active.periodEnd);
    expect(refreshed.expiresAt).toBe(active.expiresAt);
    expect(refreshed.lastRefreshedAt).toBe('2026-05-18T11:00:00.000Z');
    expect(refreshed.items).toHaveLength(1);
    expect(refreshed.refreshHistory.at(-1)?.type).toBe('refreshed');
  });

  it('updates lastRefreshedAt even when there are no new items', () => {
    const active = createActiveDigest();
    const refreshed = refreshActiveDigest(active, [], new Date('2026-05-18T11:30:00.000Z'));

    expect(refreshed.items).toHaveLength(0);
    expect(refreshed.lastRefreshedAt).toBe('2026-05-18T11:30:00.000Z');
    expect(refreshed.expiresAt).toBe(active.expiresAt);
  });

  it('throws when digest is expired', () => {
    const expired = createActiveDigest({ expiresAt: '2026-05-11T09:00:00.000Z' });

    expect(() =>
      refreshActiveDigest(expired, [sampleItem], new Date('2026-05-18T11:00:00.000Z')),
    ).toThrow('Expired digests cannot be refreshed in place.');
  });
});

describe('forceUpdateDigest', () => {
  it('creates a new digest window and supersedes the previous id', () => {
    const active = createActiveDigest();
    const result = forceUpdateDigest(
      active,
      weeklyCadence,
      'digest-2',
      new Date('2026-05-26T12:00:00.000Z'),
    );

    expect(result.supersededDigestId).toBe('digest-1');
    expect(result.newDigest.id).toBe('digest-2');
    expect(result.newDigest.generatedAt).toBe('2026-05-26T12:00:00.000Z');
    expect(result.newDigest.periodEnd).not.toBe(active.periodEnd);
    expect(result.newDigest.expiresAt).not.toBe(active.expiresAt);
  });
});

describe('resolveDigestLifecycle', () => {
  it('refreshes an active digest in place when it is not expired', () => {
    const active = createActiveDigest();
    const outcome = resolveDigestLifecycle({
      activeDigest: active,
      cadence: weeklyCadence,
      referenceDate: new Date('2026-05-18T11:00:00.000Z'),
      newItems: [sampleItem],
      force: false,
      newDigestId: 'ignored',
    });

    expect(outcome.kind).toBe('refreshed');
    if (outcome.kind === 'refreshed') {
      expect(outcome.digest.id).toBe(active.id);
      expect(outcome.digest.expiresAt).toBe(active.expiresAt);
    }
  });

  it('creates a new digest when the active digest is expired', () => {
    const expired = createActiveDigest({ expiresAt: '2026-05-11T09:00:00.000Z' });
    const outcome = resolveDigestLifecycle({
      activeDigest: expired,
      cadence: weeklyCadence,
      referenceDate: new Date('2026-05-20T12:00:00.000Z'),
      newItems: [],
      force: false,
      newDigestId: 'digest-next',
    });

    expect(outcome.kind).toBe('created');
    if (outcome.kind === 'created') {
      expect(outcome.digest.id).toBe('digest-next');
      expect(outcome.supersededDigestId).toBe('digest-1');
      expect(outcome.digest.periodEnd).toBe('2026-05-18T09:00:00.000Z');
    }
  });

  it('creates a new digest on force update and resets cadence', () => {
    const active = createActiveDigest();
    const outcome = resolveDigestLifecycle({
      activeDigest: active,
      cadence: weeklyCadence,
      referenceDate: new Date('2026-05-26T12:00:00.000Z'),
      newItems: [],
      force: true,
      newDigestId: 'digest-forced',
    });

    expect(outcome.kind).toBe('created');
    if (outcome.kind === 'created') {
      expect(outcome.digest.id).toBe('digest-forced');
      expect(outcome.supersededDigestId).toBe('digest-1');
      expect(outcome.digest.expiresAt).not.toBe(active.expiresAt);
    }
  });
});
