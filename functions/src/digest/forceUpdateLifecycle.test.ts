import { describe, expect, it } from 'vitest';
import {
  forceUpdateDigest,
  generateNewDigest,
  getNextDigestDueAtForDigest,
  markDigestSuperseded,
  resolveDigestLifecycle,
} from './lifecycle.js';
import { mergeCreatedDigestItems } from './mergeCreatedDigestItems.js';

const cadence = {
  frequency: 'weekly' as const,
  timezone: 'UTC',
  preferredWeekday: 'monday' as const,
  preferredTime: '09:00',
};

describe('force update lifecycle', () => {
  it('supersedes the previous digest, creates a new id, and recalculates cadence', () => {
    const activeWithId = generateNewDigest({
      digestId: 'digest-active',
      cadence,
      referenceDate: new Date('2026-05-18T10:00:00.000Z'),
    });

    const forcedReference = new Date('2026-05-26T12:00:00.000Z');
    const resolved = resolveDigestLifecycle({
      activeDigest: activeWithId,
      cadence,
      referenceDate: forcedReference,
      newItems: [],
      force: true,
      newDigestId: 'digest-forced',
    });
    const outcome = mergeCreatedDigestItems(resolved, []);

    expect(outcome.kind).toBe('created');
    if (outcome.kind !== 'created') {
      return;
    }

    const superseded = markDigestSuperseded(activeWithId, forcedReference);

    expect(superseded.status).toBe('superseded');
    expect(superseded.id).toBe('digest-active');
    expect(outcome.digest.id).toBe('digest-forced');
    expect(outcome.supersededDigestId).toBe('digest-active');
    expect(outcome.digest.generatedAt).toBe('2026-05-26T12:00:00.000Z');
    expect(outcome.digest.expiresAt).not.toBe(activeWithId.expiresAt);
    expect(outcome.digest.periodEnd).not.toBe(activeWithId.periodEnd);

    const previousDue = getNextDigestDueAtForDigest(activeWithId);
    const nextDue = getNextDigestDueAtForDigest(outcome.digest);
    expect(nextDue).not.toBe(previousDue);
  });

  it('creates a new digest when no active digest exists', () => {
    const forcedReference = new Date('2026-05-26T12:00:00.000Z');
    const result = forceUpdateDigest(null, cadence, 'digest-first', forcedReference);

    expect(result.supersededDigestId).toBeNull();
    expect(result.newDigest.id).toBe('digest-first');
    expect(result.newDigest.generatedAt).toBe('2026-05-26T12:00:00.000Z');
  });
});
