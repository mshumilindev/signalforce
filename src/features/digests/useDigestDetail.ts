import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getDigestById, listUserDigests } from '@/features/digest/digestRepository';
import { sortDigestsForHistory } from '@/features/digest/sortDigestsForHistory';
import type { DigestDocument } from '@/features/digest/types';
import type { TranslationKey } from '@/shared/i18n/translations';

export type DigestDetailViewState = 'loading' | 'ready' | 'notFound' | 'error';

export interface UseDigestDetailResult {
  readonly digest: DigestDocument | null;
  readonly newerDigest: DigestDocument | null;
  readonly olderDigest: DigestDocument | null;
  readonly viewState: DigestDetailViewState;
  readonly errorKey: TranslationKey | null;
  readonly reload: () => Promise<void>;
}

export function useDigestDetail(digestId: string | undefined): UseDigestDetailResult {
  const { firebaseUser } = useAuth();
  const [digest, setDigest] = useState<DigestDocument | null>(null);
  const [newerDigest, setNewerDigest] = useState<DigestDocument | null>(null);
  const [olderDigest, setOlderDigest] = useState<DigestDocument | null>(null);
  const [viewState, setViewState] = useState<DigestDetailViewState>('loading');
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);

  const loadDigest = useCallback(async () => {
    if (!firebaseUser || !digestId) {
      setDigest(null);
      setNewerDigest(null);
      setOlderDigest(null);
      setViewState('notFound');
      return;
    }

    setViewState('loading');
    setErrorKey(null);

    try {
      const [loaded, history] = await Promise.all([
        getDigestById(firebaseUser.uid, digestId),
        listUserDigests(firebaseUser.uid),
      ]);
      setDigest(loaded);

      if (!loaded) {
        setNewerDigest(null);
        setOlderDigest(null);
        setViewState('notFound');
        return;
      }

      const sortedHistory = sortDigestsForHistory(history);
      const currentIndex = sortedHistory.findIndex((historyDigest) => historyDigest.id === digestId);
      setNewerDigest(currentIndex > 0 ? sortedHistory[currentIndex - 1] ?? null : null);
      setOlderDigest(currentIndex >= 0 ? sortedHistory[currentIndex + 1] ?? null : null);
      setViewState('ready');
    } catch {
      setDigest(null);
      setNewerDigest(null);
      setOlderDigest(null);
      setViewState('error');
      setErrorKey('digests.errors.loadFailed');
    }
  }, [digestId, firebaseUser]);

  useEffect(() => {
    void loadDigest();
  }, [loadDigest]);

  return {
    digest,
    newerDigest,
    olderDigest,
    viewState,
    errorKey,
    reload: loadDigest,
  };
}
