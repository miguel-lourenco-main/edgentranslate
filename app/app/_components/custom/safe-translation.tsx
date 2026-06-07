'use client';

import { Loader } from 'lucide-react';
import { useSyncExternalStore } from 'react';

// Defer i18n-dependent table rendering until after hydration; react-i18next
// snapshots can differ between server and client on the first paint.
export function SafeTranslation({ children }: { children: React.ReactNode }) {
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!hasMounted) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Loading Table...</span>
            <Loader className="text-primary animate-spin mt-4" />
        </div>
    );
  }

  return <>{children}</>;
}