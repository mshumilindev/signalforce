import { adminDb } from '../firebaseAdmin.js';
import { getUserRecord } from '../users/repository.js';
import { digestDocumentToFirestore, mapDigestDocument } from './mapDigest.js';
import type { DigestDocument } from './types.js';

const DIGESTS_COLLECTION = 'digests';

function digestRef(uid: string, digestId: string) {
  return adminDb.collection('users').doc(uid).collection(DIGESTS_COLLECTION).doc(digestId);
}

export async function getDigestById(uid: string, digestId: string): Promise<DigestDocument | null> {
  const snapshot = await digestRef(uid, digestId).get();

  if (!snapshot.exists) {
    return null;
  }

  return mapDigestDocument(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function getActiveDigest(uid: string): Promise<DigestDocument | null> {
  const user = await getUserRecord(uid);

  if (!user?.latestDigestId) {
    return null;
  }

  return getDigestById(uid, user.latestDigestId);
}

export async function saveDigest(uid: string, digest: DigestDocument): Promise<void> {
  await digestRef(uid, digest.id).set(digestDocumentToFirestore(digest), { merge: true });
}
