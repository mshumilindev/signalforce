import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);

const stringListSchema = z.array(nonEmptyString).min(1);

export const digestSectionsSchema = z.object({
  executiveSummary: nonEmptyString,
  topSignals: stringListSchema,
  signalVsNoise: z.array(nonEmptyString),
  leadershipImplications: z.array(nonEmptyString),
  aiOrchestrationImplications: z.array(nonEmptyString),
  frontendArchitectureImplications: z.array(nonEmptyString),
  recommendedAction: nonEmptyString,
});

export const digestTermOfDaySchema = z.object({
  term: nonEmptyString,
  explanation: nonEmptyString,
});

export const digestContentSchema = z.object({
  summary: nonEmptyString,
  sections: digestSectionsSchema,
  termOfDay: digestTermOfDaySchema.nullable(),
  reflectionPrompt: nonEmptyString,
});

export type ValidatedDigestContent = z.infer<typeof digestContentSchema>;
