import { describe, expect, it, vi } from 'vitest';
import { fetchSources } from './fetchSources.js';
import type { FetchFn, SourceDefinition } from './types.js';

const RSS_FIXTURE = `<?xml version="1.0"?>
<rss><channel><item>
  <title>RSS fixture item</title>
  <link>https://example.com/rss-fixture</link>
  <guid>rss-fixture</guid>
</item></channel></rss>`;

const failingSource: SourceDefinition = {
  id: 'broken-feed',
  label: 'Broken Feed',
  type: 'rss',
  url: 'https://example.com/broken.xml',
  interests: ['react'],
};

const healthyRssSource: SourceDefinition = {
  id: 'healthy-feed',
  label: 'Healthy Feed',
  type: 'rss',
  url: 'https://example.com/healthy.xml',
  interests: ['react'],
};

const staticSource: SourceDefinition = {
  id: 'curated',
  label: 'Curated',
  type: 'static',
  interests: ['architecture'],
  staticItems: [
    {
      title: 'Static fixture item',
      citationUrl: 'https://example.com/static-fixture',
      publishedAt: '2026-05-18T00:00:00.000Z',
      externalId: 'static-fixture',
    },
  ],
};

describe('fetchSources', () => {
  it('fetches sources independently and keeps successful results when one fails', async () => {
    const fetchImpl = vi.fn<FetchFn>(async (url) => {
      if (url.includes('broken')) {
        throw new Error('Network failure');
      }

      return new Response(RSS_FIXTURE, { status: 200 });
    });

    const results = await fetchSources([failingSource, healthyRssSource, staticSource], {
      fetchImpl,
    });

    expect(results).toHaveLength(3);
    expect(results[0]?.error).toBe('Network failure');
    expect(results[0]?.items).toHaveLength(0);
    expect(results[1]?.error).toBeNull();
    expect(results[1]?.items[0]?.title).toBe('RSS fixture item');
    expect(results[2]?.error).toBeNull();
    expect(results[2]?.items[0]?.title).toBe('Static fixture item');
  });
});
