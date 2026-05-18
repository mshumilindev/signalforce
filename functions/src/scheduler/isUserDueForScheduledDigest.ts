import type { UserRecord } from '../users/repository.js';

function parseDueAt(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function isUserDueForScheduledDigest(
  user: UserRecord,
  referenceDate: Date,
): boolean {
  if (!user.preferences) {
    return false;
  }

  const dueAt = parseDueAt(user.nextDigestDueAt);

  if (dueAt === null) {
    return true;
  }

  return dueAt <= referenceDate.getTime();
}
