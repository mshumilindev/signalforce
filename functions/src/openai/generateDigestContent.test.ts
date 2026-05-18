import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import type { DigestDocument, UserPreferences } from '../digest/types.js';
import { DigestContentValidationError } from './errors.js';
import { enrichDigestWithGeneratedContent, generateDigestContent } from './generateDigestContent.js';

const validFixture = readFileSync(
  new URL('./fixtures/validDigestContent.json', import.meta.url),
  'utf8',
);

const preferences: UserPreferences = {
  language: 'en',
  interests: ['react'],
  digestTone: 'balanced',
  digestFrequency: 'weekly',
  preferredWeekday: 'monday',
  preferredTime: '09:00',
  timezone: 'UTC',
};

const digest: DigestDocument = {
  id: 'digest-1',
  status: 'active',
  generatedAt: '2026-05-18T10:00:00.000Z',
  lastRefreshedAt: '2026-05-18T10:00:00.000Z',
  periodStart: '2026-05-11T09:00:00.000Z',
  periodEnd: '2026-05-18T09:00:00.000Z',
  expiresAt: '2026-05-25T09:00:00.000Z',
  summary: '',
  sections: {
    executiveSummary: '',
    topSignals: [],
    signalVsNoise: [],
    leadershipImplications: [],
    aiOrchestrationImplications: [],
    frontendArchitectureImplications: [],
    recommendedAction: '',
  },
  items: [
    {
      id: 'item-1',
      title: 'Fixture article',
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      citationUrl: 'https://example.com/fixture-article',
      addedAt: '2026-05-18T10:00:00.000Z',
    },
  ],
  termOfDay: null,
  reflectionPrompt: '',
  refreshHistory: [{ at: '2026-05-18T10:00:00.000Z', type: 'created' }],
};

function createMockClient(content: string | null): OpenAI {
  return {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content } }],
        }),
      },
    },
  } as unknown as OpenAI;
}

describe('generateDigestContent', () => {
  it('parses valid OpenAI JSON responses', async () => {
    const client = createMockClient(validFixture);

    const content = await generateDigestContent({
      preferences,
      digest,
      client,
      apiKey: 'test-key',
    });

    expect(content.summary).toContain('React');
  });

  it('rejects malformed OpenAI JSON responses', async () => {
    const client = createMockClient('{ invalid');

    await expect(
      generateDigestContent({
        preferences,
        digest,
        client,
        apiKey: 'test-key',
      }),
    ).rejects.toThrow(DigestContentValidationError);
  });

  it('enriches a digest document with validated content', async () => {
    const client = createMockClient(validFixture);

    const enriched = await enrichDigestWithGeneratedContent({
      preferences,
      digest,
      client,
      apiKey: 'test-key',
    });

    expect(enriched.summary).toContain('React');
    expect(enriched.items).toEqual(digest.items);
    expect(enriched.reflectionPrompt.length).toBeGreaterThan(0);
  });
});
