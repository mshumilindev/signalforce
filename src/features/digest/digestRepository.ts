import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { getUserDocument } from '@/features/auth/userProfile';
import { mapDigestDocument } from '@/features/digest/mapDigest';
import type { DigestDocument } from '@/features/digest/types';
import { getFirestoreDb } from '@/shared/firebase/client';

const USERS_COLLECTION = 'users';
const DIGESTS_COLLECTION = 'digests';

function digestRef(uid: string, digestId: string) {
  return doc(getFirestoreDb(), USERS_COLLECTION, uid, DIGESTS_COLLECTION, digestId);
}

export async function listUserDigests(uid: string): Promise<DigestDocument[]> {
  const digestsQuery = query(
    collection(getFirestoreDb(), USERS_COLLECTION, uid, DIGESTS_COLLECTION),
    orderBy('generatedAt', 'desc'),
  );
  const snapshot = await getDocs(digestsQuery);

  return snapshot.docs.flatMap((document) => {
    const mapped = mapDigestDocument(document.id, document.data());
    return mapped ? [mapped] : [];
  });
}

export async function getDigestById(uid: string, digestId: string): Promise<DigestDocument | null> {
  const snapshot = await getDoc(digestRef(uid, digestId));

  if (!snapshot.exists()) {
    return null;
  }

  return mapDigestDocument(snapshot.id, snapshot.data());
}

export async function getActiveDigest(uid: string): Promise<DigestDocument | null> {
  const user = await getUserDocument(uid);

  if (!user?.latestDigestId) {
    return null;
  }

  return getDigestById(uid, user.latestDigestId);
}

