import { refreshActiveDigest } from './lifecycle.js';
import type { DigestDocument, DigestItem } from './types.js';

export interface RefreshActiveDigestInPlaceInput {
  readonly digest: DigestDocument;
  readonly newItems: readonly DigestItem[];
  readonly referenceDate: Date;
}

export interface RefreshActiveDigestInPlaceResult {
  readonly digest: DigestDocument;
  readonly appendedItems: readonly DigestItem[];
}

export function refreshActiveDigestInPlace(
  input: RefreshActiveDigestInPlaceInput,
): RefreshActiveDigestInPlaceResult {
  const refreshed = refreshActiveDigest(input.digest, input.newItems, input.referenceDate);

  const existingIds = new Set(input.digest.items.map((item) => item.id));
  const appendedItems = refreshed.items.filter((item) => !existingIds.has(item.id));

  return {
    digest: refreshed,
    appendedItems,
  };
}
