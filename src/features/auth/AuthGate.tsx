import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { routeDefinitions } from '@/app/routes';
import { AuthLoadingScreen } from '@/features/auth/AuthLoadingScreen';
import { useAuth } from '@/features/auth/useAuth';
import { LoginLayout } from '@/pages/LoginLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { DigestDetailPage } from '@/pages/DigestDetailPage';
import { DigestsPage } from '@/pages/DigestsPage';
import { LoginPage } from '@/pages/LoginPage';
import { SavedPage } from '@/pages/SavedPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { TermsPage } from '@/pages/TermsPage';

export function AuthGate() {
  const { status, isAuthenticating } = useAuth();

  if (status === 'loading' || isAuthenticating) {
    return <AuthLoadingScreen />;
  }

  if (status === 'unauthenticated') {
    return (
      <Routes>
        <Route element={<LoginLayout />}>
          <Route path={routeDefinitions.login.path} element={<LoginPage />} />
        </Route>
        <Route path="*" element={<Navigate to={routeDefinitions.login.path} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={routeDefinitions.dashboard.path} element={<DashboardPage />} />
        <Route path={routeDefinitions.digests.path} element={<DigestsPage />} />
        <Route path={routeDefinitions.digestDetail.path} element={<DigestDetailPage />} />
        <Route path={routeDefinitions.settings.path} element={<SettingsPage />} />
        <Route path={routeDefinitions.saved.path} element={<SavedPage />} />
        <Route path={routeDefinitions.terms.path} element={<TermsPage />} />
        <Route path="*" element={<Navigate to={routeDefinitions.dashboard.path} replace />} />
      </Route>
      <Route
        path={routeDefinitions.login.path}
        element={<Navigate to={routeDefinitions.dashboard.path} replace />}
      />
    </Routes>
  );
}
