import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigationRoutes } from '@/app/routes';

const shortcutRouteIds = ['digests', 'saved', 'terms'] as const;

export function DashboardShortcuts() {
  const { t } = useTranslation();
  const shortcuts = navigationRoutes.filter((route) =>
    shortcutRouteIds.includes(route.id as (typeof shortcutRouteIds)[number]),
  );

  return (
    <section className="dashboard-shortcuts" aria-labelledby="dashboard-shortcuts-heading">
      <h2 id="dashboard-shortcuts-heading">{t('dashboard.shortcuts.title')}</h2>
      <div className="shortcut-grid">
        {shortcuts.map((route) => (
          <NavLink key={route.id} to={route.path} className="shortcut-card">
            {t(route.labelKey)}
          </NavLink>
        ))}
      </div>
    </section>
  );
}
