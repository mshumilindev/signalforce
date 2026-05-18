import { useTranslation } from 'react-i18next';

interface DashboardActionsProps {
  readonly isRefreshing: boolean;
  readonly isForcing: boolean;
  readonly disabled: boolean;
  readonly onRefresh: () => void;
  readonly onForceUpdate: () => void;
}

export function DashboardActions({
  isRefreshing,
  isForcing,
  disabled,
  onRefresh,
  onForceUpdate,
}: DashboardActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="dashboard-actions">
      <button
        type="button"
        className="primary-button"
        disabled={disabled || isForcing}
        onClick={onRefresh}
      >
        {isRefreshing ? t('dashboard.actions.refreshing') : t('dashboard.actions.refresh')}
      </button>
      <button
        type="button"
        className="ghost-button"
        disabled={disabled || isRefreshing}
        onClick={onForceUpdate}
      >
        {isForcing ? t('dashboard.actions.forcing') : t('dashboard.actions.forceUpdate')}
      </button>
    </div>
  );
}
