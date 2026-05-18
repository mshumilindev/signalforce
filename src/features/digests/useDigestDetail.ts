import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getDigestById } from '@/features/digest/digestRepository';
import type { DigestDocument } from '@/features/digest/types';
import type { TranslationKey } from '@/shared/i18n/translations';

export type DigestDetailViewState = 'loading' | 'ready' | 'notFound' | 'error';

export interface UseDigestDetailResult {
  readonly digest: DigestDocument | null;
  readonly viewState: DigestDetailViewState;
  readonly errorKey: TranslationKey | null;
  readonly reload: () => Promise<void>;
}

export function useDigestDetail(digestId: string | undefined): UseDigestDetailResult {
  const { firebaseUser } = useAuth();
  const [digest, setDigest] = useState<DigestDocument | null>(null);
  const [viewState, setViewState] = useState<DigestDetailViewState>('loading');
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);

  const loadDigest = useCallback(async () => {
    if (!firebaseUser || !digestId) {
      setDigest(null);
      setViewState('notFound');
      return;
    }

    setViewState('loading');
    setErrorKey(null);

    try {
      const loaded = await getDigestById(firebaseUser.uid, digestId);
      setDigest(loaded);

      if (!loaded) {
        setViewState('notFound');
        return;
      }

      setViewState('ready');
    } catch {
      setDigest(null);
      setViewState('error');
      setErrorKey('digests.errors.loadFailed');
    }
  }, [digestId, firebaseUser]);

  useEffect(() => {
    void loadDigest();
  }, [loadDigest]);

  return {
    digest,
    viewState,
    errorKey,
    reload: loadDigest,
  };
}
