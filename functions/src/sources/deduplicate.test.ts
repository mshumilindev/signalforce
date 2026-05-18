import { describe, expect, it } from 'vitest';
import { deduplicateRawItems } from './deduplicate.js';
import type { RawSourceItem } from './types.js';

function item(overrides: Partial<RawSourceItem> & Pick<RawSourceItem, 'citationUrl' | 'title'>): RawSourceItem {
  return {
    sourceId: 'react-blog',
    sourceLabel: 'React Blog',
    publishedAt: '2026-05-01T00:00:00.000Z',
    externalId: overrides.citationUrl,
    ...overrides,
  };
}

describe('deduplicateRawItems', () => {
  it('collapses duplicate URLs after normalization', () => {
    const items = deduplicateRawItems([
      item({
        title: 'Older duplicate',
        citationUrl: 'https://example.com/post?utm_source=test',
        publishedAt: '2026-05-01T00:00:00.000Z',
      }),
      item({
        title: 'Newer duplicate',
        citationUrl: 'https://example.com/post',
        publishedAt: '2026-05-10T00:00:00.000Z',
      }),
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('Newer duplicate');
  });

  it('keeps distinct URLs', () => {
    const items = deduplicateRawItems([
      item({ title: 'First', citationUrl: 'https://example.com/a' }),
      item({ title: 'Second', citationUrl: 'https://example.com/b' }),
    ]);

    expect(items).toHaveLength(2);
  });
});
