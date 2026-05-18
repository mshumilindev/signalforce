import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../firebaseAdmin.js';
import type {
  GenerationRunRecord,
  GenerationRunStatus,
  GenerationRunType,
} from './types.js';

interface StartGenerationRunInput {
  readonly uid: string;
  readonly type: GenerationRunType;
}

interface CompleteGenerationRunInput {
  readonly uid: string;
  readonly runId: string;
  readonly digestId: string;
  readonly outcome: string;
}

interface FailGenerationRunInput {
  readonly uid: string;
  readonly runId: string;
  readonly errorCode: string;
  readonly errorMessage: string;
}

function generationRunRef(uid: string, runId: string) {
  return adminDb.collection('users').doc(uid).collection('generationRuns').doc(runId);
}

export async function startGenerationRun(input: StartGenerationRunInput): Promise<string> {
  const reference = adminDb
    .collection('users')
    .doc(input.uid)
    .collection('generationRuns')
    .doc();

  await reference.set({
    type: input.type,
    status: 'running',
    startedAt: FieldValue.serverTimestamp(),
    completedAt: null,
    digestId: null,
    outcome: null,
    errorCode: null,
    errorMessage: null,
  });

  return reference.id;
}

export async function completeGenerationRun(input: CompleteGenerationRunInput): Promise<void> {
  await generationRunRef(input.uid, input.runId).set(
    {
      status: 'completed' satisfies GenerationRunStatus,
      completedAt: FieldValue.serverTimestamp(),
      digestId: input.digestId,
      outcome: input.outcome,
      errorCode: null,
      errorMessage: null,
    },
    { merge: true },
  );
}

export async function failGenerationRun(input: FailGenerationRunInput): Promise<void> {
  await generationRunRef(input.uid, input.runId).set(
    {
      status: 'failed' satisfies GenerationRunStatus,
      completedAt: FieldValue.serverTimestamp(),
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
    },
    { merge: true },
  );
}

export function mapGenerationRun(
  id: string,
  data: FirebaseFirestore.DocumentData,
): GenerationRunRecord {
  return {
    id,
    type: data.type as GenerationRunRecord['type'],
    status: data.status as GenerationRunRecord['status'],
    startedAt: timestampToIso(data.startedAt),
    completedAt: data.completedAt ? timestampToIso(data.completedAt) : null,
    digestId: typeof data.digestId === 'string' ? data.digestId : null,
    outcome: typeof data.outcome === 'string' ? data.outcome : null,
    errorCode: typeof data.errorCode === 'string' ? data.errorCode : null,
    errorMessage: typeof data.errorMessage === 'string' ? data.errorMessage : null,
  };
}

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date(0).toISOString();
}
