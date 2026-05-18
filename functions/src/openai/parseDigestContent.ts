import type { z } from 'zod';
import { digestContentSchema, type ValidatedDigestContent } from './digestContentSchema.js';
import { DigestContentValidationError } from './errors.js';

function formatZodIssues(issues: z.ZodIssue[]): string[] {
  return issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });
}

export function parseDigestContentJson(raw: string): ValidatedDigestContent {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DigestContentValidationError('OpenAI response was not valid JSON.', []);
  }

  const result = digestContentSchema.safeParse(parsed);

  if (!result.success) {
    throw new DigestContentValidationError(
      'OpenAI response failed digest content validation.',
      formatZodIssues(result.error.issues),
    );
  }

  return result.data;
}
