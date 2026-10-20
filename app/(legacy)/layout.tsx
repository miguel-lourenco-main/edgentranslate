import { generateRootMetadata } from '~/lib/root-metdata';

import { LegacyRoot } from './_components/legacy-root';

/**
 * Root layout of the legacy UI. `app/(v2)` has its own root layout, so the legacy
 * CSS, fonts and providers stay inside this group (#3).
 */
export default function LegacyRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LegacyRoot>{children}</LegacyRoot>;
}

export const generateMetadata = generateRootMetadata;

// Note: we intentionally do not set `runtime`/`dynamic` here.
// - Normal builds can stay dynamic (cookies/headers).
// - This app is designed to be static-export friendly.
