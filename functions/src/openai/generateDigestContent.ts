import type OpenAI from 'openai';
import type { DigestDocument, UserPreferences } from '../digest/types.js';
import { createOpenAiClient } from './client.js';
import { applyDigestContent } from './applyDigestContent.js';
import { buildDigestPrompt } from './buildDigestPrompt.js';
import { DigestContentValidationError, DigestGenerationError } from './errors.js';
import { buildFallbackDigestContent, isOpenAiConnectionError } from './fallbackDigestContent.js';
import { parseDigestContentJson } from './parseDigestContent.js';

export interface GenerateDigestContentInput {
  readonly preferences: UserPreferences;
  readonly digest: DigestDocument;
  readonly client?: OpenAI;
  readonly apiKey?: string;
  readonly model?: string;
}

const DEFAULT_MODEL = 'gpt-4o-mini';

export async function generateDigestContent(input: GenerateDigestContentInput) {
  if (input.digest.items.length === 0) {
    throw new DigestGenerationError('At least one source item is required for digest generation.');
  }

  const client = input.client ?? createOpenAiClient(input.apiKey);
  const { system, user } = buildDigestPrompt({
    preferences: input.preferences,
    digest: input.digest,
    items: input.digest.items,
  });

  const response = await client.chat.completions.create({
    model: input.model ?? DEFAULT_MODEL,
    temperature: 0.3,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });

  const rawContent = response.choices[0]?.message?.content;

  if (!rawContent) {
    throw new DigestContentValidationError('OpenAI returned an empty response.', []);
  }

  return parseDigestContentJson(rawContent);
}

export async function enrichDigestWithGeneratedContent(
  input: GenerateDigestContentInput,
): Promise<DigestDocument> {
  let content;

  try {
    content = await generateDigestContent(input);
  } catch (error) {
    if (!isOpenAiConnectionError(error) && !(error instanceof DigestContentValidationError)) {
      throw error;
    }

    console.warn('OpenAI digest content failed; using source-backed fallback digest content.', {
      digestId: input.digest.id,
      itemCount: input.digest.items.length,
      reason: error instanceof Error ? error.message : 'unknown',
    });

    content = buildFallbackDigestContent(input.digest);
  }

  return applyDigestContent(input.digest, content);
}
