import { useTranslation } from 'react-i18next';
import type { DigestFreshness } from '@/features/dashboard/digestFreshness';

interface DigestStatusBadgeProps {
  readonly freshness: DigestFreshness;
}

export function DigestStatusBadge({ freshness }: DigestStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <span className={`digest-status-badge digest-status-${freshness}`}>
      {t(`dashboard.freshness.${freshness}`)}
    </span>
  );
}
