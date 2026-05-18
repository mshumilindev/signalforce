import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { getDigestFreshness, type DigestFreshness } from '@/features/dashboard/digestFreshness';
import { getActiveDigest, getDigestById } from '@/features/digest/digestRepository';
import type { DigestDocument } from '@/features/digest/types';
import {
  callForceUpdateDigest,
  callRefreshDigest,
  type DigestCallableResponse,
} from '@/shared/firebase/digestFunctions';
import { mapCallableErrorToTranslationKey } from '@/shared/firebase/mapCallableError';
import type { TranslationKey } from '@/shared/i18n/translations';

export type DashboardViewState = 'loading' | 'ready' | 'empty' | 'error';

export interface UseDashboardDigestResult {
  readonly viewState: DashboardViewState;
  readonly digest: DigestDocument | null;
  readonly freshness: DigestFreshness | null;
  readonly nextDigestDueAt: string | null;
  readonly feedbackKey: TranslationKey | null;
  readonly errorKey: TranslationKey | null;
  readonly isRefreshing: boolean;
  readonly isForcing: boolean;
  readonly isActionPending: boolean;
  readonly reload: () => Promise<void>;
  readonly refreshDigest: () => Promise<void>;
  readonly forceUpdateDigest: () => Promise<void>;
}

function feedbackKeyForResult(
  result: DigestCallableResponse,
  force: boolean,
): TranslationKey {
  if (result.outcome === 'created' && !result.supersededDigestId) {
    return 'dashboard.feedback.created';
  }

  if (force) {
    return 'dashboard.feedback.forced';
  }

  return 'dashboard.feedback.refreshed';
}

export function useDashboardDigest(): UseDashboardDigestResult {
  const { firebaseUser, userDocument, refreshUserDocument } = useAuth();
  const [viewState, setViewState] = useState<DashboardViewState>('loading');
  const [digest, setDigest] = useState<DigestDocument | null>(null);
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [feedbackKey, setFeedbackKey] = useState<TranslationKey | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isForcing, setIsForcing] = useState(false);

  const preferences = userDocument?.preferences ?? null;
  const nextDigestDueAt = userDocument?.nextDigestDueAt ?? null;

  const loadDigest = useCallback(async () => {
    if (!firebaseUser) {
      return;
    }

    setViewState('loading');
    setErrorKey(null);

    try {
      const activeDigest = await getActiveDigest(firebaseUser.uid);
      setDigest(activeDigest);
      setViewState(activeDigest ? 'ready' : 'empty');
    } catch {
      setDigest(null);
      setViewState('error');
      setErrorKey('dashboard.errors.loadFailed');
    }
  }, [firebaseUser]);

  useEffect(() => {
    void loadDigest();
  }, [loadDigest]);

  const runLifecycleAction = useCallback(
    async (force: boolean) => {
      if (!firebaseUser || !preferences) {
        setErrorKey('dashboard.errors.preferencesRequired');
        setViewState('error');
        return;
      }

      setErrorKey(null);
      setFeedbackKey(null);

      if (force) {
        setIsForcing(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const result = force ? await callForceUpdateDigest() : await callRefreshDigest();

        await refreshUserDocument();

        const loadedDigest =
          (await getDigestById(firebaseUser.uid, result.digestId)) ??
          (await getActiveDigest(firebaseUser.uid));

        setDigest(loadedDigest);
        setViewState(loadedDigest ? 'ready' : 'error');
        setErrorKey(loadedDigest ? null : 'dashboard.errors.loadFailed');
        setFeedbackKey(loadedDigest ? feedbackKeyForResult(result, force) : null);
      } catch (error) {
        setDigest(null);
        setViewState('error');
        setErrorKey(mapCallableErrorToTranslationKey(error));
        setFeedbackKey(null);
      } finally {
        setIsRefreshing(false);
        setIsForcing(false);
      }
    },
    [firebaseUser, preferences, refreshUserDocument],
  );

  const freshness = useMemo(() => {
    if (!digest) {
      return null;
    }

    return getDigestFreshness(digest);
  }, [digest]);

  return {
    viewState,
    digest,
    freshness,
    nextDigestDueAt,
    feedbackKey,
    errorKey,
    isRefreshing,
    isForcing,
    isActionPending: isRefreshing || isForcing,
    reload: loadDigest,
    refreshDigest: () => runLifecycleAction(false),
    forceUpdateDigest: () => runLifecycleAction(true),
  };
}
