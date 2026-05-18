import { describe, expect, it } from 'vitest';
import type { DigestDocument, UserPreferences } from '../digest/types.js';
import { buildDigestRefreshPrompt } from './buildDigestRefreshPrompt.js';

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
  summary: 'Existing summary',
  sections: {
    executiveSummary: 'Existing executive summary',
    topSignals: ['Existing signal'],
    signalVsNoise: [],
    leadershipImplications: [],
    aiOrchestrationImplications: [],
    frontendArchitectureImplications: [],
    recommendedAction: 'Keep shipping',
  },
  items: [
    {
      id: 'item-1',
      title: 'Existing item',
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      citationUrl: 'https://example.com/existing',
      addedAt: '2026-05-18T10:00:00.000Z',
    },
  ],
  termOfDay: null,
  reflectionPrompt: 'Reflect',
  refreshHistory: [{ at: '2026-05-18T10:00:00.000Z', type: 'created' }],
};

const newItem = {
  id: 'item-2',
  title: 'New item',
  sourceId: 'react-blog',
  sourceLabel: 'React Blog',
  citationUrl: 'https://example.com/new',
  addedAt: '2026-05-18T11:00:00.000Z',
};

describe('buildDigestRefreshPrompt', () => {
  it('includes existing digest context and only new items in the refresh section', () => {
    const { system, user } = buildDigestRefreshPrompt({
      preferences,
      digest,
      newItems: [newItem],
    });

    expect(system).toContain('Update an existing digest in place');
    expect(user).toContain('Existing summary');
    expect(user).toContain('Newly appended source items');
    expect(user).toContain('New item');
    expect(user).toContain('All digest items after refresh');
  });
});
