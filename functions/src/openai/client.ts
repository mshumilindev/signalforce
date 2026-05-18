import OpenAI from 'openai';
import { resolveOpenAiApiKey } from './secrets.js';

export function createOpenAiClient(apiKey?: string): OpenAI {
  return new OpenAI({
    apiKey: apiKey ?? resolveOpenAiApiKey(),
  });
}
