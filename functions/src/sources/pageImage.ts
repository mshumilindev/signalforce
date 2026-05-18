import type { FetchFn, RawSourceItem } from './types.js';

const IMAGE_META_PATTERNS = [
  /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
  /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i,
  /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/i,
] as const;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function resolveImageUrl(value: string, pageUrl: string): string | null {
  try {
    return new URL(decodeHtmlEntities(value), pageUrl).toString();
  } catch {
    return null;
  }
}

export function extractMainImageUrl(html: string, pageUrl: string): string | null {
  for (const pattern of IMAGE_META_PATTERNS) {
    const matched = html.match(pattern)?.[1];
    if (!matched) {
      continue;
    }

    const imageUrl = resolveImageUrl(matched, pageUrl);
    if (imageUrl) {
      return imageUrl;
    }
  }

  return null;
}

async function fetchPageMainImage(
  item: RawSourceItem,
  fetchImpl: FetchFn,
): Promise<string | null> {
  try {
    const response = await fetchImpl(item.citationUrl, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return extractMainImageUrl(html, item.citationUrl);
  } catch {
    return null;
  }
}

export async function enrichRawItemsWithPageImages(
  items: readonly RawSourceItem[],
  fetchImpl: FetchFn,
): Promise<readonly RawSourceItem[]> {
  return Promise.all(
    items.map(async (item) => {
      if (item.imageUrl) {
        return item;
      }

      const imageUrl = await fetchPageMainImage(item, fetchImpl);
      return imageUrl ? { ...item, imageUrl } : item;
    }),
  );
}
