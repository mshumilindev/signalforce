import { FirebaseError } from 'firebase/app';
import type { TranslationKey } from '@/shared/i18n/translations';

export function mapCallableErrorToTranslationKey(error: unknown): TranslationKey {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'functions/unauthenticated':
        return 'dashboard.errors.unauthenticated';
      case 'functions/failed-precondition':
        if (error.message.includes('source item')) {
          return 'dashboard.errors.noSourceItems';
        }

        if (error.message.includes('OPENAI_API_KEY')) {
          return 'dashboard.errors.openAiNotConfigured';
        }

        if (error.message.includes('preferences')) {
          return 'dashboard.errors.preferencesRequired';
        }

        return 'dashboard.errors.preconditionFailed';
      case 'functions/permission-denied':
        return 'dashboard.errors.permissionDenied';
      default:
        return 'dashboard.errors.actionFailed';
    }
  }

  return 'dashboard.errors.actionFailed';
}
