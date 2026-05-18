import type { DigestDocument } from '../digest/types.js';
import type { ValidatedDigestContent } from './digestContentSchema.js';

export function applyDigestContent(
  digest: DigestDocument,
  content: ValidatedDigestContent,
): DigestDocument {
  return {
    ...digest,
    summary: content.summary,
    sections: content.sections,
    termOfDay: content.termOfDay,
    reflectionPrompt: content.reflectionPrompt,
  };
}
