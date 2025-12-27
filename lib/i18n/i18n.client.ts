import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAMESPACE,
  NAMESPACES,
  normalizeLanguage,
  resources,
} from './resources';

export const i18n = i18next.createInstance();

let initialized = false;

export function initI18nClient(language: string) {
  const lng = normalizeLanguage(language) ?? DEFAULT_LANGUAGE;

  if (!initialized) {
    void i18n.use(initReactI18next).init({
      lng,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS: DEFAULT_NAMESPACE,
      ns: [...NAMESPACES],
      resources,
      interpolation: { escapeValue: false },
      returnNull: false,
      returnEmptyString: false,
    });

    initialized = true;
    return i18n;
  }

  if (i18n.language !== lng) {
    void i18n.changeLanguage(lng);
  }

  return i18n;
}




