import {
  completeGenerationRun,
  failGenerationRun,
  startGenerationRun,
} from '../generationRuns/repository.js';
import type { GenerationRunType } from '../generationRuns/types.js';
import { toHttpsError } from '../errors.js';
import type { RunDigestLifecycleResult } from './digestLifecycleService.js';

interface ExecuteDigestOperationInput {
  readonly uid: string;
  readonly type: GenerationRunType;
  readonly operation: () => Promise<RunDigestLifecycleResult>;
}

export interface DigestCallableResponse {
  readonly runId: string;
  readonly digestId: string;
  readonly outcome: 'created' | 'refreshed';
  readonly supersededDigestId: string | null;
  readonly nextDigestDueAt: string;
}

export async function executeDigestOperation(
  input: ExecuteDigestOperationInput,
): Promise<DigestCallableResponse> {
  const runId = await startGenerationRun({ uid: input.uid, type: input.type });

  try {
    const result = await input.operation();

    await completeGenerationRun({
      uid: input.uid,
      runId,
      digestId: result.digestId,
      outcome: result.outcome.kind,
    });

    return {
      runId,
      digestId: result.digestId,
      outcome: result.outcome.kind,
      supersededDigestId: result.supersededDigestId,
      nextDigestDueAt: result.nextDigestDueAt,
    };
  } catch (error) {
    const httpsError = toHttpsError(error);

    console.error('Digest operation failed', {
      uid: input.uid,
      type: input.type,
      code: httpsError.code,
      message: httpsError.message,
      cause: error instanceof Error ? error.message : String(error),
    });

    await failGenerationRun({
      uid: input.uid,
      runId,
      errorCode: httpsError.code,
      errorMessage: httpsError.message,
    });

    throw httpsError;
  }
}
