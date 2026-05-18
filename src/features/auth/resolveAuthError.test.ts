import { FirebaseError } from 'firebase/app';
import { describe, expect, it } from 'vitest';
import { resolveAuthError } from '@/features/auth/resolveAuthError';

describe('resolveAuthError', () => {
  it('maps Firestore permission errors to profile permission copy', () => {
    const error = new FirebaseError('permission-denied', 'Missing or insufficient permissions.');

    expect(resolveAuthError(error)).toBe('auth.errors.profilePermission');
  });

  it('maps popup closed to a dedicated message', () => {
    const error = new FirebaseError('auth/popup-closed-by-user', 'Popup closed.');

    expect(resolveAuthError(error)).toBe('auth.errors.popupClosed');
  });
});
