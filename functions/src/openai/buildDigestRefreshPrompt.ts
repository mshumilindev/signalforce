import { formatRoleContextsForPrompt } from '../digest/roleContexts.js';
import type { DigestDocument, DigestItem, UserPreferences } from '../digest/types.js';

export interface DigestRefreshPromptInput {
  readonly preferences: UserPreferences;
  readonly digest: DigestDocument;
  readonly newItems: readonly DigestItem[];
}

export interface DigestRefreshPromptMessages {
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

export function buildDigestRefreshPrompt(
  input: DigestRefreshPromptInput,
): DigestRefreshPromptMessages {
  const language = LANGUAGE_LABELS[input.preferences.language];

  const system = [
    'You are SignalForge, an engineering leadership digest assistant.',
    'Update an existing digest in place using newly arrived source items.',
    'Return only valid JSON matching the required schema.',
    'Use ONLY the provided source items. Do not invent URLs, titles, or sources.',
    `Write all user-facing strings in ${language}.`,
    `Tone: ${input.preferences.digestTone}. Role lenses (apply all together): ${formatRoleContextsForPrompt()}.`,
    'JSON schema keys: summary, sections, itemSynopses, itemVisuals, termOfDay, reflectionPrompt.',
    'sections keys: executiveSummary, topSignals, signalVsNoise, leadershipImplications, aiOrchestrationImplications, frontendArchitectureImplications, recommendedAction.',
    'itemSynopses must include one object for every digest item after refresh: { "itemId": string, "synopsis": string }.',
    'Each synopsis must be one short sentence under 220 characters that helps decide whether to open the source.',
    'itemVisuals must include one object for every digest item after refresh: { "itemId": string, "imageAlt": string, "imageSearchQuery": string }.',
    'Use imageSearchQuery to describe the most relevant real-world visual to look up. Do not invent image URLs.',
    'Integrate the new items into the narrative. Preserve accurate themes from the existing digest where still valid.',
    'termOfDay is required. Pick one useful engineering, AI, frontend, architecture, or leadership term grounded in the refreshed source themes.',
  ].join('\n');

  const user = [
    `Digest period (unchanged): ${input.digest.periodStart} → ${input.digest.periodEnd}`,
    `Current summary: ${input.digest.summary || '(empty)'}`,
    `Current executive summary: ${input.digest.sections.executiveSummary || '(empty)'}`,
    'Newly appended source items:',
    formatItems(input.newItems),
    'All digest items after refresh:',
    formatItems(input.digest.items),
    'Update the digest content to reflect the full item set. Do not remove valid prior themes unless contradicted.',
  ].join('\n\n');

  return { system, user };
}
