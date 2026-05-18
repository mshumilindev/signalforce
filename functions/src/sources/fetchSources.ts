import { getConnectorForSource } from './connectors/index.js';
import { createRssConnector } from './connectors/rssConnector.js';
import { enrichRawItemsWithPageImages } from './pageImage.js';
import type { FetchFn, SourceConnector, SourceDefinition, SourceFetchResult } from './types.js';

function resolveConnector(source: SourceDefinition, fetchImpl?: FetchFn): SourceConnector {
  if (source.type === 'rss' && fetchImpl) {
    return createRssConnector(fetchImpl);
  }

  return getConnectorForSource(source);
}

export interface FetchSourcesOptions {
  readonly fetchImpl?: FetchFn;
}

async function fetchSingleSource(
  source: SourceDefinition,
  fetchImpl?: FetchFn,
): Promise<SourceFetchResult> {
  try {
    const fetchedItems = await resolveConnector(source, fetchImpl).fetch(source);
    const items = fetchImpl
      ? await enrichRawItemsWithPageImages(fetchedItems, fetchImpl)
      : fetchedItems;

    return {
      sourceId: source.id,
      sourceLabel: source.label,
      items,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Source fetch failed.';

    return {
      sourceId: source.id,
      sourceLabel: source.label,
      items: [],
      error: message,
    };
  }
}

export async function fetchSources(
  sources: readonly SourceDefinition[],
  options: FetchSourcesOptions = {},
): Promise<SourceFetchResult[]> {
  const settled = await Promise.allSettled(
    sources.map((source) => fetchSingleSource(source, options.fetchImpl)),
  );

  return settled.map((result, index) => {
    const source = sources[index];

    if (!source) {
      return {
        sourceId: 'unknown',
        sourceLabel: 'Unknown source',
        items: [],
        error: 'Source definition missing.',
      };
    }

    if (result.status === 'fulfilled') {
      return result.value;
    }

    const message =
      result.reason instanceof Error ? result.reason.message : 'Source fetch failed.';

    return {
      sourceId: source.id,
      sourceLabel: source.label,
      items: [],
      error: message,
    };
  });
}
