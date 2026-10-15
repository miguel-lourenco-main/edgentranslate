import { LANGUAGES } from '~/lib/constants';

/**
 * Sample documents shown on the landing page, and the languages each one has a
 * genuine translation for in `public/files/<sample>/<sample>_translated_<lang>.pdf`.
 *
 * To add a language: add the translated PDF (hand-translated samples are rendered with
 * `scripts/sample-translations/render.sh`) and list its code here. Some older
 * `_translated_*` files in public/files are placeholder copies in the wrong language;
 * they are deliberately not listed.
 */
export const SAMPLE_TRANSLATIONS: Record<string, readonly string[]> = {
  'financial_report.pdf': ['en', 'es', 'fr', 'it'],
  'legal_contract.pdf': ['en', 'es', 'fr'],
  'technical_spec.pdf': ['en'],
  'source_code.pdf': ['en', 'es', 'fr'],
};

/**
 * Pick the translation file language for a UI language code: an exact match first,
 * then the base language (e.g. `pt-BR` -> `pt`). Returns null when the sample has no
 * translation in that language.
 */
export function resolveSampleLanguage(sample: string, language: string): string | null {
  const available = SAMPLE_TRANSLATIONS[sample] ?? [];
  if (available.includes(language)) return language;
  const base = language.split('-')[0];
  if (base && available.includes(base)) return base;
  return null;
}

export function getLanguageLabel(language: string): string {
  return LANGUAGES.find((l) => l.value === language)?.label ?? language;
}

/** URL of a file under public/files, honouring the deployment basePath. */
export function sampleFileUrl(folder: string, file: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/files/${folder}/${file}`;
}
