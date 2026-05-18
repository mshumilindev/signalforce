import { listDueUsers } from '../users/listDueUsers.js';
import { scheduledDigestForUser, type ScheduledDigestResult } from './scheduledDigestForUser.js';

export interface ScheduledUserResult {
  readonly uid: string;
  readonly result: ScheduledDigestResult;
}

export interface ProcessScheduledDigestsSummary {
  readonly referenceDate: string;
  readonly candidateCount: number;
  readonly processedCount: number;
  readonly skippedCount: number;
  readonly failedCount: number;
  readonly results: readonly ScheduledUserResult[];
}

function summarizeResult(result: ScheduledDigestResult): 'processed' | 'skipped' | 'failed' {
  return result.status;
}

export async function processScheduledDigests(
  referenceDate: Date,
): Promise<ProcessScheduledDigestsSummary> {
  const dueUsers = await listDueUsers(referenceDate);

  const settled = await Promise.allSettled(
    dueUsers.map(async (user) => {
      const result = await scheduledDigestForUser(user.uid, user.record, referenceDate);
      return { uid: user.uid, result };
    }),
  );

  const results: ScheduledUserResult[] = settled.map((entry, index) => {
    const fallbackUid = dueUsers[index]?.uid ?? 'unknown';

    if (entry.status === 'fulfilled') {
      return entry.value;
    }

    const message =
      entry.reason instanceof Error
        ? entry.reason.message
        : 'Scheduled digest processing failed.';

    return {
      uid: fallbackUid,
      result: { status: 'failed', errorMessage: message },
    };
  });

  const processedCount = results.filter((entry) => summarizeResult(entry.result) === 'processed').length;
  const skippedCount = results.filter((entry) => summarizeResult(entry.result) === 'skipped').length;
  const failedCount = results.filter((entry) => summarizeResult(entry.result) === 'failed').length;

  return {
    referenceDate: referenceDate.toISOString(),
    candidateCount: dueUsers.length,
    processedCount,
    skippedCount,
    failedCount,
    results,
  };
}
