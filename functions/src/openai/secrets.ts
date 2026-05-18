import { defineSecret } from 'firebase-functions/params';

export const openAiApiKeySecret = defineSecret('OPENAI_API_KEY');

export function resolveOpenAiApiKey(): string {
  const key = openAiApiKeySecret.value() || process.env.OPENAI_API_KEY;

  if (!key) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  return key;
}
