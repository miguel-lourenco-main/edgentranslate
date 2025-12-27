'use client';

import { ThemeProvider } from 'next-themes';
import { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';

import { initI18nClient } from '~/lib/i18n/i18n.client';

import { AuthProvider } from '~/components/auth-provider';

import { ReactQueryProvider } from './react-query-provider';
import { LandingPageFilesProvider } from './files-provider';
import { SmoothScrollProvider } from '~/lib/hooks/use-smooth-scroll';

export function RootProviders({
  lang,
  theme,
  children,
}: React.PropsWithChildren<{
  lang: string;
  theme?: string;
}>) {
  const i18n = useMemo(() => initI18nClient(lang), [lang]);

  return (
    <ReactQueryProvider>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            enableSystem
            disableTransitionOnChange
            defaultTheme={theme}
            enableColorScheme={false}
          >
            <LandingPageFilesProvider>
              <SmoothScrollProvider>{children}</SmoothScrollProvider>
            </LandingPageFilesProvider>
          </ThemeProvider>
        </AuthProvider>
      </I18nextProvider>
    </ReactQueryProvider>
  );
}
