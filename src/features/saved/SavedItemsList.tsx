import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routeDefinitions } from '@/app/routes';
import { formatDigestTimestamp } from '@/features/dashboard/formatDigestTimestamp';
import type { SavedItemRecord } from '@/features/saved/types';
import { useAuth } from '@/features/auth/useAuth';
import type { SupportedLanguage } from '@/shared/i18n/translations';

interface SavedItemsListProps {
  readonly items: readonly SavedItemRecord[];
}

export function SavedItemsList({ items }: SavedItemsListProps) {
  const { t, i18n } = useTranslation();
  const { userDocument } = useAuth();
  const language = (i18n.resolvedLanguage ?? 'en') as SupportedLanguage;
  const timezone = userDocument?.preferences?.timezone ?? 'UTC';

  return (
    <ul className="saved-items-list">
      {items.map((item) => (
        <li key={item.id} className="saved-item-card">
          <article className="digest-card">
            <h2 className="digest-card-title">{item.title}</h2>
            <p className="digest-source-meta">
              {item.sourceLabel} ·{' '}
              <a href={item.citationUrl} target="_blank" rel="noreferrer">
                {t('saved.list.openSource')}
              </a>
            </p>
            <p className="digest-source-meta">
              {t('saved.list.savedAt')}:{' '}
              {formatDigestTimestamp(item.savedAt, language, timezone)}
            </p>
            <Link
              to={routeDefinitions.digestDetail.path.replace(':id', item.digestId)}
              className="digest-card-link"
            >
              {t('saved.list.openDigest')}
            </Link>
          </article>
        </li>
      ))}
    </ul>
  );
}
