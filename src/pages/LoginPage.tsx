import { useTranslation } from 'react-i18next';
import { PageFrame } from '@/pages/PageFrame';
import { useAuth } from '@/features/auth/useAuth';

export function LoginPage() {
  const { t } = useTranslation();
  const { signIn, authError, isAuthenticating } = useAuth();

  return (
    <PageFrame
      eyebrowKey="pages.login.eyebrow"
      titleKey="pages.login.title"
      descriptionKey="pages.login.description"
    >
      <div className="auth-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => {
            void signIn();
          }}
          disabled={isAuthenticating}
        >
          {t('auth.signInWithGoogle')}
        </button>
        {authError ? (
          <p className="auth-error" role="alert">
            {t(authError)}
          </p>
        ) : null}
      </div>
    </PageFrame>
  );
}
