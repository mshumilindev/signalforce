import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/useAuth';
import { PreferencesForm } from '@/features/preferences/PreferencesForm';
import { persistPreferences } from '@/features/preferences/savePreferences';
import type { PreferencesFormErrors, PreferencesFormValues } from '@/features/preferences/types';
import {
  getBrowserTimezone,
  hasValidationErrors,
  preferencesToFormValues,
  toUserPreferences,
  validatePreferencesForm,
} from '@/features/preferences/validation';
import { PageFrame } from '@/pages/PageFrame';

export function SettingsPage() {
  const { t } = useTranslation();
  const { firebaseUser, userDocument, setUserDocument } = useAuth();
  const existingPreferences = userDocument?.preferences;
  const [values, setValues] = useState<PreferencesFormValues>(() =>
    preferencesToFormValues(existingPreferences, getBrowserTimezone()),
  );
  const [errors, setErrors] = useState<PreferencesFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    const nextErrors = validatePreferencesForm(values);
    setErrors(nextErrors);
    setSaveSuccess(false);

    if (hasValidationErrors(nextErrors) || !firebaseUser) {
      return;
    }

    setIsSaving(true);
    setSaveError(false);

    try {
      const preferences = toUserPreferences(values);
      const savedDocument = await persistPreferences(firebaseUser.uid, preferences);
      setUserDocument(savedDocument);
      setSaveSuccess(true);
    } catch {
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageFrame
      eyebrowKey="pages.settings.eyebrow"
      titleKey="pages.settings.title"
      descriptionKey="pages.settings.description"
    >
      <PreferencesForm
        values={values}
        errors={errors}
        sections={['profile', 'interests', 'schedule']}
        onChange={setValues}
      />
      <div className="form-actions">
        <button
          type="button"
          className="primary-button"
          disabled={isSaving}
          onClick={() => {
            void handleSave();
          }}
        >
          {isSaving ? t('preferences.actions.saving') : t('preferences.actions.save')}
        </button>
      </div>
      {saveSuccess ? (
        <p className="form-success" role="status">
          {t('preferences.settings.saved')}
        </p>
      ) : null}
      {saveError ? (
        <p className="auth-error" role="alert">
          {t('preferences.validation.saveFailed')}
        </p>
      ) : null}
    </PageFrame>
  );
}
