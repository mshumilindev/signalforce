import { describe, expect, it } from 'vitest';
import { compareNewSourceItems } from './compareNewSourceItems.js';
import type { DigestItem } from './types.js';

function item(id: string, url: string): DigestItem {
  return {
    id,
    title: `Title ${id}`,
    sourceId: 'react-blog',
    sourceLabel: 'React Blog',
    citationUrl: url,
    addedAt: '2026-05-18T10:00:00.000Z',
  };
}

describe('compareNewSourceItems', () => {
  it('returns only items not already present by id or normalized URL', () => {
    const existing = [item('a', 'https://example.com/post')];
    const candidates = [
      item('a', 'https://example.com/post'),
      item('b', 'https://example.com/post?utm_source=x'),
      item('c', 'https://example.com/other'),
    ];

    const result = compareNewSourceItems(existing, candidates);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('c');
  });
});
