import { cn } from '~/lib/utils';

import { RootProviders } from '~/components/root-providers';
import { heading, sans } from '~/lib/fonts';

import '../globals.css';

/**
 * The legacy UI's <html>/<body> shell: globals.css, the Inter font variables and
 * RootProviders (i18n, theme, react-query, files, smooth scroll, toaster).
 *
 * `app/(legacy)` and `app/(v2)` are separate root layouts (#3), so none of this reaches
 * the v2 variant. It is shared by `app/(legacy)/layout.tsx` and `app/global-not-found.tsx`,
 * which keeps the exported 404.html looking like the legacy UI.
 */
export function LegacyRoot({ children }: React.PropsWithChildren) {
  const language = 'en';
  const theme = undefined;

  return (
    <html lang={language} className={getClassName()} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <RootProviders theme={theme} lang={language}>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}

function getClassName() {
  const font = [sans.variable, heading.variable].reduce<string[]>(
    (acc, curr) => {
      if (acc.includes(curr)) return acc;

      return [...acc, curr];
    },
    [],
  );

  // Note: theme classes (`dark`/`light`) are applied client-side by `next-themes`.
  // We intentionally do not stamp them server-side to avoid hydration mismatches when
  // cookie/localStorage/system preferences disagree.
  return cn('min-h-screen bg-background antialiased', ...font);
}
