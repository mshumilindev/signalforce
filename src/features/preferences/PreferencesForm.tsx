import { useTranslation } from 'react-i18next';
import { i18n } from '@/shared/i18n/i18n';
import {
  digestFrequencies,
  digestTones,
  userInterests,
  weekdays,
  type PreferencesFormErrors,
  type PreferencesFormValues,
} from '@/features/preferences/types';
import { frequencyRequiresWeekday } from '@/features/preferences/validation';
import { getTimezoneOptions } from '@/features/preferences/timezones';
import { getBrowserTimezone } from '@/features/preferences/validation';
import { supportedLanguages, type SupportedLanguage } from '@/shared/i18n/translations';
import type { TranslationKey } from '@/shared/i18n/translations';

export type PreferencesFormSection = 'profile' | 'interests' | 'schedule';

interface PreferencesFormProps {
  readonly values: PreferencesFormValues;
  readonly errors: PreferencesFormErrors;
  readonly sections: readonly PreferencesFormSection[];
  readonly onChange: (values: PreferencesFormValues) => void;
}

function FieldError({ messageKey }: { readonly messageKey: TranslationKey | undefined }) {
  const { t } = useTranslation();

  if (!messageKey) {
    return null;
  }

  return (
    <p className="field-error" role="alert">
      {t(messageKey)}
    </p>
  );
}

export function PreferencesForm({ values, errors, sections, onChange }: PreferencesFormProps) {
  const { t } = useTranslation();
  const timezoneOptions = getTimezoneOptions(values.timezone || getBrowserTimezone());
  const showWeekday =
    values.digestFrequency !== '' && frequencyRequiresWeekday(values.digestFrequency);

  const toggleInterest = (interest: (typeof userInterests)[number]) => {
    const hasInterest = values.interests.includes(interest);
    const nextInterests = hasInterest
      ? values.interests.filter((item) => item !== interest)
      : [...values.interests, interest];

    onChange({ ...values, interests: nextInterests });
  };

  return (
    <div className="preferences-form">
      {sections.includes('profile') ? (
        <section className="preferences-section" aria-labelledby="preferences-profile-heading">
          <h2 id="preferences-profile-heading" className="preferences-section-title">
            {t('preferences.sections.profileTitle')}
          </h2>
          <label className="field">
            <span>{t('preferences.fields.language')}</span>
            <select
              value={values.language}
              onChange={(event) => {
                const language = event.target.value as SupportedLanguage | '';
                if (language) {
                  void i18n.changeLanguage(language);
                }
                onChange({ ...values, language });
              }}
            >
              <option value="">{t('preferences.validation.languageRequired')}</option>
              {supportedLanguages.map((language) => (
                <option key={language} value={language}>
                  {t(`language.${language}`)}
                </option>
              ))}
            </select>
            <FieldError messageKey={errors.language} />
          </label>
        </section>
      ) : null}

      {sections.includes('interests') ? (
        <section className="preferences-section" aria-labelledby="preferences-interests-heading">
          <h2 id="preferences-interests-heading" className="preferences-section-title">
            {t('preferences.sections.interestsTitle')}
          </h2>
          <fieldset className="field">
            <legend>{t('preferences.fields.interests')}</legend>
            <p className="field-hint">{t('preferences.hints.interests')}</p>
            <div className="chip-grid">
              {userInterests.map((interest) => {
                const selected = values.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    className={selected ? 'chip chip-selected' : 'chip'}
                    aria-pressed={selected}
                    onClick={() => {
                      toggleInterest(interest);
                    }}
                  >
                    {t(`preferences.interests.${interest}`)}
                  </button>
                );
              })}
            </div>
            <FieldError messageKey={errors.interests} />
          </fieldset>
          <label className="field">
            <span>{t('preferences.fields.digestTone')}</span>
            <select
              value={values.digestTone}
              onChange={(event) => {
                onChange({
                  ...values,
                  digestTone: event.target.value as PreferencesFormValues['digestTone'],
                });
              }}
            >
              <option value="">{t('preferences.validation.toneRequired')}</option>
              {digestTones.map((tone) => (
                <option key={tone} value={tone}>
                  {t(`preferences.tones.${tone}`)}
                </option>
              ))}
            </select>
            <FieldError messageKey={errors.digestTone} />
          </label>
        </section>
      ) : null}

      {sections.includes('schedule') ? (
        <section className="preferences-section" aria-labelledby="preferences-schedule-heading">
          <h2 id="preferences-schedule-heading" className="preferences-section-title">
            {t('preferences.sections.scheduleTitle')}
          </h2>
          <div className="field-grid">
            <label className="field">
              <span>{t('preferences.fields.digestFrequency')}</span>
              <select
                value={values.digestFrequency}
                onChange={(event) => {
                  onChange({
                    ...values,
                    digestFrequency: event.target.value as PreferencesFormValues['digestFrequency'],
                    preferredWeekday: '',
                  });
                }}
              >
                <option value="">{t('preferences.validation.frequencyRequired')}</option>
                {digestFrequencies.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {t(`preferences.frequencies.${frequency}`)}
                  </option>
                ))}
              </select>
              <FieldError messageKey={errors.digestFrequency} />
            </label>
            {showWeekday ? (
              <label className="field">
                <span>{t('preferences.fields.preferredWeekday')}</span>
                <select
                  value={values.preferredWeekday}
                  onChange={(event) => {
                    onChange({
                      ...values,
                      preferredWeekday: event.target.value as PreferencesFormValues['preferredWeekday'],
                    });
                  }}
                >
                  <option value="">{t('preferences.validation.weekdayRequired')}</option>
                  {weekdays.map((weekday) => (
                    <option key={weekday} value={weekday}>
                      {t(`preferences.weekdays.${weekday}`)}
                    </option>
                  ))}
                </select>
                <p className="field-hint">{t('preferences.hints.weekday')}</p>
                <FieldError messageKey={errors.preferredWeekday} />
              </label>
            ) : null}
            <label className="field">
              <span>{t('preferences.fields.preferredTime')}</span>
              <input
                type="time"
                value={values.preferredTime}
                onChange={(event) => {
                  onChange({ ...values, preferredTime: event.target.value });
                }}
              />
              <p className="field-hint">{t('preferences.hints.time')}</p>
              <FieldError messageKey={errors.preferredTime} />
            </label>
            <label className="field">
              <span>{t('preferences.fields.timezone')}</span>
              <select
                value={values.timezone}
                onChange={(event) => {
                  onChange({ ...values, timezone: event.target.value });
                }}
              >
                {timezoneOptions.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
              <FieldError messageKey={errors.timezone} />
            </label>
          </div>
        </section>
      ) : null}
    </div>
  );
}
