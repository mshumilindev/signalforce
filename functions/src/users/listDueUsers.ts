import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../firebaseAdmin.js';
import { isUserDueForScheduledDigest } from '../scheduler/isUserDueForScheduledDigest.js';
import type { UserRecord } from './repository.js';

export interface SchedulableUser {
  readonly uid: string;
  readonly record: UserRecord;
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

function mapSchedulableUser(
  uid: string,
  data: FirebaseFirestore.DocumentData,
): SchedulableUser | null {
  const preferences = data.preferences as UserRecord['preferences'] | undefined;

  const record: UserRecord = {
    preferences: preferences ?? null,
    latestDigestId: typeof data.latestDigestId === 'string' ? data.latestDigestId : null,
    nextDigestDueAt: timestampToIso(data.nextDigestDueAt),
  };

  return { uid, record };
}

export async function listDueUsers(referenceDate: Date): Promise<SchedulableUser[]> {
  const dueAtIso = referenceDate.toISOString();
  const [dueSnapshot, unscheduledSnapshot] = await Promise.all([
    adminDb.collection('users').where('nextDigestDueAt', '<=', dueAtIso).get(),
    adminDb.collection('users').where('nextDigestDueAt', '==', null).get(),
  ]);

  const usersById = new Map<string, SchedulableUser>();

  for (const document of [...dueSnapshot.docs, ...unscheduledSnapshot.docs]) {
    const schedulable = mapSchedulableUser(document.id, document.data());

    if (!schedulable || !isUserDueForScheduledDigest(schedulable.record, referenceDate)) {
      continue;
    }

    usersById.set(schedulable.uid, schedulable);
  }

  return [...usersById.values()];
}
