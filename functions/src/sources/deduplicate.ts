import { normalizeCitationUrl } from './normalizeUrl.js';
import type { RawSourceItem } from './types.js';

function publishedAtValue(publishedAt: string | null): number {
  if (!publishedAt) {
    return 0;
  }

  const value = Date.parse(publishedAt);
  return Number.isNaN(value) ? 0 : value;
}

function pickPreferredItem(existing: RawSourceItem, candidate: RawSourceItem): RawSourceItem {
  const existingScore = publishedAtValue(existing.publishedAt);
  const candidateScore = publishedAtValue(candidate.publishedAt);

  if (candidateScore > existingScore) {
    return candidate;
  }

  if (candidateScore < existingScore) {
    return existing;
  }

  return candidate.title.length > existing.title.length ? candidate : existing;
}

export function deduplicateRawItems(items: readonly RawSourceItem[]): RawSourceItem[] {
  const byUrl = new Map<string, RawSourceItem>();

  for (const item of items) {
    const key = normalizeCitationUrl(item.citationUrl);
    const existing = byUrl.get(key);

    if (!existing) {
      byUrl.set(key, item);
      continue;
    }

    byUrl.set(key, pickPreferredItem(existing, item));
  }

  return [...byUrl.values()];
}
