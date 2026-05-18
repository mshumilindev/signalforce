import { describe, expect, it } from 'vitest';
import type { DigestDocument, UserPreferences } from '../digest/types.js';
import { buildDigestPrompt } from './buildDigestPrompt.js';

const preferences: UserPreferences = {
  language: 'en',
  interests: ['react', 'frontend'],
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

describe('buildDigestPrompt', () => {
  it('includes source items and language constraints', () => {
    const { system, user } = buildDigestPrompt({ preferences, digest, items: digest.items });

    expect(system).toContain('English');
    expect(system).toContain('AI Orchestrator');
    expect(system).toContain('Lead AI Engineer');
    expect(system).toContain('Do not invent URLs');
    expect(user).toContain('Fixture article');
    expect(user).toContain('https://example.com/fixture-article');
  });
});
