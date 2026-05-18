import { normalizeCitationUrl } from '@/features/digest/normalizeCitationUrl';
import type { DigestItem } from '@/features/digest/types';

export function compareNewSourceItems(
  existingItems: readonly DigestItem[],
  candidateItems: readonly DigestItem[],
): DigestItem[] {
  const existingIds = new Set(existingItems.map((item) => item.id));
  const existingUrls = new Set(
    existingItems.map((item) => normalizeCitationUrl(item.citationUrl)),
  );

  return candidateItems.filter((item) => {
    if (existingIds.has(item.id)) {
      return false;
    }

    return !existingUrls.has(normalizeCitationUrl(item.citationUrl));
  });
}
