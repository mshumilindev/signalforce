import { useTranslation } from 'react-i18next';
import type { DigestHistoryStatus } from '@/features/digest/getDigestHistoryStatus';

interface DigestHistoryStatusBadgeProps {
  readonly status: DigestHistoryStatus;
}

export function DigestHistoryStatusBadge({ status }: DigestHistoryStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <span className={`digest-status-badge digest-history-status-${status}`}>
      {t(`digests.status.${status}`)}
    </span>
  );
}
