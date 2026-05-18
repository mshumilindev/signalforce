import { describe, expect, it } from 'vitest';
import { generateNewDigest } from './lifecycle.js';
import { mergeCreatedDigestItems } from './mergeCreatedDigestItems.js';
import type { DigestItem } from './types.js';

const item: DigestItem = {
  id: 'item-1',
  title: 'Fixture',
  sourceId: 'react-blog',
  sourceLabel: 'React Blog',
  citationUrl: 'https://example.com/fixture',
  addedAt: '2026-05-18T10:00:00.000Z',
};

describe('mergeCreatedDigestItems', () => {
  it('attaches fetched items to created digests', () => {
    const shell = generateNewDigest({
      digestId: 'digest-1',
      cadence: {
        frequency: 'weekly',
        timezone: 'UTC',
        preferredWeekday: 'monday',
        preferredTime: '09:00',
      },
      referenceDate: new Date('2026-05-18T10:00:00.000Z'),
    });

    const merged = mergeCreatedDigestItems(
      { kind: 'created', digest: shell, supersededDigestId: null },
      [item],
    );

    expect(merged.digest.items).toEqual([item]);
  });

  it('leaves refreshed digests unchanged', () => {
    const digest = { ...generateNewDigest({
      digestId: 'digest-1',
      cadence: {
        frequency: 'weekly',
        timezone: 'UTC',
        preferredWeekday: 'monday',
        preferredTime: '09:00',
      },
      referenceDate: new Date('2026-05-18T10:00:00.000Z'),
    }), items: [item] };

    const merged = mergeCreatedDigestItems({ kind: 'refreshed', digest }, [item]);

    expect(merged).toEqual({ kind: 'refreshed', digest });
  });
});
