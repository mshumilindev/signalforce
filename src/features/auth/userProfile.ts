import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type { UserDocument, UserProfileFields } from '@/features/auth/types';
import { mapPreferences } from '@/features/preferences/mapPreferences';
import { getFirestoreDb } from '@/shared/firebase/client';

const USERS_COLLECTION = 'users';

function userDocumentRef(db: Firestore, uid: string): DocumentReference {
  return doc(db, USERS_COLLECTION, uid);
}

function buildProfileFields(user: User): UserProfileFields {
  return {
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

function toIsoString(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    const timestamp = value as { toDate: () => Date };
    return timestamp.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date(0).toISOString();
}

function mapUserDocument(data: Record<string, unknown>): UserDocument {
  const profile = data.profile as UserProfileFields | undefined;

  return {
    profile: {
      email: profile?.email ?? null,
      displayName: profile?.displayName ?? null,
      photoURL: profile?.photoURL ?? null,
    },
    preferences: mapPreferences(data.preferences),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
    latestDigestId: typeof data.latestDigestId === 'string' ? data.latestDigestId : null,
    nextDigestDueAt:
      data.nextDigestDueAt === null || data.nextDigestDueAt === undefined
        ? null
        : toIsoString(data.nextDigestDueAt),
  };
}

export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(userDocumentRef(db, uid));

  if (!snapshot.exists()) {
    return null;
  }

  return mapUserDocument(snapshot.data());
}

export async function ensureUserDocument(user: User): Promise<UserDocument> {
  const db = getFirestoreDb();
  const reference = userDocumentRef(db, user.uid);
  const snapshot = await getDoc(reference);
  const profile = buildProfileFields(user);

  if (!snapshot.exists()) {
    await setDoc(reference, {
      profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      latestDigestId: null,
      nextDigestDueAt: null,
    });
  } else {
    await setDoc(
      reference,
      {
        profile,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  const savedDocument = await getUserDocument(user.uid);

  if (!savedDocument) {
    throw new Error('User profile could not be loaded after save.');
  }

  return savedDocument;
}
