import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import type { DigestItem } from '@/features/digest/types';
import { mapSavedItemRecord, savedItemToFirestore } from '@/features/saved/mapSavedItem';
import type { SavedItemRecord, SaveDigestItemInput } from '@/features/saved/types';
import { validateSavedItemInput } from '@/features/saved/validateSavedItemInput';
import { getFirestoreDb } from '@/shared/firebase/client';

const USERS_COLLECTION = 'users';
const SAVED_ITEMS_COLLECTION = 'savedItems';

function savedItemRef(uid: string, itemId: string) {
  return doc(getFirestoreDb(), USERS_COLLECTION, uid, SAVED_ITEMS_COLLECTION, itemId);
}

export async function listSavedItems(uid: string): Promise<SavedItemRecord[]> {
  const savedQuery = query(
    collection(getFirestoreDb(), USERS_COLLECTION, uid, SAVED_ITEMS_COLLECTION),
    orderBy('savedAt', 'desc'),
  );
  const snapshot = await getDocs(savedQuery);

  return snapshot.docs.flatMap((document) => {
    const mapped = mapSavedItemRecord(document.id, document.data());
    return mapped ? [mapped] : [];
  });
}

export async function getSavedItem(uid: string, itemId: string): Promise<SavedItemRecord | null> {
  const snapshot = await getDoc(savedItemRef(uid, itemId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapSavedItemRecord(snapshot.id, snapshot.data());
}

export async function saveDigestItem(
  uid: string,
  input: SaveDigestItemInput,
): Promise<SavedItemRecord> {
  validateSavedItemInput(input);

  const savedAt = new Date().toISOString();

  await setDoc(
    savedItemRef(uid, input.itemId),
    savedItemToFirestore(input, savedAt),
    { merge: true },
  );

  const saved = await getSavedItem(uid, input.itemId);

  if (!saved) {
    throw new Error('Saved item could not be loaded after save.');
  }

  return saved;
}

export function saveDigestItemFromDigestItem(
  uid: string,
  digestId: string,
  item: DigestItem,
): Promise<SavedItemRecord> {
  return saveDigestItem(uid, {
    itemId: item.id,
    digestId,
    title: item.title,
    sourceId: item.sourceId,
    sourceLabel: item.sourceLabel,
    citationUrl: item.citationUrl,
  });
}

export async function unsaveDigestItem(uid: string, itemId: string): Promise<void> {
  await deleteDoc(savedItemRef(uid, itemId));
}
