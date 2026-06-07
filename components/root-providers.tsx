'use client';

import { ThemeProvider } from 'next-themes';
import { useMemo } from 'react';
import { I18nextProvider } from 'react-i18next';

import { initI18nClient } from '~/lib/i18n/i18n.client';

import { AuthProvider } from '~/components/auth-provider';
import { Toaster } from '~/components/shadcn/sonner';

import { ReactQueryProvider } from './react-query-provider';
import { LandingPageFilesProvider } from './files-provider';
import { SmoothScrollProvider } from '~/lib/hooks/use-smooth-scroll';

// Provider order: data fetching → i18n → auth → theme → landing workflow → scroll.
declare global {
  // pdfjs-dist@5 uses Promise.withResolvers; Firefox may not have it depending on version/config.
  interface PromiseConstructor {
    withResolvers<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: unknown) => void;
    };
  }
}

if (typeof Promise.withResolvers !== 'function') {
  Promise.withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}

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
            defaultTheme={theme ?? 'system'}
            enableColorScheme={false}
          >
            <LandingPageFilesProvider>
              <SmoothScrollProvider>
                {children}
                <Toaster richColors={true} position="top-center" />
              </SmoothScrollProvider>
            </LandingPageFilesProvider>
          </ThemeProvider>
        </AuthProvider>
      </I18nextProvider>
    </ReactQueryProvider>
  );
}
