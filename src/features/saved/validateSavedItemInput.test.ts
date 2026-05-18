import { describe, expect, it } from 'vitest';
import { validateSavedItemInput } from '@/features/saved/validateSavedItemInput';

const validInput = {
  itemId: 'item-1',
  digestId: 'digest-1',
  title: 'Signal title',
  sourceId: 'react-blog',
  sourceLabel: 'React Blog',
  citationUrl: 'https://example.com/post',
} as const;

describe('validateSavedItemInput', () => {
  it('accepts valid saved item input', () => {
    expect(() => {
      validateSavedItemInput(validInput);
    }).not.toThrow();
  });

  it('rejects empty titles', () => {
    expect(() => {
      validateSavedItemInput({ ...validInput, title: '   ' });
    }).toThrow('Saved item title is invalid.');
  });
});
