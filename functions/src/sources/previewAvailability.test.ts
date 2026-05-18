import { describe, expect, it, vi } from 'vitest';
import { checkSourcePreviewAvailability } from './previewAvailability.js';

describe('checkSourcePreviewAvailability', () => {
  it('rejects invalid URLs', async () => {
    await expect(checkSourcePreviewAvailability('not-url')).resolves.toEqual({
      available: false,
      reason: 'invalidUrl',
    });
  });

  it('rejects sources blocked by x-frame-options', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('', { status: 200, headers: { 'x-frame-options': 'DENY' } })),
    );

    await expect(checkSourcePreviewAvailability('https://example.com/article')).resolves.toEqual({
      available: false,
      reason: 'blockedByHeaders',
    });

    vi.unstubAllGlobals();
  });

  it('allows sources without iframe-blocking headers', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 200 })));

    await expect(checkSourcePreviewAvailability('https://example.com/article')).resolves.toEqual({
      available: true,
      reason: 'available',
    });

    vi.unstubAllGlobals();
  });
});
