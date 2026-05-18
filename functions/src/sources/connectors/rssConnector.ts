import { parseRssFeedXml } from '../parseRss.js';
import type { FetchFn, RawSourceItem, SourceConnector, SourceDefinition } from '../types.js';

const DEFAULT_TIMEOUT_MS = 10_000;

export function createRssConnector(fetchImpl: FetchFn = globalThis.fetch.bind(globalThis)): SourceConnector {
  return {
    type: 'rss',

    async fetch(source: SourceDefinition): Promise<readonly RawSourceItem[]> {
      if (!source.url) {
        throw new Error(`RSS source "${source.id}" is missing a feed URL.`);
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

      try {
        const response = await fetchImpl(source.url, {
          signal: controller.signal,
          headers: {
            Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
            'User-Agent': 'SignalForge/1.0 (+https://signalforge.app)',
          },
        });

        if (!response.ok) {
          throw new Error(`RSS feed responded with status ${response.status}.`);
        }

        const xml = await response.text();
        return parseRssFeedXml(xml, source.id, source.label);
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export const rssConnector = createRssConnector();
