import type { DigestItem, UserPreferences } from '../digest/types.js';
import { deduplicateRawItems } from './deduplicate.js';
import { fetchSources, type FetchSourcesOptions } from './fetchSources.js';
import { rankRawItems } from './rank.js';
import { resolveSourcesForPreferences } from './registry.js';
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
  const items = toDigestItems(ranked, input.referenceDate);

  return { items, sourceResults };
}
