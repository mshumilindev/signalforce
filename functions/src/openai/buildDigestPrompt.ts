import { formatRoleContextsForPrompt } from '../digest/roleContexts.js';
import type { DigestDocument, DigestItem, UserPreferences } from '../digest/types.js';

export interface DigestPromptInput {
  readonly preferences: UserPreferences;
  readonly digest: DigestDocument;
  readonly items: readonly DigestItem[];
}

export interface DigestPromptMessages {
  readonly system: string;
  readonly user: string;
}

const LANGUAGE_LABELS = {
  en: 'English',
  pl: 'Polish',
  uk: 'Ukrainian',
} as const;

function formatItems(items: readonly DigestItem[]): string {
  return items
    .map(
      (item, index) =>
        `${index + 1}. [${item.sourceLabel}] ${item.title}\n   URL: ${item.citationUrl}\n   itemId: ${item.id}`,
    )
    .join('\n');
}

export function buildDigestPrompt(input: DigestPromptInput): DigestPromptMessages {
  const language = LANGUAGE_LABELS[input.preferences.language];
  const itemsBlock = formatItems(input.items);

  const system = [
    'You are SignalForge, an engineering leadership digest assistant.',
    'Return only valid JSON matching the required schema.',
    'Use ONLY the provided source items. Do not invent URLs, titles, or sources.',
    'Do not cite items that are not listed in the input.',
    `Write all user-facing strings in ${language}.`,
    `Tone: ${input.preferences.digestTone}. Role lenses (apply all together): ${formatRoleContextsForPrompt()}.`,
    'JSON schema keys: summary, sections, termOfDay, reflectionPrompt.',
    'sections keys: executiveSummary, topSignals, signalVsNoise, leadershipImplications, aiOrchestrationImplications, frontendArchitectureImplications, recommendedAction.',
    'topSignals must be an array of concise bullet strings referencing real themes from the items.',
    'termOfDay may be null when no strong candidate exists.',
  ].join('\n');

  const user = [
    `Digest period: ${input.digest.periodStart} → ${input.digest.periodEnd}`,
    `Interests: ${input.preferences.interests.join(', ')}`,
    'Source items:',
    itemsBlock,
    'Produce a structured digest for this period based strictly on the items above.',
  ].join('\n\n');

  return { system, user };
}
