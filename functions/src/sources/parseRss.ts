import type { RawSourceItem } from './types.js';

interface ParsedFeedItem {
  readonly title: string;
  readonly citationUrl: string;
  readonly publishedAt: string | null;
  readonly externalId: string;
}

function parsePublishedAt(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function readTag(block: string, tagNames: readonly string[]): string | null {
  for (const tagName of tagNames) {
    const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'));

    if (match?.[1]) {
      return decodeXmlEntities(match[1]);
    }
  }

  return null;
}

function readAtomLink(block: string): string | null {
  const relAlternate = block.match(
    /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i,
  );

  if (relAlternate?.[1]) {
    return relAlternate[1];
  }

  const hrefOnly = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  return hrefOnly?.[1] ?? null;
}

function parseRssItems(xml: string): ParsedFeedItem[] {
  const blocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

  return blocks.flatMap((match) => {
    const block = match[1] ?? '';
    const title = readTag(block, ['title']);
    const citationUrl = readTag(block, ['link', 'guid']) ?? readAtomLink(block);
    const publishedAt = readTag(block, ['pubDate', 'published', 'updated', 'dc:date']);
    const externalId = readTag(block, ['guid', 'id']) ?? citationUrl;

    if (!title || !citationUrl || !externalId) {
      return [];
    }

    return [
      {
        title,
        citationUrl,
        publishedAt: parsePublishedAt(publishedAt),
        externalId,
      },
    ];
  });
}

function parseAtomEntries(xml: string): ParsedFeedItem[] {
  const blocks = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)];

  return blocks.flatMap((match) => {
    const block = match[1] ?? '';
    const title = readTag(block, ['title']);
    const citationUrl = readAtomLink(block) ?? readTag(block, ['id']);
    const publishedAt = readTag(block, ['published', 'updated']);
    const externalId = readTag(block, ['id']) ?? citationUrl;

    if (!title || !citationUrl || !externalId) {
      return [];
    }

    return [
      {
        title,
        citationUrl,
        publishedAt: parsePublishedAt(publishedAt),
        externalId,
      },
    ];
  });
}

export function parseRssFeedXml(
  xml: string,
  sourceId: string,
  sourceLabel: string,
): RawSourceItem[] {
  const parsed = parseRssItems(xml);
  const entries = parsed.length > 0 ? parsed : parseAtomEntries(xml);

  return entries.map((entry) => ({
    sourceId,
    sourceLabel,
    title: entry.title,
    citationUrl: entry.citationUrl,
    publishedAt: entry.publishedAt,
    externalId: entry.externalId,
  }));
}
