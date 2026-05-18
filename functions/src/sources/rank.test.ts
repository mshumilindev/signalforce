import { describe, expect, it } from 'vitest';
import { rankRawItems } from './rank.js';
import type { RawSourceItem } from './types.js';

function item(publishedAt: string | null, title: string): RawSourceItem {
  return {
    sourceId: 'static',
    sourceLabel: 'Static',
    title,
    citationUrl: `https://example.com/${title}`,
    publishedAt,
    externalId: title,
  };
}

describe('rankRawItems', () => {
  it('orders items by publishedAt descending', () => {
    const ranked = rankRawItems([
      item('2026-05-01T00:00:00.000Z', 'older'),
      item('2026-05-18T00:00:00.000Z', 'newer'),
      item(null, 'undated'),
    ]);

    expect(ranked.map((entry) => entry.title)).toEqual(['newer', 'older', 'undated']);
  });
});
