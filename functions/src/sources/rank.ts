import type { RawSourceItem } from './types.js';

function publishedAtValue(publishedAt: string | null): number {
  if (!publishedAt) {
    return Number.NEGATIVE_INFINITY;
  }

  const value = Date.parse(publishedAt);
  return Number.isNaN(value) ? Number.NEGATIVE_INFINITY : value;
}

export function rankRawItems(items: readonly RawSourceItem[]): RawSourceItem[] {
  return [...items].sort((left, right) => {
    const scoreDelta = publishedAtValue(right.publishedAt) - publishedAtValue(left.publishedAt);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.title.localeCompare(right.title);
  });
}
