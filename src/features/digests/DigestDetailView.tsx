import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  getDigestItemPresentation,
  sortDigestItemsBySeverity,
} from '@/features/digests/digestItemPresentation';
import type { SupportedLanguage } from '@/shared/i18n/translations';
import { checkSourcePreview } from '@/shared/firebase/sourcePreview';

interface DigestDetailViewProps {
  readonly digest: DigestDocument;
  readonly newerDigest: DigestDocument | null;
  readonly olderDigest: DigestDocument | null;
  readonly isSaved: (itemId: string) => boolean;
  readonly isMutating: boolean;
  readonly onToggleSave: (item: DigestItem) => void;
}

const MAX_VISIBLE_SOURCE_ITEMS = 12;

type PreviewState = 'checking' | 'available' | 'unavailable';

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

function countByValue(values: readonly string[]): Map<string, number> {
  return values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

function topValues(values: readonly string[], limit: number): readonly string[] {
  return [...countByValue(values).entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([value]) => value);
}

function DigestAdjacentLink({
  digest,
  label,
  language,
  timezone,
}: {
  readonly digest: DigestDocument | null;
  readonly label: string;
  readonly language: SupportedLanguage;
  readonly timezone: string;
}) {
  if (!digest) {
    return null;
  }

  return (
    <Link
      to={routeDefinitions.digestDetail.path.replace(':id', digest.id)}
      className="digest-adjacent-link"
      aria-label={label}
    >
      <span>{label}</span>
      <strong>{formatDigestPeriod(digest.periodStart, digest.periodEnd, language, timezone)}</strong>
    </Link>
  );
}

export function DigestDetailView({
  digest,
  newerDigest,
  olderDigest,
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
  const sortedItems = useMemo(() => sortDigestItemsBySeverity(digest.items), [digest.items]);
  const visibleItems = useMemo(
    () => sortedItems.slice(0, MAX_VISIBLE_SOURCE_ITEMS),
    [sortedItems],
  );
  const hiddenItemCount = Math.max(0, digest.items.length - visibleItems.length);
  const itemPresentations = digest.items.map((item) => getDigestItemPresentation(item));
  const criticalCount = itemPresentations.filter((item) => item.severity === 'critical').length;
  const highCount = itemPresentations.filter((item) => item.severity === 'high').length;
  const mediumCount = itemPresentations.filter((item) => item.severity === 'medium').length;
  const topTechnologies = topValues(itemPresentations.flatMap((item) => item.technologies), 4);
  const topSources = topValues(digest.items.map((item) => item.sourceLabel), 3);
  const [previewItem, setPreviewItem] = useState<DigestItem | null>(null);
  const [previewStates, setPreviewStates] = useState<Record<string, PreviewState>>({});
  const requestedPreviewChecks = useRef(new Set<string>());

  useEffect(() => {
    let cancelled = false;

    for (const item of visibleItems) {
      if (requestedPreviewChecks.current.has(item.id)) {
        continue;
      }

      requestedPreviewChecks.current.add(item.id);
      setPreviewStates((current) =>
        current[item.id] ? current : { ...current, [item.id]: 'checking' },
      );
      void checkSourcePreview(item.citationUrl)
        .then((result) => {
          if (cancelled) {
            return;
          }

          setPreviewStates((current) => ({
            ...current,
            [item.id]: result.available ? 'available' : 'unavailable',
          }));
        })
        .catch(() => {
          if (cancelled) {
            return;
          }

          setPreviewStates((current) => ({ ...current, [item.id]: 'unavailable' }));
        });
    }

    return () => {
      cancelled = true;
    };
  }, [visibleItems]);

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

      {olderDigest || newerDigest ? (
        <nav className="digest-adjacent-nav" aria-label={t('digests.detail.relatedDigests')}>
          <DigestAdjacentLink
            digest={olderDigest}
            label={t('digests.detail.previousDigest')}
            language={language}
            timezone={timezone}
          />
          <DigestAdjacentLink
            digest={newerDigest}
            label={t('digests.detail.nextDigest')}
            language={language}
            timezone={timezone}
          />
        </nav>
      ) : null}

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

      <section className="digest-signal-brief" aria-label={t('digests.detail.signalBrief')}>
        <div className="digest-signal-brief-primary">
          <p>{t('digests.detail.signalBrief')}</p>
          <strong>{summary}</strong>
        </div>
        <div className="digest-signal-metrics">
          <div className="digest-signal-metric">
            <span>{digest.items.length}</span>
            <p>{t('digests.detail.metricSignals')}</p>
          </div>
          <div className="digest-signal-metric digest-signal-metric-critical">
            <span>{criticalCount}</span>
            <p>{t('digests.detail.metricCritical')}</p>
          </div>
          <div className="digest-signal-metric digest-signal-metric-high">
            <span>{highCount}</span>
            <p>{t('digests.detail.metricHigh')}</p>
          </div>
          <div className="digest-signal-metric digest-signal-metric-medium">
            <span>{mediumCount}</span>
            <p>{t('digests.detail.metricMedium')}</p>
          </div>
        </div>
        <div className="digest-signal-tags">
          <div>
            <p>{t('digests.detail.topTechnologies')}</p>
            <div>
              {topTechnologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </div>
          <div>
            <p>{t('digests.detail.topSources')}</p>
            <div>
              {topSources.map((source) => (
                <span key={source}>{source}</span>
              ))}
            </div>
          </div>
        </div>
        {digest.sections.recommendedAction ? (
          <div className="digest-signal-action">
            <p>{t('digests.detail.recommendedAction')}</p>
            <strong>{digest.sections.recommendedAction}</strong>
          </div>
        ) : null}
      </section>

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

      <details className="digest-detail-archive">
        <summary>{t('digests.detail.analysisArchive')}</summary>
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
      </details>

      <section className="digest-detail-section">
        <h3>{t('digests.detail.sources')}</h3>
        {digest.items.length === 0 ? (
          <p className="digest-card-summary">{t('dashboard.card.emptySummary')}</p>
        ) : (
          <>
          <div className="digest-source-grid">
            {visibleItems.map((item) => {
              const saved = isSaved(item.id);
              const presentation = getDigestItemPresentation(item);
              const previewState = previewStates[item.id] ?? 'checking';

              return (
                <article key={item.id} className="digest-source-item">
                  <div className={presentation.imageClassName}>
                    {presentation.visualImageUrl ? (
                      <img
                        src={presentation.visualImageUrl}
                        alt={presentation.visualAlt}
                        className="digest-source-image"
                      />
                    ) : null}
                    <span
                      className={`severity-icon severity-icon-${presentation.severity}`}
                      aria-label={t(`digests.severity.${presentation.severity}`)}
                    >
                      {t(`digests.severityShort.${presentation.severity}`)}
                    </span>
                    <img
                      src={presentation.logoUrl}
                      alt={presentation.logoAlt}
                      className="digest-source-logo"
                    />
                  </div>
                  <div className="digest-source-content">
                    <div className="digest-source-badges">
                      {presentation.technologies.map((technology) => (
                        <span key={technology} className="technology-badge">
                          {technology}
                        </span>
                      ))}
                    </div>
                    <p className="digest-source-title">{item.title}</p>
                    {item.synopsis ? (
                      <p className="digest-source-synopsis">
                        <span>{t('digests.detail.itemSynopsis')}</span>
                        {item.synopsis}
                      </p>
                    ) : null}
                    <p className="digest-source-meta">{item.sourceLabel}</p>
                  </div>
                  <div className="digest-source-actions">
                    <button
                      type="button"
                      className="source-action-button"
                      disabled={previewState !== 'available'}
                      onClick={() => {
                        setPreviewItem(item);
                      }}
                    >
                      {previewState === 'unavailable'
                        ? t('digests.detail.previewUnavailable')
                        : previewState === 'checking'
                          ? t('digests.detail.previewChecking')
                          : t('digests.detail.previewItem')}
                    </button>
                    <a
                      href={item.citationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="source-action-button source-action-link"
                    >
                      {t('digests.detail.openOriginal')}
                    </a>
                    <button
                      type="button"
                      className="source-action-button"
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
                  </div>
                </article>
              );
            })}
          </div>
          {previewItem ? (
            <div className="reader-modal-backdrop">
              <section className="source-preview-panel" aria-label={t('digests.detail.previewTitle')}>
              <div className="source-preview-header">
                <div>
                  <p className="source-preview-kicker">{t('digests.detail.previewTitle')}</p>
                  <h4>{previewItem.title}</h4>
                </div>
                <div className="source-preview-actions">
                  <a
                    href={previewItem.citationUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t('digests.detail.openOriginal')}
                    title={t('digests.detail.openOriginal')}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M14 4h6v6h-2V7.41l-8.29 8.3-1.42-1.42 8.3-8.29H14V4Z" />
                      <path d="M5 5h6v2H7v10h10v-4h2v6H5V5Z" />
                    </svg>
                  </a>
                  <button
                    type="button"
                    className="source-preview-close"
                    aria-label={t('digests.detail.closePreview')}
                    title={t('digests.detail.closePreview')}
                    onClick={() => {
                      setPreviewItem(null);
                    }}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="m6.4 5 12.6 12.6-1.4 1.4L5 6.4 6.4 5Z" />
                      <path d="M19 6.4 6.4 19 5 17.6 17.6 5 19 6.4Z" />
                    </svg>
                  </button>
                </div>
              </div>
              <p className="source-preview-note">{t('digests.detail.previewBlockedHint')}</p>
              <iframe
                title={`${t('digests.detail.previewTitle')}: ${previewItem.title}`}
                src={previewItem.citationUrl}
                className="source-preview-frame"
                sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                referrerPolicy="no-referrer"
              />
              </section>
            </div>
          ) : null}
          {hiddenItemCount > 0 ? (
            <p className="digest-source-overflow">
              {t('digests.detail.hiddenSourceCount', { count: hiddenItemCount })}
            </p>
          ) : null}
          </>
        )}
      </section>
    </article>
  );
}
