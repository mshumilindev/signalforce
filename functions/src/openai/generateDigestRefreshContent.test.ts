import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import type { DigestDocument, UserPreferences } from '../digest/types.js';
import { enrichRefreshedDigestContent } from './generateDigestRefreshContent.js';

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
  summary: 'Before',
  sections: {
    executiveSummary: 'Before',
    topSignals: [],
    signalVsNoise: [],
    leadershipImplications: [],
    aiOrchestrationImplications: [],
    frontendArchitectureImplications: [],
    recommendedAction: 'Before',
  },
  items: [
    {
      id: 'item-1',
      title: 'Existing',
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      citationUrl: 'https://example.com/existing',
      addedAt: '2026-05-18T10:00:00.000Z',
    },
    {
      id: 'item-2',
      title: 'New',
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      citationUrl: 'https://example.com/new',
      addedAt: '2026-05-18T11:00:00.000Z',
    },
  ],
  termOfDay: null,
  reflectionPrompt: 'Before',
  refreshHistory: [{ at: '2026-05-18T10:00:00.000Z', type: 'created' }],
};

const newItem = digest.items[1]!;

function createMockClient(content: string): OpenAI {
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

describe('enrichRefreshedDigestContent', () => {
  it('updates summary while preserving digest identity and enriching matched items', async () => {
    const client = createMockClient(validFixture);

    const enriched = await enrichRefreshedDigestContent({
      preferences,
      digest,
      newItems: [newItem],
      client,
      apiKey: 'test-key',
    });

    expect(enriched.id).toBe('digest-1');
    expect(enriched.generatedAt).toBe(digest.generatedAt);
    expect(enriched.expiresAt).toBe(digest.expiresAt);
    expect(enriched.items[0]?.id).toBe('item-1');
    expect(enriched.items[0]?.synopsis).toContain('React platform');
    expect(enriched.items[0]?.imageAlt).toBe('React platform architecture visual');
    expect(enriched.items[1]?.id).toBe('item-2');
    expect(enriched.summary).toContain('React');
  });

  it('falls back when refresh JSON validates incorrectly during enrichment', async () => {
    const client = createMockClient(
      JSON.stringify({
        summary: 'Incomplete refresh',
        sections: {
          executiveSummary: 'Executive',
          topSignals: ['Signal'],
          signalVsNoise: [],
          leadershipImplications: [],
          aiOrchestrationImplications: [],
          frontendArchitectureImplications: [],
          recommendedAction: 'Act',
        },
        termOfDay: { term: 'Signal', explanation: 'A source-backed update.' },
        reflectionPrompt: 'Reflect',
      }),
    );

    const enriched = await enrichRefreshedDigestContent({
      preferences,
      digest,
      newItems: [newItem],
      client,
      apiKey: 'test-key',
    });

    expect(enriched.summary).toContain('Source-backed digest prepared');
    expect(enriched.items[1]?.synopsis).toContain('New');
  });
});
