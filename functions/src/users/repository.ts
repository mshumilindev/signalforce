import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../firebaseAdmin.js';
import type { UserPreferences } from '../digest/types.js';

export interface UserRecord {
  readonly preferences: UserPreferences | null;
  readonly latestDigestId: string | null;
  readonly nextDigestDueAt: string | null;
}

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return null;
}

export async function getUserRecord(uid: string): Promise<UserRecord | null> {
  const snapshot = await adminDb.collection('users').doc(uid).get();

  if (!snapshot.exists) {
    return null;
  }

  const data = snapshot.data() ?? {};
  const preferences = data.preferences as UserPreferences | null | undefined;

  return {
    preferences: preferences ?? null,
    latestDigestId: typeof data.latestDigestId === 'string' ? data.latestDigestId : null,
    nextDigestDueAt: timestampToIso(data.nextDigestDueAt),
  };
}

export async function updateUserDigestPointers(
  uid: string,
  latestDigestId: string,
  nextDigestDueAt: string,
): Promise<void> {
  await adminDb.collection('users').doc(uid).set(
    {
      latestDigestId,
      nextDigestDueAt,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
