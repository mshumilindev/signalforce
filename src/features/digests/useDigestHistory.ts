import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { listUserDigests } from '@/features/digest/digestRepository';
import { sortDigestsForHistory } from '@/features/digest/sortDigestsForHistory';
import type { DigestDocument } from '@/features/digest/types';
import type { TranslationKey } from '@/shared/i18n/translations';

export type DigestHistoryViewState = 'loading' | 'ready' | 'empty' | 'error';

export interface UseDigestHistoryResult {
  readonly digests: readonly DigestDocument[];
  readonly viewState: DigestHistoryViewState;
  readonly errorKey: TranslationKey | null;
  readonly latestDigestId: string | null;
  readonly reload: () => Promise<void>;
}

export function useDigestHistory(): UseDigestHistoryResult {
  const { firebaseUser, userDocument } = useAuth();
  const [digests, setDigests] = useState<DigestDocument[]>([]);
  const [viewState, setViewState] = useState<DigestHistoryViewState>('loading');
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);

  const loadHistory = useCallback(async () => {
    if (!firebaseUser) {
      return;
    }

    setViewState('loading');
    setErrorKey(null);

    try {
      const loaded = sortDigestsForHistory(await listUserDigests(firebaseUser.uid));
      setDigests(loaded);
      setViewState(loaded.length > 0 ? 'ready' : 'empty');
    } catch {
      setDigests([]);
      setViewState('error');
      setErrorKey('digests.errors.loadFailed');
    }
  }, [firebaseUser]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return {
    digests,
    viewState,
    errorKey,
    latestDigestId: userDocument?.latestDigestId ?? null,
    reload: loadHistory,
  };
}
