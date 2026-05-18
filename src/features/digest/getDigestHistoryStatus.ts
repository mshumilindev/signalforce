import { isDigestExpired } from '@/features/digest/expiry';
import type { DigestDocument } from '@/features/digest/types';

export type DigestHistoryStatus = 'active' | 'superseded' | 'expired';

export function getDigestHistoryStatus(
  digest: Pick<DigestDocument, 'status' | 'expiresAt'>,
  referenceDate: Date = new Date(),
): DigestHistoryStatus {
  if (digest.status === 'superseded') {
    return 'superseded';
  }

  if (isDigestExpired(digest, referenceDate)) {
    return 'expired';
  }

  return 'active';
}
