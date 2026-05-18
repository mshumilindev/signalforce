import type { TranslationKey } from '@/shared/i18n/translations';

export type AppRouteId =
  | 'login'
  | 'dashboard'
  | 'digests'
  | 'digestDetail'
  | 'settings'
  | 'saved'
  | 'terms';

interface AppRoute {
  readonly id: AppRouteId;
  readonly path: string;
  readonly labelKey: TranslationKey;
}

export const routeDefinitions = {
  login: { id: 'login', path: '/login', labelKey: 'routes.login' },
  dashboard: { id: 'dashboard', path: '/dashboard', labelKey: 'routes.dashboard' },
  digests: { id: 'digests', path: '/digests', labelKey: 'routes.digests' },
  digestDetail: { id: 'digestDetail', path: '/digests/:id', labelKey: 'routes.digestDetail' },
  settings: { id: 'settings', path: '/settings', labelKey: 'routes.settings' },
  saved: { id: 'saved', path: '/saved', labelKey: 'routes.saved' },
  terms: { id: 'terms', path: '/terms', labelKey: 'routes.terms' },
} as const satisfies Record<AppRouteId, AppRoute>;

export const navigationRoutes = [
  routeDefinitions.dashboard,
  routeDefinitions.digests,
  routeDefinitions.saved,
  routeDefinitions.terms,
  routeDefinitions.settings,
] as const;
