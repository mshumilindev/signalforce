import type { z } from 'zod';
import { digestContentSchema, type ValidatedDigestContent } from './digestContentSchema.js';
import { DigestContentValidationError } from './errors.js';

const STRING_LIST_SECTION_KEYS = [
  'topSignals',
  'signalVsNoise',
  'leadershipImplications',
  'aiOrchestrationImplications',
  'frontendArchitectureImplications',
] as const;

function coerceStringList(value: unknown): unknown {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function normalizeDigestContentPayload(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== 'object') {
    return parsed;
  }

  const record = parsed as Record<string, unknown>;
  const sections = record.sections;

  if (!sections || typeof sections !== 'object') {
    return parsed;
  }

  const sectionRecord = sections as Record<string, unknown>;
  const normalizedSections = { ...sectionRecord };

  for (const key of STRING_LIST_SECTION_KEYS) {
    if (key in normalizedSections) {
      normalizedSections[key] = coerceStringList(normalizedSections[key]);
    }
  }

  return {
    ...record,
    sections: normalizedSections,
  };
}

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

  const result = digestContentSchema.safeParse(normalizeDigestContentPayload(parsed));

  if (!result.success) {
    throw new DigestContentValidationError(
      'OpenAI response failed digest content validation.',
      formatZodIssues(result.error.issues),
    );
  }

  return result.data;
}
