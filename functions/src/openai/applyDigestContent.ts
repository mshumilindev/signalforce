import type { DigestDocument } from '../digest/types.js';
import type { ValidatedDigestContent } from './digestContentSchema.js';

export function applyDigestContent(
  digest: DigestDocument,
  content: ValidatedDigestContent,
): DigestDocument {
  const synopsesByItemId = new Map(
    content.itemSynopses.map((itemSynopsis) => [
      itemSynopsis.itemId,
      itemSynopsis.synopsis,
    ]),
  );
  const visualsByItemId = new Map(
    content.itemVisuals.map((itemVisual) => [itemVisual.itemId, itemVisual.imageAlt]),
  );

  return {
    ...digest,
    summary: content.summary,
    sections: content.sections,
    items: digest.items.map((item) => {
      const synopsis = synopsesByItemId.get(item.id);
      const imageAlt = visualsByItemId.get(item.id);

      return {
        ...item,
        ...(synopsis ? { synopsis } : {}),
        ...(imageAlt && !item.imageAlt ? { imageAlt } : {}),
      };
    }),
    termOfDay: content.termOfDay,
    reflectionPrompt: content.reflectionPrompt,
  };
}
