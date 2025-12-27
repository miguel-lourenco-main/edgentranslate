/**
 * Central place to define supported languages, namespaces, and bundled resources.
 *
 * Why bundle JSON instead of loading from `/public` at runtime?
 * - The app uses the Edge runtime (`app/layout.tsx` exports `runtime = 'edge'`).
 * - Edge runtime cannot use Node.js `fs` to read locale files.
 * - Bundling JSON imports works both on the server (Edge) and client, and avoids
 *   needing an i18next backend plugin.
 */
import type { Resource } from 'i18next';

import enAccount from '../../public/locales/en/account.json';
import enAuth from '../../public/locales/en/auth.json';
import enBilling from '../../public/locales/en/billing.json';
import enCommon from '../../public/locales/en/common.json';
import enCustom from '../../public/locales/en/custom.json';
import enMarketing from '../../public/locales/en/marketing.json';
import enTeams from '../../public/locales/en/teams.json';
import enUi from '../../public/locales/en/ui.json';

export const DEFAULT_LANGUAGE = 'en' as const;

export const NAMESPACES = [
  'common',
  'ui',
  'auth',
  'billing',
  'marketing',
  'custom',
  'account',
  'teams',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

export const DEFAULT_NAMESPACE: Namespace = 'common';

export const resources: Resource = {
  en: {
    account: enAccount,
    auth: enAuth,
    billing: enBilling,
    common: enCommon,
    custom: enCustom,
    marketing: enMarketing,
    teams: enTeams,
    ui: enUi,
  },
};

export const SUPPORTED_LANGUAGES = Object.keys(resources);

export function normalizeLanguage(language: string | null | undefined) {
  const value = (language ?? '').trim();
  if (!value) return DEFAULT_LANGUAGE;

  // "en-US" -> "en"
  const base = value.split('-')[0] ?? DEFAULT_LANGUAGE;
  return SUPPORTED_LANGUAGES.includes(base) ? base : DEFAULT_LANGUAGE;
}


