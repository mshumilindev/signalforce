import { FirebaseError } from 'firebase/app';
import type { TranslationKey } from '@/shared/i18n/translations';

export function mapCallableErrorToTranslationKey(error: unknown): TranslationKey {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'functions/unauthenticated':
        return 'dashboard.errors.unauthenticated';
      case 'functions/failed-precondition':
        return 'dashboard.errors.preconditionFailed';
      case 'functions/permission-denied':
        return 'dashboard.errors.permissionDenied';
      default:
        return 'dashboard.errors.actionFailed';
    }
  }

  return 'dashboard.errors.actionFailed';
}
