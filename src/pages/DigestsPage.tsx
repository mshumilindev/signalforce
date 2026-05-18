import { PageFrame } from '@/pages/PageFrame';
import { DigestHistoryList } from '@/features/digests/DigestHistoryList';
import { DigestHistoryStatePanel } from '@/features/digests/DigestHistoryStatePanel';
import { useDigestHistory } from '@/features/digests/useDigestHistory';

export function DigestsPage() {
  const { digests, viewState, errorKey, latestDigestId, reload } = useDigestHistory();

  return (
    <PageFrame
      eyebrowKey="pages.digests.eyebrow"
      titleKey="pages.digests.title"
      descriptionKey="pages.digests.description"
    >
      <div className="dashboard-layout">
        {viewState === 'ready' ? (
          <DigestHistoryList digests={digests} latestDigestId={latestDigestId} />
        ) : (
          <DigestHistoryStatePanel
            viewState={viewState}
            errorKey={errorKey}
            onRetry={() => {
              void reload();
            }}
          />
        )}
      </div>
    </PageFrame>
  );
}
