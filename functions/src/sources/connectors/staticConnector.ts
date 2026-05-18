import type { RawSourceItem, SourceConnector, SourceDefinition } from '../types.js';

export const staticConnector: SourceConnector = {
  type: 'static',

  async fetch(source: SourceDefinition): Promise<readonly RawSourceItem[]> {
    const entries = source.staticItems ?? [];

    return entries.map((entry) => ({
      sourceId: source.id,
      sourceLabel: source.label,
      title: entry.title,
      citationUrl: entry.citationUrl,
      publishedAt: entry.publishedAt,
      externalId: entry.externalId,
      ...(entry.imageUrl ? { imageUrl: entry.imageUrl } : {}),
    }));
  },
};
