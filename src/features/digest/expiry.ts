import type { DigestDocument } from '@/features/digest/types';

export function isDigestExpired(
  digest: Pick<DigestDocument, 'expiresAt'>,
  referenceDate: Date,
): boolean {
  return referenceDate.getTime() >= new Date(digest.expiresAt).getTime();
}
