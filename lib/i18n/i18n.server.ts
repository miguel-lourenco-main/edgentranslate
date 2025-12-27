import i18next, { type i18n as I18nType } from 'i18next';
import { cookies, headers } from 'next/headers';

import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAMESPACE,
  NAMESPACES,
  normalizeLanguage,
  resources,
} from './resources';

type I18nServerInstance = I18nType & { language: string };

function pickLanguageFromAcceptLanguage(value: string | null | undefined) {
  if (!value) return DEFAULT_LANGUAGE;
  // "en-US,en;q=0.9" -> "en"
  const first = value.split(',')[0]?.trim();
  if (!first) return DEFAULT_LANGUAGE;
  return first.split('-')[0] ?? DEFAULT_LANGUAGE;
}

export async function createI18nServerInstance(): Promise<I18nServerInstance> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const language = normalizeLanguage(
    cookieStore.get('lang')?.value ??
      pickLanguageFromAcceptLanguage(headerStore.get('accept-language')) ??
      DEFAULT_LANGUAGE,
  );

  const instance = i18next.createInstance();

  await instance.init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: DEFAULT_NAMESPACE,
    ns: [...NAMESPACES],
    resources,
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
  });

  return Object.assign(instance, { language });
}




