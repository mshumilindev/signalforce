import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/useAuth';
import { LanguageSwitcher } from '@/shared/i18n/LanguageSwitcher';
import { navigationRoutes } from '@/app/routes';

export function AppShell() {
  const { t } = useTranslation();
  const { signOut, userDocument } = useAuth();
  const displayName = userDocument?.profile.displayName ?? userDocument?.profile.email;

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/dashboard" className="brand-link" aria-label={t('appShell.homeLabel')}>
          <span className="brand-mark">SF</span>
          <span>{t('appShell.productName')}</span>
        </NavLink>
        <nav className="primary-nav" aria-label={t('appShell.primaryNavigation')}>
          {navigationRoutes.map((route) => (
            <NavLink key={route.path} to={route.path} className="nav-link">
              {t(route.labelKey)}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          {displayName ? (
            <span className="user-label" title={userDocument?.profile.email ?? undefined}>
              {displayName}
            </span>
          ) : null}
          <button
            type="button"
            className="ghost-button"
            onClick={() => {
              void signOut();
            }}
          >
            {t('auth.signOut')}
          </button>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="main-surface">
        <Outlet />
      </main>
    </div>
  );
}
