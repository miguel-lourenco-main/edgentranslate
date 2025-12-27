import { cookies } from 'next/headers';

import { cn } from '~/lib/utils';

import { RootProviders } from '~/components/root-providers';
import { heading, sans } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { generateRootMetadata } from '~/lib/root-metdata';

import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = await createI18nServerInstance();
  const theme = await getTheme();
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

async function getTheme() {
  const cookiesStore = await cookies();
  return cookiesStore.get('theme')?.value as 'light' | 'dark' | 'system';
}

export const generateMetadata = generateRootMetadata;

export const runtime = 'edge';
