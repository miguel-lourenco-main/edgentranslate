import type { Metadata } from 'next';

import { V2Header } from './_components/v2-header';

import './v2.css';

/**
 * Root layout of the v2 UI variant (#3), served under /v2/.
 *
 * This is a separate root layout from `app/(legacy)`: it loads none of the legacy
 * globals.css, Inter font or RootProviders, and cross-variant links do a full page load.
 * Fonts, styling (Tailwind/shadcn or not), providers and i18n for v2 are left to the
 * design brief; v2.css is a deliberately small placeholder stylesheet.
 */
export default function V2RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="v2">
        <V2Header />
        {children}
      </body>
    </html>
  );
}

// v2 is a rebrand (#3): it must not inherit the legacy name, favicon or Open Graph
// tags from generateRootMetadata. Its name is still pending, so the title is neutral.
export const metadata: Metadata = {
  title: 'New UI (work in progress)',
  // Not indexed while it is a placeholder.
  robots: { index: false, follow: false },
};
