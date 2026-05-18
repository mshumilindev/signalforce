import type OpenAI from 'openai';
import type { DigestDocument, DigestItem, UserPreferences } from '../digest/types.js';
import { applyDigestContent } from './applyDigestContent.js';
import { buildDigestRefreshPrompt } from './buildDigestRefreshPrompt.js';
import { createOpenAiClient } from './client.js';
import { DigestContentValidationError } from './errors.js';
import { parseDigestContentJson } from './parseDigestContent.js';

export interface GenerateDigestRefreshContentInput {
  readonly preferences: UserPreferences;
  readonly digest: DigestDocument;
  readonly newItems: readonly DigestItem[];
  readonly client?: OpenAI;
  readonly apiKey?: string;
  readonly model?: string;
}

const DEFAULT_MODEL = 'gpt-4o-mini';

export async function generateDigestRefreshContent(input: GenerateDigestRefreshContentInput) {
  if (input.newItems.length === 0) {
    throw new Error('Refresh content generation requires at least one new item.');
  }

  const client = input.client ?? createOpenAiClient(input.apiKey);
  const { system, user } = buildDigestRefreshPrompt({
    preferences: input.preferences,
    digest: input.digest,
    newItems: input.newItems,
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
    throw new DigestContentValidationError('OpenAI returned an empty refresh response.', []);
  }

  return parseDigestContentJson(rawContent);
}

export async function enrichRefreshedDigestContent(
  input: GenerateDigestRefreshContentInput,
): Promise<DigestDocument> {
  const content = await generateDigestRefreshContent(input);
  return applyDigestContent(input.digest, content);
}
