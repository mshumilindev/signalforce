import type { DigestDocument, DigestItem } from '../digest/types.js';
import type { ValidatedDigestContent } from './digestContentSchema.js';

function formatSourceList(items: readonly DigestItem[]): string {
  return items
    .slice(0, 3)
    .map((item) => `${item.title} (${item.sourceLabel})`)
    .join('; ');
}

function pickTerm(items: readonly DigestItem[]): ValidatedDigestContent['termOfDay'] {
  const titleText = items.map((item) => item.title.toLowerCase()).join(' ');

  if (titleText.includes('react')) {
    return {
      term: 'React Server Boundary',
      explanation:
        'A deliberate split between UI rendered or prepared on the server and interaction handled in the browser.',
    };
  }

  if (titleText.includes('ai') || titleText.includes('model')) {
    return {
      term: 'Source-grounded synthesis',
      explanation:
        'A digest pattern where every generated insight is constrained by explicit cited source material.',
    };
  }

  return {
    term: 'Engineering signal',
    explanation:
      'A source-backed update that can change technical direction, architecture choices, or leadership priorities.',
  };
}

function fallbackItemSynopsis(item: DigestItem): string {
  const synopsis = `${item.sourceLabel} published a source-backed signal about ${item.title}.`;
  return synopsis.length <= 220 ? synopsis : `${synopsis.slice(0, 217).trim()}...`;
}

export function buildFallbackDigestContent(
  digest: DigestDocument,
  items: readonly DigestItem[] = digest.items,
): ValidatedDigestContent {
  const sourceSummary = formatSourceList(items);
  const topSignals =
    items.length > 0
      ? items.slice(0, 3).map((item) => `${item.sourceLabel}: ${item.title}`)
      : ['No new source-backed signals were added during this refresh.'];

  return {
    summary:
      sourceSummary.length > 0
        ? `Source-backed digest prepared from ${items.length} signal${items.length === 1 ? '' : 's'}: ${sourceSummary}.`
        : 'Digest refreshed without new source-backed signals.',
    sections: {
      executiveSummary:
        sourceSummary.length > 0
          ? `The most relevant engineering signals came from ${sourceSummary}.`
          : 'No new source-backed signals were available during this refresh.',
      topSignals,
      signalVsNoise: [
        'Prioritize cited source updates over uncited commentary or broad trend claims.',
      ],
      leadershipImplications: [
        'Use the cited sources to decide whether a team discussion, pilot, or architecture review is warranted.',
      ],
      aiOrchestrationImplications: [
        'Keep AI-generated synthesis constrained to retrieved and cited inputs.',
      ],
      frontendArchitectureImplications: [
        'Review frontend and platform signals for implications on ownership boundaries and delivery risk.',
      ],
      recommendedAction:
        items.length > 0
          ? 'Open the highest-signal source and capture one concrete follow-up for the next planning cycle.'
          : 'Retry refresh later when source connectors return new cited material.',
    },
    itemSynopses: digest.items.map((item) => ({
      itemId: item.id,
      synopsis: fallbackItemSynopsis(item),
    })),
    itemVisuals: digest.items.map((item) => ({
      itemId: item.id,
      imageAlt: `${item.sourceLabel} visual for ${item.title}`.slice(0, 160),
      imageSearchQuery: `${item.sourceLabel} ${item.title}`.slice(0, 160),
    })),
    termOfDay: pickTerm(items),
    reflectionPrompt:
      'Which cited signal is most likely to change a technical decision in the next two weeks?',
  };
}

export function isOpenAiConnectionError(error: unknown): boolean {
  return error instanceof Error && error.message.includes('Connection error');
}
