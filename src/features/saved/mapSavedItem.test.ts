import { describe, expect, it } from 'vitest';
import { mapSavedItemRecord } from '@/features/saved/mapSavedItem';

describe('mapSavedItemRecord', () => {
  it('maps valid saved item documents', () => {
    const mapped = mapSavedItemRecord('item-1', {
      itemId: 'item-1',
      digestId: 'digest-1',
      title: 'Fixture article',
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      citationUrl: 'https://example.com/article',
      savedAt: '2026-05-18T10:00:00.000Z',
    });

    expect(mapped).toEqual({
      id: 'item-1',
      itemId: 'item-1',
      digestId: 'digest-1',
      title: 'Fixture article',
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      citationUrl: 'https://example.com/article',
      savedAt: '2026-05-18T10:00:00.000Z',
    });
  });

  it('returns null for invalid documents', () => {
    expect(mapSavedItemRecord('item-1', { title: 'missing fields' })).toBeNull();
  });
});
