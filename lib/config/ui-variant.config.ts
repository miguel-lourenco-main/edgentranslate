/**
 * The two UI variants (#3). Both live in one build as separate root layouts:
 * `app/(legacy)` serves the current UI at the site root, `app/(v2)` serves the new
 * variant under /v2/. Paths are app-relative; next/link adds BASE_PATH.
 */
export type UiVariant = 'legacy' | 'v2';

export const UI_VARIANT_PATHS: Record<UiVariant, string> = {
  legacy: '/',
  v2: '/v2/',
};

/**
 * Whether the legacy header shows "Try the new UI". Off by default while /v2/ is only
 * a work-in-progress placeholder; set NEXT_PUBLIC_SHOW_V2_LINK=1 at build time to turn
 * it on. /v2/ itself is always built and always links back to legacy.
 */
export const SHOW_V2_LINK = ['1', 'true', 'yes'].includes(
  process.env.NEXT_PUBLIC_SHOW_V2_LINK ?? '',
);
