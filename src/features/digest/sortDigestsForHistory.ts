import type { DigestDocument } from '@/features/digest/types';

function generatedAtValue(digest: DigestDocument): number {
  const value = Date.parse(digest.generatedAt);
  return Number.isNaN(value) ? 0 : value;
}

export function sortDigestsForHistory(digests: readonly DigestDocument[]): DigestDocument[] {
  return [...digests].sort((left, right) => generatedAtValue(right) - generatedAtValue(left));
}
