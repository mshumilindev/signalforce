import { getActiveDigest } from '../digest/digestRepository.js';
import { executeDigestOperation } from '../digest/executeDigestOperation.js';
import { runDigestLifecycle } from '../digest/digestLifecycleService.js';
import { isDigestExpired } from '../digest/expiry.js';
import { collectDigestItems } from '../sources/collectDigestItems.js';
import type { UserPreferences } from '../digest/types.js';
import type { UserRecord } from '../users/repository.js';
import { isUserDueForScheduledDigest } from './isUserDueForScheduledDigest.js';

export type ScheduledDigestSkipReason =
  | 'not_due'
  | 'active_not_expired'
  | 'preferences_missing';

export interface ScheduledDigestSkipped {
  readonly status: 'skipped';
  readonly reason: ScheduledDigestSkipReason;
}

export interface ScheduledDigestProcessed {
  readonly status: 'processed';
  readonly digestId: string;
  readonly nextDigestDueAt: string;
  readonly outcome: 'created' | 'refreshed';
}

export interface ScheduledDigestFailed {
  readonly status: 'failed';
  readonly errorMessage: string;
}

export type ScheduledDigestResult =
  | ScheduledDigestSkipped
  | ScheduledDigestProcessed
  | ScheduledDigestFailed;

async function runScheduledDigestLifecycle(
  uid: string,
  preferences: UserPreferences,
  referenceDate: Date,
) {
  const { items } = await collectDigestItems({ preferences, referenceDate });

  return runDigestLifecycle({
    uid,
    preferences,
    referenceDate,
    newItems: items,
    force: false,
  });
}

export async function scheduledDigestForUser(
  uid: string,
  user: UserRecord,
  referenceDate: Date,
): Promise<ScheduledDigestResult> {
  if (!user.preferences) {
    return { status: 'skipped', reason: 'preferences_missing' };
  }

  if (!isUserDueForScheduledDigest(user, referenceDate)) {
    return { status: 'skipped', reason: 'not_due' };
  }

  const activeDigest = await getActiveDigest(uid);

  if (activeDigest && !isDigestExpired(activeDigest, referenceDate)) {
    return { status: 'skipped', reason: 'active_not_expired' };
  }

  try {
    const response = await executeDigestOperation({
      uid,
      type: 'scheduled',
      operation: () => runScheduledDigestLifecycle(uid, user.preferences!, referenceDate),
    });

    return {
      status: 'processed',
      digestId: response.digestId,
      nextDigestDueAt: response.nextDigestDueAt,
      outcome: response.outcome,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Scheduled digest generation failed.';

    return {
      status: 'failed',
      errorMessage: message,
    };
  }
}
