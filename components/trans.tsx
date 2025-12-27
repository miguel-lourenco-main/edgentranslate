/**
 * App-wide `<Trans />` wrapper.
 *
 * IMPORTANT:
 * - We must use the context-based `react-i18next` `<Trans />` so it picks up the
 *   `I18nextProvider` instance from `components/root-providers.tsx`.
 * - `TransWithoutContext` looks for a global/default i18n instance and will log
 *   `NO_I18NEXT_INSTANCE` in this app because we use a custom i18n instance.
 */
'use client';

import { Trans as TransComponent } from 'react-i18next';

export function Trans({ className, ...props }: React.ComponentProps<typeof TransComponent> & { className?: string }) {
  return <TransComponent {...props} className={className} />;
}
