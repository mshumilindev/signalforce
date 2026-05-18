import { isDigestExpired } from '@/features/digest/expiry';
import type { DigestDocument } from '@/features/digest/types';

export type DigestFreshness = 'active' | 'expired';

export function getDigestFreshness(
  digest: Pick<DigestDocument, 'expiresAt'>,
  referenceDate: Date = new Date(),
): DigestFreshness {
  return isDigestExpired(digest, referenceDate) ? 'expired' : 'active';
}
