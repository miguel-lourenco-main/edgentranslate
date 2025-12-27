import i18next, { type i18n as I18nType } from 'i18next';
import { cookies, headers } from 'next/headers';

type I18nServerInstance = I18nType & { language: string };

function pickLanguageFromAcceptLanguage(value: string | null | undefined) {
  if (!value) return 'en';
  // "en-US,en;q=0.9" -> "en"
  const first = value.split(',')[0]?.trim();
  if (!first) return 'en';
  return first.split('-')[0] ?? 'en';
}

export async function createI18nServerInstance(): Promise<I18nServerInstance> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const language =
    cookieStore.get('lang')?.value ??
    pickLanguageFromAcceptLanguage(headerStore.get('accept-language')) ??
    'en';

  const instance = i18next.createInstance();

  await instance.init({
    lng: language,
    fallbackLng: 'en',
    defaultNS: 'custom',
    ns: ['custom', 'account'],
    resources: {},
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
  });

  return Object.assign(instance, { language });
}




