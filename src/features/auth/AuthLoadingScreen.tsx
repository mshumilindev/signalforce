import { useTranslation } from 'react-i18next';

export function AuthLoadingScreen() {
  const { t } = useTranslation();

  return (
    <div className="auth-loading" role="status" aria-live="polite" aria-label={t('auth.loading')}>
      <p>{t('auth.loading')}</p>
    </div>
  );
}
