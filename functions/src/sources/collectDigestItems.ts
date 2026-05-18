import type { DigestItem, UserPreferences } from '../digest/types.js';
import { deduplicateRawItems } from './deduplicate.js';
import { fetchSources, type FetchSourcesOptions } from './fetchSources.js';
import { rankRawItems } from './rank.js';
import { FALLBACK_SOURCE_ID, resolveSourcesForPreferences, SOURCE_REGISTRY } from './registry.js';
import { toDigestItems } from './toDigestItems.js';

export interface CollectDigestItemsInput {
  readonly preferences: UserPreferences;
  readonly referenceDate: Date;
  readonly fetchOptions?: FetchSourcesOptions;
}

export interface CollectDigestItemsResult {
  readonly items: readonly DigestItem[];
  readonly sourceResults: Awaited<ReturnType<typeof fetchSources>>;
}

export async function collectDigestItems(
  input: CollectDigestItemsInput,
): Promise<CollectDigestItemsResult> {
  const sources = resolveSourcesForPreferences(input.preferences);
  const sourceResults = await fetchSources(sources, input.fetchOptions ?? {});

  const rawItems = sourceResults.flatMap((result) => result.items);
  const deduped = deduplicateRawItems(rawItems);
  const ranked = rankRawItems(deduped);
  let items = toDigestItems(ranked, input.referenceDate);

  if (items.length === 0) {
    const fallbackSource = SOURCE_REGISTRY.find((source) => source.id === FALLBACK_SOURCE_ID);

    if (fallbackSource) {
      const [fallbackResult] = await fetchSources([fallbackSource], input.fetchOptions ?? {});
      const fallbackRanked = rankRawItems(deduplicateRawItems(fallbackResult?.items ?? []));
      items = toDigestItems(fallbackRanked, input.referenceDate);
    }
  }

  return { items, sourceResults };
}
