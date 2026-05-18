import type { UserDocument } from '@/features/auth/types';
import { saveUserPreferences } from '@/features/preferences/preferencesRepository';
import type { UserPreferences } from '@/features/preferences/types';
import { i18n } from '@/shared/i18n/i18n';

export async function persistPreferences(
  uid: string,
  preferences: UserPreferences,
): Promise<UserDocument> {
  const savedDocument = await saveUserPreferences(uid, preferences);
  const savedPreferences = savedDocument.preferences;

  if (!savedPreferences) {
    throw new Error('Preferences were not returned after save.');
  }

  void i18n.changeLanguage(savedPreferences.language);
  return savedDocument;
}
