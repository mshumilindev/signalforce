import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getUserDocument } from '@/features/auth/userProfile';
import type { UserDocument } from '@/features/auth/types';
import type { UserPreferences } from '@/features/preferences/types';
import { assertPersistablePreferences } from '@/features/preferences/validation';
import { getFirestoreDb } from '@/shared/firebase/client';

const USERS_COLLECTION = 'users';

export async function saveUserPreferences(
  uid: string,
  preferences: UserPreferences,
): Promise<UserDocument> {
  assertPersistablePreferences(preferences);

  const db = getFirestoreDb();
  const reference = doc(db, USERS_COLLECTION, uid);

  await setDoc(
    reference,
    {
      preferences,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const savedDocument = await getUserDocument(uid);

  if (!savedDocument) {
    throw new Error('User document could not be loaded after saving preferences.');
  }

  return savedDocument;
}
