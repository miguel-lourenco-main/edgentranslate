/**
 * Which UI variant this build is, and where the other one lives (#3).
 *
 * The site root serves the current UI from `main`; the frozen `legacy` branch is built
 * under `/legacy` by the `build_legacy` CI job with NEXT_PUBLIC_UI_VARIANT=legacy.
 * NEXT_PUBLIC_ALTERNATE_UI_URL is an absolute path outside this build's basePath (e.g.
 * "/" from legacy, "/legacy/" from the root); when it is unset, no switch link is shown.
 */
export type UiVariant = 'current' | 'legacy';

export const UI_VARIANT: UiVariant =
  process.env.NEXT_PUBLIC_UI_VARIANT === 'legacy' ? 'legacy' : 'current';

export const ALTERNATE_UI_URL: string | null = process.env.NEXT_PUBLIC_ALTERNATE_UI_URL || null;
