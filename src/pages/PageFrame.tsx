import type { ReactNode } from 'react';
import type { TranslationKey } from '@/shared/i18n/translations';
import { useTranslation } from 'react-i18next';

interface PageFrameProps {
  readonly titleKey: TranslationKey;
  readonly eyebrowKey: TranslationKey;
  readonly descriptionKey: TranslationKey;
  readonly children?: ReactNode;
}

export function PageFrame({ titleKey, eyebrowKey, descriptionKey, children }: PageFrameProps) {
  const { t } = useTranslation();

  return (
    <section className="page-frame">
      <p className="eyebrow">{t(eyebrowKey)}</p>
      <h1>{t(titleKey)}</h1>
      <p className="page-description">{t(descriptionKey)}</p>
      {children}
    </section>
  );
}
