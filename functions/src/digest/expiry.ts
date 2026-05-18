import type { DigestDocument } from './types.js';

export function isDigestExpired(
  digest: Pick<DigestDocument, 'expiresAt'>,
  referenceDate: Date,
): boolean {
  return referenceDate.getTime() >= new Date(digest.expiresAt).getTime();
}
