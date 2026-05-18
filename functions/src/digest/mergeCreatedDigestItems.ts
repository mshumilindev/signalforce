import type { DigestItem, DigestLifecycleOutcome } from './types.js';

export function mergeCreatedDigestItems(
  outcome: DigestLifecycleOutcome,
  newItems: readonly DigestItem[],
): DigestLifecycleOutcome {
  if (outcome.kind !== 'created') {
    return outcome;
  }

  return {
    ...outcome,
    digest: {
      ...outcome.digest,
      items: newItems,
    },
  };
}
