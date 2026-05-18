import { describe, expect, it, vi } from 'vitest';
import type { UserPreferences } from '../digest/types.js';
import { collectDigestItems } from './collectDigestItems.js';
import type { FetchFn } from './types.js';

const preferences: UserPreferences = {
  language: 'en',
  interests: ['react', 'architecture'],
  digestTone: 'balanced',
  digestFrequency: 'weekly',
  preferredWeekday: 'monday',
  preferredTime: '09:00',
  timezone: 'UTC',
};

describe('collectDigestItems', () => {
  it('deduplicates across connectors before mapping to digest items', async () => {
    const fetchImpl = vi.fn<FetchFn>(async (url) => {
      if (url.includes('react.dev')) {
        return new Response(
          `<?xml version="1.0"?><rss><channel><item>
            <title>Shared URL item</title>
            <link>https://example.com/shared?utm_campaign=a</link>
            <guid>shared-a</guid>
          </item></channel></rss>`,
          { status: 200 },
        );
      }

      return new Response(
        `<?xml version="1.0"?><rss><channel><item>
          <title>Shared URL item duplicate</title>
          <link>https://example.com/shared</link>
          <guid>shared-b</guid>
          <pubDate>Sun, 18 May 2026 12:00:00 GMT</pubDate>
        </item></channel></rss>`,
        { status: 200 },
      );
    });

    const { items } = await collectDigestItems({
      preferences,
      referenceDate: new Date('2026-05-18T10:00:00.000Z'),
      fetchOptions: { fetchImpl },
    });

    const sharedItems = items.filter((item) => item.citationUrl.includes('/shared'));
    expect(sharedItems).toHaveLength(1);
    expect(sharedItems[0]?.title).toBe('Shared URL item duplicate');
  });
});
