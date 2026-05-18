export const digestFrequencies = [
  'daily',
  'twicePerWeek',
  'weekly',
  'biweekly',
  'monthly',
] as const;
export type DigestFrequency = (typeof digestFrequencies)[number];

export const weekdays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
export type Weekday = (typeof weekdays)[number];

export const supportedLanguages = ['en', 'pl', 'uk'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const userInterests = [
  'react',
  'ai',
  'frontend',
  'architecture',
  'leadership',
  'platform',
  'security',
  'performance',
  'cloud',
] as const;
export type UserInterest = (typeof userInterests)[number];

export const digestTones = ['executive', 'balanced', 'technical'] as const;
export type DigestTone = (typeof digestTones)[number];

export interface UserPreferences {
  readonly language: SupportedLanguage;
  readonly interests: readonly UserInterest[];
  readonly digestTone: DigestTone;
  readonly digestFrequency: DigestFrequency;
  readonly preferredWeekday: Weekday | null;
  readonly preferredTime: string;
  readonly timezone: string;
}

export const digestStatuses = ['active', 'superseded'] as const;
export type DigestStatus = (typeof digestStatuses)[number];

export const digestRefreshEventTypes = ['created', 'refreshed', 'superseded'] as const;
export type DigestRefreshEventType = (typeof digestRefreshEventTypes)[number];

export interface DigestRefreshEvent {
  readonly at: string;
  readonly type: DigestRefreshEventType;
}

export interface DigestItem {
  readonly id: string;
  readonly title: string;
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly citationUrl: string;
  readonly addedAt: string;
}

export interface DigestSections {
  readonly executiveSummary: string;
  readonly topSignals: readonly string[];
  readonly signalVsNoise: readonly string[];
  readonly leadershipImplications: readonly string[];
  readonly aiOrchestrationImplications: readonly string[];
  readonly frontendArchitectureImplications: readonly string[];
  readonly recommendedAction: string;
}

export interface DigestTermOfDay {
  readonly term: string;
  readonly explanation: string;
}

export interface DigestDocument {
  readonly id: string;
  readonly status: DigestStatus;
  readonly generatedAt: string;
  readonly lastRefreshedAt: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly expiresAt: string;
  readonly summary: string;
  readonly sections: DigestSections;
  readonly items: readonly DigestItem[];
  readonly termOfDay: DigestTermOfDay | null;
  readonly reflectionPrompt: string;
  readonly refreshHistory: readonly DigestRefreshEvent[];
}

export interface DigestCadenceInput {
  readonly frequency: DigestFrequency;
  readonly timezone: string;
  readonly preferredWeekday: Weekday | null;
  readonly preferredTime: string;
}

export interface DigestWindow {
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly expiresAt: string;
}

export interface GenerateNewDigestInput {
  readonly digestId: string;
  readonly cadence: DigestCadenceInput;
  readonly referenceDate: Date;
}

export interface ForceUpdateDigestResult {
  readonly newDigest: DigestDocument;
  readonly supersededDigestId: string | null;
}

export type DigestLifecycleOutcome =
  | { readonly kind: 'refreshed'; readonly digest: DigestDocument }
  | { readonly kind: 'created'; readonly digest: DigestDocument; readonly supersededDigestId: string | null };
