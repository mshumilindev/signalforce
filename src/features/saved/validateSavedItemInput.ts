import type { SaveDigestItemInput } from '@/features/saved/types';

const MAX_TITLE_LENGTH = 500;
const MAX_LABEL_LENGTH = 200;
const MAX_URL_LENGTH = 2048;
const MAX_ID_LENGTH = 200;

function isNonEmptyBoundedString(value: string, maxLength: number): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength;
}

export function validateSavedItemInput(input: SaveDigestItemInput): void {
  if (!isNonEmptyBoundedString(input.itemId, MAX_ID_LENGTH)) {
    throw new Error('Saved item id is invalid.');
  }

  if (!isNonEmptyBoundedString(input.digestId, MAX_ID_LENGTH)) {
    throw new Error('Digest id is invalid.');
  }

  if (!isNonEmptyBoundedString(input.title, MAX_TITLE_LENGTH)) {
    throw new Error('Saved item title is invalid.');
  }

  if (!isNonEmptyBoundedString(input.sourceId, MAX_LABEL_LENGTH)) {
    throw new Error('Saved item source id is invalid.');
  }

  if (!isNonEmptyBoundedString(input.sourceLabel, MAX_LABEL_LENGTH)) {
    throw new Error('Saved item source label is invalid.');
  }

  if (!isNonEmptyBoundedString(input.citationUrl, MAX_URL_LENGTH)) {
    throw new Error('Saved item citation URL is invalid.');
  }
}
