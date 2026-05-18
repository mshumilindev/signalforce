export const generationRunTypes = ['generate', 'refresh', 'forceUpdate', 'scheduled'] as const;
export type GenerationRunType = (typeof generationRunTypes)[number];

export const generationRunStatuses = ['running', 'completed', 'failed'] as const;
export type GenerationRunStatus = (typeof generationRunStatuses)[number];

export interface GenerationRunRecord {
  readonly id: string;
  readonly type: GenerationRunType;
  readonly status: GenerationRunStatus;
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly digestId: string | null;
  readonly outcome: string | null;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
}
