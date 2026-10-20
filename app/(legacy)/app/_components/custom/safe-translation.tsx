'use client';

import { Loader } from 'lucide-react';
import { useSyncExternalStore } from 'react';

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