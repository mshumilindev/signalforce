import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { requireAuthUid } from './auth/requireAuth.js';
import { executeDigestOperation } from './digest/executeDigestOperation.js';
import {
  forceUpdateDigestForUser,
  generateDigestForUser,
  refreshDigestForUser,
} from './digest/digestLifecycleService.js';
import { parseUserPreferences } from './preferences/validateUserPreferences.js';
import { defaultUserPreferences } from './preferences/defaultPreferences.js';
import { getUserRecord } from './users/repository.js';
import { openAiApiKeySecret } from './openai/secrets.js';
import { processScheduledDigests } from './scheduler/processScheduledDigests.js';
import { checkSourcePreviewAvailability } from './sources/previewAvailability.js';
import './firebaseAdmin.js';

const region = 'europe-west1';
const callableOptions = {
  region,
  secrets: [openAiApiKeySecret],
  timeoutSeconds: 120,
};

async function requireUserPreferences(uid: string) {
  const user = await getUserRecord(uid);

  if (!user?.preferences) {
    return defaultUserPreferences;
  }

  try {
    return parseUserPreferences(user.preferences);
  } catch {
    throw new HttpsError('failed-precondition', 'User preferences are invalid.');
  }
}

export const generateDigest = onCall(callableOptions, async (request) => {
  const uid = requireAuthUid(request);
  const preferences = await requireUserPreferences(uid);
  const referenceDate = new Date();

  return executeDigestOperation({
    uid,
    type: 'generate',
    operation: () => generateDigestForUser(uid, preferences, referenceDate),
  });
});

export const refreshDigest = onCall(callableOptions, async (request) => {
  const uid = requireAuthUid(request);
  const preferences = await requireUserPreferences(uid);
  const referenceDate = new Date();

  return executeDigestOperation({
    uid,
    type: 'refresh',
    operation: () => refreshDigestForUser(uid, preferences, referenceDate),
  });
});

export const forceUpdateDigest = onCall(callableOptions, async (request) => {
  const uid = requireAuthUid(request);
  const preferences = await requireUserPreferences(uid);
  const referenceDate = new Date();

  return executeDigestOperation({
    uid,
    type: 'forceUpdate',
    operation: () => forceUpdateDigestForUser(uid, preferences, referenceDate),
  });
});

export const checkSourcePreview = onCall({ region, timeoutSeconds: 30 }, async (request) => {
  requireAuthUid(request);

  const url = request.data?.url;
  if (typeof url !== 'string') {
    throw new HttpsError('invalid-argument', 'Source URL is required.');
  }

  return checkSourcePreviewAvailability(url);
});

export const scheduledDigestGeneration = onSchedule(
  {
    schedule: 'every 1 hours',
    region,
    timeZone: 'UTC',
    secrets: [openAiApiKeySecret],
  },
  async () => {
    const summary = await processScheduledDigests(new Date());

    console.info('Scheduled digest generation finished', {
      referenceDate: summary.referenceDate,
      candidateCount: summary.candidateCount,
      processedCount: summary.processedCount,
      skippedCount: summary.skippedCount,
      failedCount: summary.failedCount,
    });
  },
);
