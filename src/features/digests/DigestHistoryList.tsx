import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routeDefinitions } from '@/app/routes';
import { DigestHistoryStatusBadge } from '@/features/digests/DigestHistoryStatusBadge';
import { getDigestHistoryStatus } from '@/features/digest/getDigestHistoryStatus';
import {
  formatDigestPeriod,
  formatDigestTimestamp,
} from '@/features/dashboard/formatDigestTimestamp';
import type { DigestDocument } from '@/features/digest/types';
import { useAuth } from '@/features/auth/useAuth';
import type { SupportedLanguage } from '@/shared/i18n/translations';

interface DigestHistoryListProps {
  readonly digests: readonly DigestDocument[];
  readonly latestDigestId: string | null;
}

export function DigestHistoryList({ digests, latestDigestId }: DigestHistoryListProps) {
  const { t, i18n } = useTranslation();
  const { userDocument } = useAuth();
  const language = (i18n.resolvedLanguage ?? 'en') as SupportedLanguage;
  const timezone = userDocument?.preferences?.timezone ?? 'UTC';

  return (
    <ul className="digest-history-list">
      {digests.map((digest) => {
        const status = getDigestHistoryStatus(digest);
        const summary =
          digest.summary.length > 0 ? digest.summary : t('dashboard.card.emptySummary');
        const isLatest = digest.id === latestDigestId;

        return (
          <li key={digest.id} className="digest-history-item">
            <article className="digest-card">
              <div className="digest-card-header">
                <div>
                  <h2 className="digest-card-title">
                    {formatDigestPeriod(
                      digest.periodStart,
                      digest.periodEnd,
                      language,
                      timezone,
                    )}
                  </h2>
                  <div className="digest-history-badges">
                    <DigestHistoryStatusBadge status={status} />
                    {isLatest ? (
                      <span className="digest-latest-badge">{t('digests.history.latestBadge')}</span>
                    ) : null}
                  </div>
                </div>
                <Link
                  to={routeDefinitions.digestDetail.path.replace(':id', digest.id)}
                  className="digest-card-link"
                >
                  {t('digests.history.openDigest')}
                </Link>
              </div>
              <dl className="digest-meta-grid">
                <div>
                  <dt>{t('digests.history.generated')}</dt>
                  <dd>{formatDigestTimestamp(digest.generatedAt, language, timezone)}</dd>
                </div>
                <div>
                  <dt>{t('dashboard.card.signals')}</dt>
                  <dd>{t('digests.history.itemCount', { count: digest.items.length })}</dd>
                </div>
              </dl>
              <p className="digest-card-summary">{summary}</p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
