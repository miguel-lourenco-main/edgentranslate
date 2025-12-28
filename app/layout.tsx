import { cookies } from 'next/headers';

import { cn } from '~/lib/utils';

import { RootProviders } from '~/components/root-providers';
import { heading, sans } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { generateRootMetadata } from '~/lib/root-metdata';

import './globals.css';

const isStaticExport =
  process.env.GITLAB_PAGES === 'true' || process.env.GITLAB_PAGES === '1';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = isStaticExport ? 'en' : (await createI18nServerInstance()).language;
  const theme = isStaticExport ? undefined : await getTheme();
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

// Note: we intentionally do not set `runtime`/`dynamic` here.
// - Normal builds can stay dynamic (cookies/headers).
// - GitLab Pages builds avoid request-time APIs via `isStaticExport` branches above.
