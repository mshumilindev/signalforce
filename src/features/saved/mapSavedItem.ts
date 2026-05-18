import type { SavedItemRecord } from '@/features/saved/types';

function toIsoString(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    const timestamp = value as { toDate: () => Date };
    return timestamp.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date(0).toISOString();
}

export function mapSavedItemRecord(id: string, data: Record<string, unknown>): SavedItemRecord | null {
  const itemId = data.itemId;
  const digestId = data.digestId;
  const title = data.title;
  const sourceId = data.sourceId;
  const sourceLabel = data.sourceLabel;
  const citationUrl = data.citationUrl;

  if (
    typeof itemId !== 'string' ||
    typeof digestId !== 'string' ||
    typeof title !== 'string' ||
    typeof sourceId !== 'string' ||
    typeof sourceLabel !== 'string' ||
    typeof citationUrl !== 'string'
  ) {
    return null;
  }

  return {
    id,
    itemId,
    digestId,
    title,
    sourceId,
    sourceLabel,
    citationUrl,
    savedAt: toIsoString(data.savedAt),
  };
}

export function savedItemToFirestore(
  input: Omit<SavedItemRecord, 'id' | 'savedAt'>,
  savedAt: string,
): Record<string, unknown> {
  return {
    itemId: input.itemId,
    digestId: input.digestId,
    title: input.title,
    sourceId: input.sourceId,
    sourceLabel: input.sourceLabel,
    citationUrl: input.citationUrl,
    savedAt,
  };
}
