import { describe, expect, it, vi } from 'vitest';
import { enrichRawItemsWithPageImages, extractMainImageUrl } from './pageImage.js';
import type { FetchFn, RawSourceItem } from './types.js';

const item: RawSourceItem = {
  sourceId: 'react-blog',
  sourceLabel: 'React Blog',
  title: 'Fixture',
  citationUrl: 'https://example.com/posts/fixture',
  publishedAt: null,
  externalId: 'fixture',
};

describe('extractMainImageUrl', () => {
  it('extracts and resolves Open Graph images', () => {
    const html = '<meta property="og:image" content="/images/cover.png">';

    expect(extractMainImageUrl(html, item.citationUrl)).toBe(
      'https://example.com/images/cover.png',
    );
  });

  it('extracts Twitter card images', () => {
    const html = '<meta name="twitter:image" content="https://cdn.example.com/card.jpg">';

    expect(extractMainImageUrl(html, item.citationUrl)).toBe(
      'https://cdn.example.com/card.jpg',
    );
  });
});

describe('enrichRawItemsWithPageImages', () => {
  it('adds page images when source items do not already have one', async () => {
    const fetchImpl = vi.fn<FetchFn>(async () =>
      new Response('<meta property="og:image" content="/cover.jpg">', { status: 200 }),
    );

    const [enriched] = await enrichRawItemsWithPageImages([item], fetchImpl);

    expect(enriched?.imageUrl).toBe('https://example.com/cover.jpg');
  });

  it('preserves existing feed images without fetching the page', async () => {
    const fetchImpl = vi.fn<FetchFn>();

    const [enriched] = await enrichRawItemsWithPageImages(
      [{ ...item, imageUrl: 'https://cdn.example.com/feed.jpg' }],
      fetchImpl,
    );

    expect(enriched?.imageUrl).toBe('https://cdn.example.com/feed.jpg');
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
