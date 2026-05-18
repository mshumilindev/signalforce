import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import type { DigestItem } from '@/features/digest/types';
import {
  listSavedItems,
  saveDigestItemFromDigestItem,
  unsaveDigestItem,
} from '@/features/saved/savedItemsRepository';
import type { SavedItemRecord } from '@/features/saved/types';
import type { TranslationKey } from '@/shared/i18n/translations';

export interface UseSavedItemsResult {
  readonly items: readonly SavedItemRecord[];
  readonly savedIds: ReadonlySet<string>;
  readonly viewState: 'loading' | 'ready' | 'empty' | 'error';
  readonly errorKey: TranslationKey | null;
  readonly isMutating: boolean;
  readonly reload: () => Promise<void>;
  readonly isSaved: (itemId: string) => boolean;
  readonly toggleSave: (digestId: string, item: DigestItem) => Promise<void>;
}

export function useSavedItems(): UseSavedItemsResult {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState<SavedItemRecord[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [viewState, setViewState] = useState<UseSavedItemsResult['viewState']>('loading');
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const loadSavedItems = useCallback(async () => {
    if (!firebaseUser) {
      return;
    }

    setViewState('loading');
    setErrorKey(null);

    try {
      const savedItems = await listSavedItems(firebaseUser.uid);
      setItems(savedItems);
      setSavedIds(new Set(savedItems.map((item) => item.itemId)));
      setViewState(savedItems.length > 0 ? 'ready' : 'empty');
    } catch {
      setItems([]);
      setSavedIds(new Set());
      setViewState('error');
      setErrorKey('saved.errors.loadFailed');
    }
  }, [firebaseUser]);

  useEffect(() => {
    void loadSavedItems();
  }, [loadSavedItems]);

  const isSaved = useCallback((itemId: string) => savedIds.has(itemId), [savedIds]);

  const toggleSave = useCallback(
    async (digestId: string, item: DigestItem) => {
      if (!firebaseUser) {
        return;
      }

      setIsMutating(true);
      setErrorKey(null);

      try {
        if (savedIds.has(item.id)) {
          await unsaveDigestItem(firebaseUser.uid, item.id);
          setSavedIds((current) => {
            const next = new Set(current);
            next.delete(item.id);
            return next;
          });
          setItems((current) => {
            const next = current.filter((saved) => saved.itemId !== item.id);
            setViewState(next.length === 0 ? 'empty' : 'ready');
            return next;
          });
        } else {
          const saved = await saveDigestItemFromDigestItem(firebaseUser.uid, digestId, item);
          setSavedIds((current) => new Set(current).add(item.id));
          setItems((current) => [saved, ...current.filter((entry) => entry.itemId !== item.id)]);
          setViewState('ready');
        }
      } catch {
        setErrorKey('saved.errors.saveFailed');
      } finally {
        setIsMutating(false);
      }
    },
    [firebaseUser, savedIds],
  );

  return {
    items,
    savedIds,
    viewState,
    errorKey,
    isMutating,
    reload: loadSavedItems,
    isSaved,
    toggleSave,
  };
}
