import { calculateDigestWindow, calculateNextDigestDueAt } from '@/features/digest/cadence';
import { createEmptyDigestSections } from '@/features/digest/emptyDigestContent';
import { isDigestExpired } from '@/features/digest/expiry';
import type {
  DigestCadenceInput,
  DigestDocument,
  DigestItem,
  DigestLifecycleOutcome,
  ForceUpdateDigestResult,
  GenerateNewDigestInput,
} from '@/features/digest/types';
import { toIsoString } from '@/features/digest/timezone';

function createRefreshEvent(type: 'created' | 'refreshed', at: string) {
  return { at, type } as const;
}

export function generateNewDigest(input: GenerateNewDigestInput): DigestDocument {
  const { digestId, cadence, referenceDate } = input;
  const window = calculateDigestWindow(cadence, referenceDate);
  const timestamp = toIsoString(referenceDate);

  return {
    id: digestId,
    status: 'active',
    generatedAt: timestamp,
    lastRefreshedAt: timestamp,
    periodStart: window.periodStart,
    periodEnd: window.periodEnd,
    expiresAt: window.expiresAt,
    summary: '',
    sections: createEmptyDigestSections(),
    items: [],
    termOfDay: null,
    reflectionPrompt: '',
    refreshHistory: [createRefreshEvent('created', timestamp)],
  };
}

export function refreshActiveDigest(
  digest: DigestDocument,
  newItems: readonly DigestItem[],
  referenceDate: Date,
): DigestDocument {
  if (digest.status !== 'active') {
    throw new Error('Only active digests can be refreshed in place.');
  }

  if (isDigestExpired(digest, referenceDate)) {
    throw new Error('Expired digests cannot be refreshed in place.');
  }

  const refreshedAt = toIsoString(referenceDate);
  const existingItemIds = new Set(digest.items.map((item) => item.id));
  const appendedItems = newItems.filter((item) => !existingItemIds.has(item.id));

  if (appendedItems.length === 0) {
    return {
      ...digest,
      lastRefreshedAt: refreshedAt,
      refreshHistory: [...digest.refreshHistory, createRefreshEvent('refreshed', refreshedAt)],
    };
  }

  return {
    ...digest,
    generatedAt: digest.generatedAt,
    periodStart: digest.periodStart,
    periodEnd: digest.periodEnd,
    expiresAt: digest.expiresAt,
    lastRefreshedAt: refreshedAt,
    items: [...digest.items, ...appendedItems],
    refreshHistory: [...digest.refreshHistory, createRefreshEvent('refreshed', refreshedAt)],
  };
}

export function markDigestSuperseded(digest: DigestDocument, referenceDate: Date): DigestDocument {
  const at = toIsoString(referenceDate);

  return {
    ...digest,
    status: 'superseded',
    refreshHistory: [...digest.refreshHistory, { at, type: 'superseded' }],
  };
}

export function forceUpdateDigest(
  activeDigest: DigestDocument | null,
  cadence: DigestCadenceInput,
  newDigestId: string,
  referenceDate: Date,
): ForceUpdateDigestResult {
  const newDigest = generateNewDigest({
    digestId: newDigestId,
    cadence,
    referenceDate,
  });

  return {
    newDigest,
    supersededDigestId: activeDigest?.id ?? null,
  };
}

export function resolveDigestLifecycle(params: {
  readonly activeDigest: DigestDocument | null;
  readonly cadence: DigestCadenceInput;
  readonly referenceDate: Date;
  readonly newItems: readonly DigestItem[];
  readonly force: boolean;
  readonly newDigestId: string;
}): DigestLifecycleOutcome {
  const { activeDigest, cadence, referenceDate, newItems, force, newDigestId } = params;

  if (force) {
    const forced = forceUpdateDigest(activeDigest, cadence, newDigestId, referenceDate);
    return {
      kind: 'created',
      digest: forced.newDigest,
      supersededDigestId: forced.supersededDigestId,
    };
  }

  if (!activeDigest || isDigestExpired(activeDigest, referenceDate)) {
    const created = generateNewDigest({
      digestId: newDigestId,
      cadence,
      referenceDate,
    });

    return {
      kind: 'created',
      digest: created,
      supersededDigestId: activeDigest?.id ?? null,
    };
  }

  return {
    kind: 'refreshed',
    digest: refreshActiveDigest(activeDigest, newItems, referenceDate),
  };
}

export function getNextDigestDueAtForDigest(digest: DigestDocument): string {
  return calculateNextDigestDueAt({
    periodStart: digest.periodStart,
    periodEnd: digest.periodEnd,
    expiresAt: digest.expiresAt,
  });
}
