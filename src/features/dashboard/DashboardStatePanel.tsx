import { useTranslation } from 'react-i18next';
import type { DashboardViewState } from '@/features/dashboard/useDashboardDigest';
import type { TranslationKey } from '@/shared/i18n/translations';

interface DashboardStatePanelProps {
  readonly viewState: DashboardViewState;
  readonly errorKey: TranslationKey | null;
  readonly onRetry: () => void;
}

export function DashboardStatePanel({ viewState, errorKey, onRetry }: DashboardStatePanelProps) {
  const { t } = useTranslation();

  if (viewState === 'loading') {
    return (
      <div
        className="dashboard-state"
        role="status"
        aria-live="polite"
        aria-label={t('dashboard.states.loading')}
      >
        <div className="dashboard-spinner" aria-hidden="true" />
        <p>{t('dashboard.states.loading')}</p>
      </div>
    );
  }

  if (viewState === 'empty') {
    return (
      <div className="dashboard-state dashboard-state-empty">
        <h2>{t('dashboard.states.emptyTitle')}</h2>
        <p>{t('dashboard.states.emptyDescription')}</p>
      </div>
    );
  }

  if (viewState === 'error') {
    return (
      <div className="dashboard-state dashboard-state-error" role="alert">
        <h2>{t('dashboard.states.errorTitle')}</h2>
        <p>{t(errorKey ?? 'dashboard.errors.loadFailed')}</p>
        <button type="button" className="ghost-button" onClick={onRetry}>
          {t('dashboard.states.errorRetry')}
        </button>
      </div>
    );
  }

  return null;
}
