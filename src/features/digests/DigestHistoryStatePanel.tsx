import { useTranslation } from 'react-i18next';
import type { DigestHistoryViewState } from '@/features/digests/useDigestHistory';
import type { TranslationKey } from '@/shared/i18n/translations';

interface DigestHistoryStatePanelProps {
  readonly viewState: Exclude<DigestHistoryViewState, 'ready'>;
  readonly errorKey: TranslationKey | null;
  readonly onRetry: () => void;
}

export function DigestHistoryStatePanel({
  viewState,
  errorKey,
  onRetry,
}: DigestHistoryStatePanelProps) {
  const { t } = useTranslation();

  if (viewState === 'loading') {
    return (
      <div className="dashboard-state" role="status" aria-label={t('digests.history.loading')}>
        <div className="dashboard-spinner" aria-hidden="true" />
        <p>{t('digests.history.loading')}</p>
      </div>
    );
  }

  if (viewState === 'empty') {
    return (
      <div className="dashboard-state dashboard-state-empty">
        <h2>{t('digests.history.emptyTitle')}</h2>
        <p>{t('digests.history.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-state dashboard-state-error" role="alert">
      <h2>{t('digests.history.errorTitle')}</h2>
      <p>{t(errorKey ?? 'digests.errors.loadFailed')}</p>
      <button type="button" className="primary-button" onClick={onRetry}>
        {t('digests.history.errorRetry')}
      </button>
    </div>
  );
}
