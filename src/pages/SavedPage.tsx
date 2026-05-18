import { useTranslation } from 'react-i18next';
import { SavedItemsList } from '@/features/saved/SavedItemsList';
import { useSavedItems } from '@/features/saved/useSavedItems';
import { PageFrame } from '@/pages/PageFrame';

export function SavedPage() {
  const { t } = useTranslation();
  const { items, viewState, errorKey, reload } = useSavedItems();

  return (
    <PageFrame
      eyebrowKey="pages.saved.eyebrow"
      titleKey="pages.saved.title"
      descriptionKey="pages.saved.description"
    >
      <div className="dashboard-layout">
        {viewState === 'ready' ? <SavedItemsList items={items} /> : null}

        {viewState === 'loading' ? (
          <div className="dashboard-state" role="status" aria-label={t('saved.list.loading')}>
            <div className="dashboard-spinner" aria-hidden="true" />
            <p>{t('saved.list.loading')}</p>
          </div>
        ) : null}

        {viewState === 'empty' ? (
          <div className="dashboard-state dashboard-state-empty">
            <h2>{t('saved.list.emptyTitle')}</h2>
            <p>{t('saved.list.emptyDescription')}</p>
          </div>
        ) : null}

        {viewState === 'error' ? (
          <div className="dashboard-state dashboard-state-error" role="alert">
            <h2>{t('saved.list.errorTitle')}</h2>
            <p>{t(errorKey ?? 'saved.errors.loadFailed')}</p>
            <button type="button" className="primary-button" onClick={() => void reload()}>
              {t('saved.list.errorRetry')}
            </button>
          </div>
        ) : null}
      </div>
    </PageFrame>
  );
}
