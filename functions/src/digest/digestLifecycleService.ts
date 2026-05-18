import { randomUUID } from 'node:crypto';
import { HttpsError } from 'firebase-functions/v2/https';
import {
  generateNewDigest,
  getNextDigestDueAtForDigest,
  markDigestSuperseded,
  resolveDigestLifecycle,
} from './lifecycle.js';
import { getActiveDigest, saveDigest } from './digestRepository.js';
import { isDigestExpired } from './expiry.js';
import { preferencesToCadence } from './preferencesToCadence.js';
import { mergeCreatedDigestItems } from './mergeCreatedDigestItems.js';
import { compareNewSourceItems } from './compareNewSourceItems.js';
import { refreshActiveDigestInPlace } from './refreshActiveDigestInPlace.js';
import { updateUserDigestPointers } from '../users/repository.js';
import { collectDigestItems } from '../sources/collectDigestItems.js';
import { enrichDigestWithGeneratedContent } from '../openai/generateDigestContent.js';
import { enrichRefreshedDigestContent } from '../openai/generateDigestRefreshContent.js';
import {
  DigestContentValidationError,
  DigestGenerationError,
} from '../openai/errors.js';
import type { DigestDocument, DigestItem, DigestLifecycleOutcome, UserPreferences } from './types.js';

async function loadItemsFromSources(
  preferences: UserPreferences,
  referenceDate: Date,
): Promise<readonly DigestItem[]> {
  const { items } = await collectDigestItems({ preferences, referenceDate });
  return items;
}

function mapDigestGenerationError(error: unknown): never {
  if (error instanceof DigestContentValidationError) {
    throw new HttpsError(
      'internal',
      'Generated digest content was malformed and could not be stored.',
    );
  }

  if (error instanceof DigestGenerationError) {
    throw new HttpsError('failed-precondition', error.message);
  }

  if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
    throw new HttpsError('failed-precondition', error.message);
  }

  throw error;
}

async function enrichCreatedDigestIfNeeded(
  digest: DigestDocument,
  preferences: UserPreferences,
): Promise<DigestDocument> {
  try {
    return await enrichDigestWithGeneratedContent({ preferences, digest });
  } catch (error) {
    mapDigestGenerationError(error);
  }
}

async function enrichRefreshedDigestIfNeeded(
  digest: DigestDocument,
  preferences: UserPreferences,
  newItems: readonly DigestItem[],
): Promise<DigestDocument> {
  try {
    return await enrichRefreshedDigestContent({ preferences, digest, newItems });
  } catch (error) {
    mapDigestGenerationError(error);
  }
}

export interface RunDigestLifecycleInput {
  readonly uid: string;
  readonly preferences: UserPreferences;
  readonly referenceDate: Date;
  readonly newItems: readonly DigestItem[];
  readonly force: boolean;
}

export interface RunDigestLifecycleResult {
  readonly outcome: DigestLifecycleOutcome;
  readonly supersededDigestId: string | null;
  readonly digestId: string;
  readonly nextDigestDueAt: string;
}

async function persistLifecycleOutcome(
  uid: string,
  activeDigest: DigestDocument | null,
  outcome: DigestLifecycleOutcome,
  referenceDate: Date,
  preferences: UserPreferences,
): Promise<RunDigestLifecycleResult> {
  let digestToSave = outcome.digest;

  if (outcome.kind === 'created') {
    digestToSave = await enrichCreatedDigestIfNeeded(digestToSave, preferences);
  }

  const enrichedOutcome: DigestLifecycleOutcome =
    outcome.kind === 'created'
      ? { ...outcome, digest: digestToSave }
      : outcome;

  if (enrichedOutcome.kind === 'created' && enrichedOutcome.supersededDigestId && activeDigest) {
    const superseded = markDigestSuperseded(activeDigest, referenceDate);
    await saveDigest(uid, superseded);
  }

  await saveDigest(uid, enrichedOutcome.digest);

  const nextDigestDueAt = getNextDigestDueAtForDigest(enrichedOutcome.digest);
  await updateUserDigestPointers(uid, enrichedOutcome.digest.id, nextDigestDueAt);

  return {
    outcome: enrichedOutcome,
    supersededDigestId:
      enrichedOutcome.kind === 'created' ? enrichedOutcome.supersededDigestId : null,
    digestId: enrichedOutcome.digest.id,
    nextDigestDueAt,
  };
}

export async function runDigestLifecycle(
  input: RunDigestLifecycleInput,
): Promise<RunDigestLifecycleResult> {
  const activeDigest = await getActiveDigest(input.uid);
  const cadence = preferencesToCadence(input.preferences);
  const newDigestId = randomUUID();
  const resolved = resolveDigestLifecycle({
    activeDigest,
    cadence,
    referenceDate: input.referenceDate,
    newItems: input.newItems,
    force: input.force,
    newDigestId,
  });
  const outcome = mergeCreatedDigestItems(resolved, input.newItems);

  return persistLifecycleOutcome(
    input.uid,
    activeDigest,
    outcome,
    input.referenceDate,
    input.preferences,
  );
}

export async function generateDigestForUser(
  uid: string,
  preferences: UserPreferences,
  referenceDate: Date,
): Promise<RunDigestLifecycleResult> {
  const activeDigest = await getActiveDigest(uid);

  if (activeDigest && !isDigestExpired(activeDigest, referenceDate)) {
    throw new HttpsError(
      'failed-precondition',
      'Active digest already exists and has not expired.',
    );
  }

  const cadence = preferencesToCadence(preferences);
  const newItems = await loadItemsFromSources(preferences, referenceDate);
  const created = generateNewDigest({
    digestId: randomUUID(),
    cadence,
    referenceDate,
  });

  const outcome: DigestLifecycleOutcome = {
    kind: 'created',
    digest: { ...created, items: newItems },
    supersededDigestId: activeDigest?.id ?? null,
  };

  return persistLifecycleOutcome(uid, activeDigest, outcome, referenceDate, preferences);
}

export async function refreshDigestForUser(
  uid: string,
  preferences: UserPreferences,
  referenceDate: Date,
): Promise<RunDigestLifecycleResult> {
  const activeDigest = await getActiveDigest(uid);

  if (!activeDigest || isDigestExpired(activeDigest, referenceDate)) {
    const newItems = await loadItemsFromSources(preferences, referenceDate);

    return runDigestLifecycle({
      uid,
      preferences,
      referenceDate,
      newItems,
      force: false,
    });
  }

  const fetchedItems = await loadItemsFromSources(preferences, referenceDate);
  const newItems = compareNewSourceItems(activeDigest.items, fetchedItems);
  const { digest: refreshed, appendedItems } = refreshActiveDigestInPlace({
    digest: activeDigest,
    newItems,
    referenceDate,
  });

  const digestToSave =
    appendedItems.length > 0
      ? await enrichRefreshedDigestIfNeeded(refreshed, preferences, appendedItems)
      : refreshed;

  await saveDigest(uid, digestToSave);

  const nextDigestDueAt = getNextDigestDueAtForDigest(digestToSave);
  await updateUserDigestPointers(uid, digestToSave.id, nextDigestDueAt);

  return {
    outcome: { kind: 'refreshed', digest: digestToSave },
    supersededDigestId: null,
    digestId: digestToSave.id,
    nextDigestDueAt,
  };
}

export async function forceUpdateDigestForUser(
  uid: string,
  preferences: UserPreferences,
  referenceDate: Date,
): Promise<RunDigestLifecycleResult> {
  const newItems = await loadItemsFromSources(preferences, referenceDate);

  return runDigestLifecycle({
    uid,
    preferences,
    referenceDate,
    newItems,
    force: true,
  });
}
