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

export const digestItemSynopsisSchema = z.object({
  itemId: nonEmptyString,
  synopsis: nonEmptyString.max(220),
});

export const digestItemVisualSchema = z.object({
  itemId: nonEmptyString,
  imageAlt: nonEmptyString.max(160),
  imageSearchQuery: nonEmptyString.max(160),
});

export const digestContentSchema = z.object({
  summary: nonEmptyString,
  sections: digestSectionsSchema,
  itemSynopses: z.array(digestItemSynopsisSchema).min(1),
  itemVisuals: z.array(digestItemVisualSchema).min(1),
  termOfDay: digestTermOfDaySchema,
  reflectionPrompt: nonEmptyString,
});

export type ValidatedDigestContent = z.infer<typeof digestContentSchema>;
