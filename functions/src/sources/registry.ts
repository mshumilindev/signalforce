import type { UserInterest, UserPreferences } from '../digest/types.js';
import type { SourceDefinition } from './types.js';

export const FALLBACK_SOURCE_ID = 'signalforge-curated';

export const SOURCE_REGISTRY: readonly SourceDefinition[] = [
  {
    id: 'react-blog',
    label: 'React Blog',
    type: 'rss',
    url: 'https://react.dev/rss.xml',
    interests: ['react', 'frontend'],
  },
  {
    id: 'typescript-blog',
    label: 'TypeScript Blog',
    type: 'rss',
    url: 'https://devblogs.microsoft.com/typescript/feed/',
    interests: ['frontend', 'react'],
  },
  {
    id: FALLBACK_SOURCE_ID,
    label: 'SignalForge Curated',
    type: 'static',
    interests: ['architecture', 'leadership', 'ai', 'platform'],
    staticItems: [
      {
        title: 'The Twelve-Factor App',
        citationUrl: 'https://12factor.net/',
        publishedAt: '2012-01-01T00:00:00.000Z',
        externalId: 'curated-twelve-factor',
      },
      {
        title: 'Staff Engineer: Leadership beyond the management track',
        citationUrl: 'https://staffeng.com/book',
        publishedAt: '2021-01-01T00:00:00.000Z',
        externalId: 'curated-staff-eng',
      },
    ],
  },
];

export function resolveSourcesForPreferences(preferences: UserPreferences): SourceDefinition[] {
  const selectedInterests = new Set<UserInterest>(preferences.interests);

  return SOURCE_REGISTRY.filter((source) =>
    source.interests.some((interest) => selectedInterests.has(interest)),
  );
}
