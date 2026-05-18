import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routeDefinitions } from '@/app/routes';
import { DigestStatusBadge } from '@/features/dashboard/DigestStatusBadge';
import {
  formatDigestPeriod,
  formatDigestTimestamp,
} from '@/features/dashboard/formatDigestTimestamp';
import type { DigestFreshness } from '@/features/dashboard/digestFreshness';
import type { DigestDocument } from '@/features/digest/types';
import { useAuth } from '@/features/auth/useAuth';
import type { SupportedLanguage } from '@/shared/i18n/translations';

interface LatestDigestCardProps {
  readonly digest: DigestDocument;
  readonly freshness: DigestFreshness;
  readonly nextDigestDueAt: string | null;
  readonly isActionPending: boolean;
}

export function LatestDigestCard({
  digest,
  freshness,
  nextDigestDueAt,
  isActionPending,
}: LatestDigestCardProps) {
  const { t, i18n } = useTranslation();
  const { userDocument } = useAuth();
  const language = (i18n.resolvedLanguage ?? 'en') as SupportedLanguage;
  const timezone = userDocument?.preferences?.timezone ?? 'UTC';
  const summary =
    digest.summary.length > 0 ? digest.summary : t('dashboard.card.emptySummary');

  return (
    <article
      className={`digest-card ${isActionPending ? 'digest-card-pending' : ''}`}
      aria-busy={isActionPending}
    >
      <div className="digest-card-header">
        <div>
          <h2 className="digest-card-title">{t('dashboard.card.title')}</h2>
          <DigestStatusBadge freshness={freshness} />
        </div>
        <Link
          to={routeDefinitions.digestDetail.path.replace(':id', digest.id)}
          className="digest-card-link"
        >
          {t('dashboard.card.viewDigest')}
        </Link>
      </div>
      {freshness === 'expired' ? (
        <p className="digest-card-hint">{t('dashboard.freshness.expiredHint')}</p>
      ) : null}
      <dl className="digest-meta-grid">
        <div>
          <dt>{t('dashboard.card.period')}</dt>
          <dd>{formatDigestPeriod(digest.periodStart, digest.periodEnd, language, timezone)}</dd>
        </div>
        <div>
          <dt>{t('dashboard.card.lastRefreshed')}</dt>
          <dd>{formatDigestTimestamp(digest.lastRefreshedAt, language, timezone)}</dd>
        </div>
        <div>
          <dt>{t('dashboard.card.nextDue')}</dt>
          <dd>
            {nextDigestDueAt
              ? formatDigestTimestamp(nextDigestDueAt, language, timezone)
              : formatDigestTimestamp(digest.expiresAt, language, timezone)}
          </dd>
        </div>
        <div>
          <dt>{t('dashboard.card.signals')}</dt>
          <dd>{t('dashboard.card.itemCount', { count: digest.items.length })}</dd>
        </div>
      </dl>
      <p className="digest-card-summary">{summary}</p>
    </article>
  );
}
