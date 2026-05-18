import { useTranslation } from 'react-i18next';
import { supportedLanguages, type SupportedLanguage } from '@/shared/i18n/translations';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const selectedLanguage = supportedLanguages.includes(i18n.resolvedLanguage as SupportedLanguage)
    ? (i18n.resolvedLanguage as SupportedLanguage)
    : 'en';

  return (
    <label className="language-switcher">
      <span>{t('language.label')}</span>
      <select
        value={selectedLanguage}
        onChange={(event) => void i18n.changeLanguage(event.target.value)}
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {t(`language.${language}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
