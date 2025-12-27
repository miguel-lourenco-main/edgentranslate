import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export const i18n = i18next.createInstance();

let initialized = false;

export function initI18nClient(language: string) {
  if (!initialized) {
    // No bundled translations in this simplified repo yet.
    // This still enables `useTranslation()` and `Trans` to function (keys will fall back to the key string).
    void i18n.use(initReactI18next).init({
      lng: language,
      fallbackLng: 'en',
      defaultNS: 'custom',
      ns: ['custom', 'account'],
      resources: {},
      interpolation: { escapeValue: false },
      returnNull: false,
      returnEmptyString: false,
    });

    initialized = true;
    return i18n;
  }

  if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }

  return i18n;
}




