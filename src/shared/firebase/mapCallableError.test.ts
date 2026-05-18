import { FirebaseError } from 'firebase/app';
import { describe, expect, it } from 'vitest';
import { mapCallableErrorToTranslationKey } from '@/shared/firebase/mapCallableError';

describe('mapCallableErrorToTranslationKey', () => {
  it('maps unauthenticated callable errors', () => {
    const error = new FirebaseError('functions/unauthenticated', 'Auth required');

    expect(mapCallableErrorToTranslationKey(error)).toBe('dashboard.errors.unauthenticated');
  });

  it('maps failed-precondition callable errors', () => {
    const error = new FirebaseError('functions/failed-precondition', 'Not allowed');

    expect(mapCallableErrorToTranslationKey(error)).toBe('dashboard.errors.preconditionFailed');
  });

  it('falls back to action failed for unknown errors', () => {
    expect(mapCallableErrorToTranslationKey(new Error('boom'))).toBe('dashboard.errors.actionFailed');
  });
});
