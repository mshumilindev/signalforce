import { createHash } from 'node:crypto';
import type { DigestItem } from '../digest/types.js';
import { normalizeCitationUrl } from './normalizeUrl.js';
import type { RawSourceItem } from './types.js';

export function stableDigestItemId(citationUrl: string): string {
  const normalized = normalizeCitationUrl(citationUrl);
  return createHash('sha256').update(normalized).digest('hex').slice(0, 32);
}

export function toDigestItems(items: readonly RawSourceItem[], addedAt: Date): DigestItem[] {
  const addedAtIso = addedAt.toISOString();

  return items.map((item) => ({
    id: stableDigestItemId(item.citationUrl),
    title: item.title,
    sourceId: item.sourceId,
    sourceLabel: item.sourceLabel,
    citationUrl: item.citationUrl,
    addedAt: addedAtIso,
  }));
}
