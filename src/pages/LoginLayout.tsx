import { Outlet } from 'react-router-dom';
import { LanguageSwitcher } from '@/shared/i18n/LanguageSwitcher';

export function LoginLayout() {
  return (
    <div className="login-layout">
      <header className="login-header">
        <LanguageSwitcher />
      </header>
      <main className="main-surface">
        <Outlet />
      </main>
    </div>
  );
}
