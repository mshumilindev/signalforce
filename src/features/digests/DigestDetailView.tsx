import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routeDefinitions } from '@/app/routes';
import { DigestHistoryStatusBadge } from '@/features/digests/DigestHistoryStatusBadge';
import { getDigestHistoryStatus } from '@/features/digest/getDigestHistoryStatus';
import {
  formatDigestPeriod,
  formatDigestTimestamp,
} from '@/features/dashboard/formatDigestTimestamp';
import type { DigestDocument, DigestItem } from '@/features/digest/types';
import { useAuth } from '@/features/auth/useAuth';
import type { SupportedLanguage } from '@/shared/i18n/translations';

interface DigestDetailViewProps {
  readonly digest: DigestDocument;
  readonly isSaved: (itemId: string) => boolean;
  readonly isMutating: boolean;
  readonly onToggleSave: (item: DigestItem) => void;
}

function SectionList({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="digest-detail-section">
      <h3>{title}</h3>
      <ul className="digest-detail-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function DigestDetailView({
  digest,
  isSaved,
  isMutating,
  onToggleSave,
}: DigestDetailViewProps) {
  const { t, i18n } = useTranslation();
  const { userDocument } = useAuth();
  const language = (i18n.resolvedLanguage ?? 'en') as SupportedLanguage;
  const timezone = userDocument?.preferences?.timezone ?? 'UTC';
  const status = getDigestHistoryStatus(digest);
  const summary =
    digest.summary.length > 0 ? digest.summary : t('dashboard.card.emptySummary');

  return (
    <article className="digest-card digest-detail-card">
      <div className="digest-card-header">
        <div>
          <DigestHistoryStatusBadge status={status} />
          <h2 className="digest-detail-heading">
            {formatDigestPeriod(digest.periodStart, digest.periodEnd, language, timezone)}
          </h2>
        </div>
        <Link to={routeDefinitions.digests.path} className="digest-card-link">
          {t('digests.detail.backToHistory')}
        </Link>
      </div>

      <dl className="digest-meta-grid">
        <div>
          <dt>{t('digests.detail.period')}</dt>
          <dd>{formatDigestPeriod(digest.periodStart, digest.periodEnd, language, timezone)}</dd>
        </div>
        <div>
          <dt>{t('digests.detail.generated')}</dt>
          <dd>{formatDigestTimestamp(digest.generatedAt, language, timezone)}</dd>
        </div>
        <div>
          <dt>{t('digests.detail.lastRefreshed')}</dt>
          <dd>{formatDigestTimestamp(digest.lastRefreshedAt, language, timezone)}</dd>
        </div>
      </dl>

      <section className="digest-detail-section">
        <h3>{t('digests.detail.summary')}</h3>
        <p className="digest-card-summary">{summary}</p>
      </section>

      {digest.sections.executiveSummary ? (
        <section className="digest-detail-section">
          <h3>{t('digests.detail.executiveSummary')}</h3>
          <p className="digest-card-summary">{digest.sections.executiveSummary}</p>
        </section>
      ) : null}

      <SectionList title={t('digests.detail.topSignals')} items={digest.sections.topSignals} />
      <SectionList title={t('digests.detail.signalVsNoise')} items={digest.sections.signalVsNoise} />
      <SectionList
        title={t('digests.detail.leadershipImplications')}
        items={digest.sections.leadershipImplications}
      />
      <SectionList
        title={t('digests.detail.aiOrchestrationImplications')}
        items={digest.sections.aiOrchestrationImplications}
      />
      <SectionList
        title={t('digests.detail.frontendArchitectureImplications')}
        items={digest.sections.frontendArchitectureImplications}
      />

      {digest.sections.recommendedAction ? (
        <section className="digest-detail-section">
          <h3>{t('digests.detail.recommendedAction')}</h3>
          <p className="digest-card-summary">{digest.sections.recommendedAction}</p>
        </section>
      ) : null}

      {digest.termOfDay ? (
        <section className="digest-detail-section">
          <h3>{t('digests.detail.termOfDay')}</h3>
          <p className="digest-card-summary">
            <strong>{digest.termOfDay.term}</strong> — {digest.termOfDay.explanation}
          </p>
        </section>
      ) : null}

      {digest.reflectionPrompt ? (
        <section className="digest-detail-section">
          <h3>{t('digests.detail.reflectionPrompt')}</h3>
          <p className="digest-card-summary">{digest.reflectionPrompt}</p>
        </section>
      ) : null}

      <section className="digest-detail-section">
        <h3>{t('digests.detail.sources')}</h3>
        {digest.items.length === 0 ? (
          <p className="digest-card-summary">{t('dashboard.card.emptySummary')}</p>
        ) : (
          <ul className="digest-source-list">
            {digest.items.map((item) => {
              const saved = isSaved(item.id);

              return (
                <li key={item.id} className="digest-source-item">
                  <div>
                    <p className="digest-source-title">{item.title}</p>
                    <p className="digest-source-meta">
                      {item.sourceLabel} ·{' '}
                      <a href={item.citationUrl} target="_blank" rel="noreferrer">
                        {item.citationUrl}
                      </a>
                    </p>
                  </div>
                  <button
                    type="button"
                    className={saved ? 'ghost-button' : 'primary-button'}
                    disabled={isMutating}
                    onClick={() => {
                      onToggleSave(item);
                    }}
                  >
                    {isMutating
                      ? t('digests.detail.saving')
                      : saved
                        ? t('digests.detail.unsaveItem')
                        : t('digests.detail.saveItem')}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </article>
  );
}
