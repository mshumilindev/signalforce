import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardActions } from '@/features/dashboard/DashboardActions';
import { DashboardShortcuts } from '@/features/dashboard/DashboardShortcuts';
import { DashboardStatePanel } from '@/features/dashboard/DashboardStatePanel';
import { ForceUpdateConfirmModal } from '@/features/dashboard/ForceUpdateConfirmModal';
import { LatestDigestCard } from '@/features/dashboard/LatestDigestCard';
import { TermOfDayPanel } from '@/features/dashboard/TermOfDayPanel';
import { useDashboardDigest } from '@/features/dashboard/useDashboardDigest';
import { PageFrame } from '@/pages/PageFrame';

export function DashboardPage() {
  const { t } = useTranslation();
  const [isForceConfirmOpen, setIsForceConfirmOpen] = useState(false);
  const {
    viewState,
    digest,
    freshness,
    nextDigestDueAt,
    feedbackKey,
    errorKey,
    isRefreshing,
    isForcing,
    isActionPending,
    reload,
    refreshDigest,
    forceUpdateDigest,
  } = useDashboardDigest();

  const showCard = viewState === 'ready' && digest && freshness;
  const showStatePanel = viewState === 'loading' || viewState === 'empty' || viewState === 'error';
  const actionsDisabled = viewState === 'loading' || isActionPending;

  return (
    <PageFrame
      eyebrowKey="pages.dashboard.eyebrow"
      titleKey="pages.dashboard.title"
      descriptionKey="pages.dashboard.description"
    >
      <div className="dashboard-layout">
        <DashboardActions
          isRefreshing={isRefreshing}
          isForcing={isForcing}
          disabled={actionsDisabled}
          onRefresh={() => {
            void refreshDigest();
          }}
          onForceUpdate={() => {
            setIsForceConfirmOpen(true);
          }}
        />

        <ForceUpdateConfirmModal
          isOpen={isForceConfirmOpen}
          isForcing={isForcing}
          onCancel={() => {
            setIsForceConfirmOpen(false);
          }}
          onConfirm={() => {
            setIsForceConfirmOpen(false);
            void forceUpdateDigest();
          }}
        />

        {feedbackKey ? (
          <p className="dashboard-feedback" role="status">
            {t(feedbackKey)}
          </p>
        ) : null}

        {showStatePanel ? (
          <DashboardStatePanel
            viewState={viewState}
            errorKey={errorKey}
            onRetry={() => {
              void reload();
            }}
          />
        ) : null}

        {showCard ? (
          <>
            <LatestDigestCard
              digest={digest}
              freshness={freshness}
              nextDigestDueAt={nextDigestDueAt}
              isActionPending={isActionPending}
            />
            <TermOfDayPanel termOfDay={digest.termOfDay} />
          </>
        ) : null}

        {viewState !== 'loading' ? <DashboardShortcuts /> : null}
      </div>
    </PageFrame>
  );
}
