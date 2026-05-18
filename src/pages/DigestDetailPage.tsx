import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { routeDefinitions } from '@/app/routes';
import { DigestDetailView } from '@/features/digests/DigestDetailView';
import { useDigestDetail } from '@/features/digests/useDigestDetail';
import { useSavedItems } from '@/features/saved/useSavedItems';
import { PageFrame } from '@/pages/PageFrame';

export function DigestDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { digest, newerDigest, olderDigest, viewState, errorKey, reload } = useDigestDetail(id);
  const { isSaved, isMutating, toggleSave } = useSavedItems();

  return (
    <PageFrame
      eyebrowKey="pages.digestDetail.eyebrow"
      titleKey="pages.digestDetail.title"
      descriptionKey="pages.digestDetail.description"
    >
      <div className="dashboard-layout">
        {viewState === 'loading' ? (
          <div className="dashboard-state" role="status" aria-label={t('digests.detail.loading')}>
            <div className="dashboard-spinner" aria-hidden="true" />
            <p>{t('digests.detail.loading')}</p>
          </div>
        ) : null}

        {viewState === 'notFound' ? (
          <div className="dashboard-state dashboard-state-empty">
            <h2>{t('digests.detail.notFoundTitle')}</h2>
            <p>{t('digests.detail.notFoundDescription')}</p>
            <Link to={routeDefinitions.digests.path} className="primary-button">
              {t('digests.detail.backToHistory')}
            </Link>
          </div>
        ) : null}

        {viewState === 'error' ? (
          <div className="dashboard-state dashboard-state-error" role="alert">
            <h2>{t('digests.history.errorTitle')}</h2>
            <p>{t(errorKey ?? 'digests.errors.loadFailed')}</p>
            <button type="button" className="primary-button" onClick={() => void reload()}>
              {t('digests.history.errorRetry')}
            </button>
          </div>
        ) : null}

        {viewState === 'ready' && digest ? (
          <DigestDetailView
            digest={digest}
            newerDigest={newerDigest}
            olderDigest={olderDigest}
            isSaved={isSaved}
            isMutating={isMutating}
            onToggleSave={(item) => {
              void toggleSave(digest.id, item);
            }}
          />
        ) : null}
      </div>
    </PageFrame>
  );
}
