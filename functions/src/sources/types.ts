import type { UserInterest } from '../digest/types.js';

export const sourceConnectorTypes = ['rss', 'static'] as const;
export type SourceConnectorType = (typeof sourceConnectorTypes)[number];

export interface StaticSourceEntry {
  readonly title: string;
  readonly citationUrl: string;
  readonly publishedAt: string;
  readonly externalId: string;
}

export interface SourceDefinition {
  readonly id: string;
  readonly label: string;
  readonly type: SourceConnectorType;
  readonly url?: string;
  readonly staticItems?: readonly StaticSourceEntry[];
  readonly interests: readonly UserInterest[];
}

export interface RawSourceItem {
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly title: string;
  readonly citationUrl: string;
  readonly publishedAt: string | null;
  readonly externalId: string;
}

export interface SourceFetchResult {
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly items: readonly RawSourceItem[];
  readonly error: string | null;
}

export interface SourceConnector {
  readonly type: SourceConnectorType;
  fetch(source: SourceDefinition): Promise<readonly RawSourceItem[]>;
}

export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;
