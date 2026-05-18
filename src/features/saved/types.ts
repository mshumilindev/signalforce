export interface SavedItemRecord {
  readonly id: string;
  readonly itemId: string;
  readonly digestId: string;
  readonly title: string;
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly citationUrl: string;
  readonly savedAt: string;
}

export interface SaveDigestItemInput {
  readonly itemId: string;
  readonly digestId: string;
  readonly title: string;
  readonly sourceId: string;
  readonly sourceLabel: string;
  readonly citationUrl: string;
}
