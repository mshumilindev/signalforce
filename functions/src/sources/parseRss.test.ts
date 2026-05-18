import { describe, expect, it } from 'vitest';
import { parseRssFeedXml } from './parseRss.js';

const RSS_FIXTURE = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Fixture Post</title>
      <link>https://example.com/fixture-post</link>
      <guid>fixture-post</guid>
      <pubDate>Sun, 18 May 2026 10:00:00 GMT</pubDate>
      <media:thumbnail url="https://example.com/feed-image.jpg" />
    </item>
  </channel>
</rss>`;

describe('parseRssFeedXml', () => {
  it('parses RSS 2.0 items', () => {
    const items = parseRssFeedXml(RSS_FIXTURE, 'react-blog', 'React Blog');

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      title: 'Fixture Post',
      citationUrl: 'https://example.com/fixture-post',
      externalId: 'fixture-post',
      imageUrl: 'https://example.com/feed-image.jpg',
    });
    expect(items[0]?.publishedAt).toBeTruthy();
  });
});
