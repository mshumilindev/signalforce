import { z } from 'zod';
import {
  digestFrequencies,
  digestTones,
  supportedLanguages,
  userInterests,
  weekdays,
  type UserPreferences,
} from '../digest/types.js';

const preferredTimeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

const userPreferencesSchema = z
  .object({
    language: z.enum(supportedLanguages),
    interests: z
      .array(z.enum(userInterests))
      .min(1)
      .max(userInterests.length)
      .refine((interests) => new Set(interests).size === interests.length, {
        message: 'Interests must be unique.',
      }),
    digestTone: z.enum(digestTones),
    digestFrequency: z.enum(digestFrequencies),
    preferredWeekday: z.enum(weekdays).nullable(),
    preferredTime: preferredTimeSchema,
    timezone: z.string().min(1).max(80),
  })
  .strict()
  .superRefine((preferences, context) => {
    const requiresWeekday = preferences.digestFrequency !== 'daily';

    if (requiresWeekday && preferences.preferredWeekday === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'preferredWeekday is required for this digest frequency.',
        path: ['preferredWeekday'],
      });
    }

    if (!requiresWeekday && preferences.preferredWeekday !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'preferredWeekday must be null for daily digests.',
        path: ['preferredWeekday'],
      });
    }

    try {
      Intl.DateTimeFormat(undefined, { timeZone: preferences.timezone });
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'timezone is invalid.',
        path: ['timezone'],
      });
    }
  });

export function parseUserPreferences(value: unknown): UserPreferences {
  return userPreferencesSchema.parse(value);
}
