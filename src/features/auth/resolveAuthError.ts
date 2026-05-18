import { FirebaseError } from 'firebase/app';
import type { AuthErrorKey } from '@/features/auth/types';

export function resolveAuthError(error: unknown): AuthErrorKey {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/popup-closed-by-user') {
      return 'auth.errors.popupClosed';
    }

    if (error.code === 'permission-denied') {
      return 'auth.errors.profilePermission';
    }

    if (error.code === 'unavailable' || error.code === 'deadline-exceeded') {
      return 'auth.errors.profileUnavailable';
    }
  }

  return 'auth.errors.unknown';
}
