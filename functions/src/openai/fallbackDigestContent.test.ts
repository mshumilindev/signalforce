import { describe, expect, it } from 'vitest';
import type { DigestDocument } from '../digest/types.js';
import { createEmptyDigestSections } from '../digest/emptyDigestContent.js';
import { buildFallbackDigestContent, isOpenAiConnectionError } from './fallbackDigestContent.js';

const digest: DigestDocument = {
  id: 'digest-1',
  status: 'active',
  generatedAt: '2026-05-18T10:00:00.000Z',
  lastRefreshedAt: '2026-05-18T10:00:00.000Z',
  periodStart: '2026-05-18T09:00:00.000Z',
  periodEnd: '2026-05-19T09:00:00.000Z',
  expiresAt: '2026-05-19T09:00:00.000Z',
  summary: '',
  sections: createEmptyDigestSections(),
  items: [
    {
      id: 'item-1',
      title: 'React compiler adoption update',
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      citationUrl: 'https://react.dev/blog/compiler',
      addedAt: '2026-05-18T10:00:00.000Z',
    },
  ],
  termOfDay: null,
  reflectionPrompt: '',
  refreshHistory: [{ at: '2026-05-18T10:00:00.000Z', type: 'created' }],
};

describe('buildFallbackDigestContent', () => {
  it('creates source-backed content with a required term of the day', () => {
    const content = buildFallbackDigestContent(digest);

    expect(content.summary).toContain('React compiler adoption update');
    expect(content.sections.topSignals).toEqual([
      'React Blog: React compiler adoption update',
    ]);
    expect(content.itemSynopses).toEqual([
      {
        itemId: 'item-1',
        synopsis:
          'React Blog published a source-backed signal about React compiler adoption update.',
      },
    ]);
    expect(content.itemVisuals[0]?.imageSearchQuery).toContain('React compiler adoption update');
    expect(content.termOfDay.term).toBe('React Server Boundary');
  });

  it('detects OpenAI connection failures without swallowing other errors', () => {
    expect(isOpenAiConnectionError(new Error('Connection error.'))).toBe(true);
    expect(isOpenAiConnectionError(new Error('Invalid API key.'))).toBe(false);
  });
});
