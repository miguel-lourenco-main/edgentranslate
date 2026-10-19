import { cn } from '~/lib/utils';

import { RootProviders } from '~/components/root-providers';
import { heading, sans } from '~/lib/fonts';
import { generateRootMetadata } from '~/lib/root-metdata';

import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = 'en';
  const theme = undefined;
  const className = getClassName(theme);

  return (
    <html lang={language} className={className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <RootProviders theme={theme} lang={language}>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}

function getClassName(theme?: string) {
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

export const generateMetadata = generateRootMetadata;

// Note: we intentionally do not set `runtime`/`dynamic` here.
// - Normal builds can stay dynamic (cookies/headers).
// - This app is designed to be static-export friendly.
