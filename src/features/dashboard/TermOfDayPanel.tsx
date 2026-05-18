import { useTranslation } from 'react-i18next';
import type { DigestTermOfDay } from '@/features/digest/types';

interface TermOfDayPanelProps {
  readonly termOfDay: DigestTermOfDay | null;
}

export function TermOfDayPanel({ termOfDay }: TermOfDayPanelProps) {
  const { t } = useTranslation();

  return (
    <section className="term-of-day-panel" aria-labelledby="term-of-day-heading">
      <p className="eyebrow">{t('dashboard.term.eyebrow')}</p>
      <h2 id="term-of-day-heading">{t('dashboard.term.title')}</h2>
      {termOfDay ? (
        <p>
          <strong>{termOfDay.term}</strong>: {termOfDay.explanation}
        </p>
      ) : (
        <p>{t('dashboard.term.empty')}</p>
      )}
    </section>
  );
}
