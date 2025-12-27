'use client';

import { If } from '~/components/if';
import { createRef, useEffect } from 'react';

import type { LoadingBarRef } from 'react-top-loading-bar';
import LoadingBar from 'react-top-loading-bar';

import type { PropsWithChildren } from 'react';

import { cn } from '~/lib/utils';
import { Spinner } from '~/components/spinner';

let running = false;

export function GlobalLoader({
  displayLogo = false,
  fullPage = false,
  displaySpinner = true,
  displayTopLoadingBar = true,
  children,
}: React.PropsWithChildren<{
  displayLogo?: boolean;
  fullPage?: boolean;
  displaySpinner?: boolean;
  displayTopLoadingBar?: boolean;
}>) {
  return (
    <>
      <If condition={displayTopLoadingBar}>
        <TopLoadingBarIndicator />
      </If>

      <If condition={displaySpinner}>
        <div
          className={
            'zoom-in-80 flex flex-1 flex-col items-center justify-center duration-500 animate-in fade-in slide-in-from-bottom-12'
          }
        >
          <LoadingOverlay displayLogo={displayLogo} fullPage={fullPage} />

          {children}
        </div>
      </If>
    </>
  );
}

export function TopLoadingBarIndicator() {
  const ref = createRef<LoadingBarRef>();

  useEffect(() => {
    if (!ref.current || running) {
      return;
    }

    running = true;

    const loadingBarRef = ref.current;

    loadingBarRef.continuousStart(0, 300);

    return () => {
      loadingBarRef.complete();
      running = false;
    };
  }, [ref]);

  return (
    <LoadingBar
      className={'bg-primary'}
      height={4}
      waitingTime={0}
      shadow
      color={''}
      ref={ref}
    />
  );
}

export function LoadingOverlay({
  children,
  className,
  fullPage = true,
  spinnerClassName,
}: PropsWithChildren<{
  className?: string;
  spinnerClassName?: string;
  fullPage?: boolean;
  displayLogo?: boolean;
}>) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4',
        className,
        {
          [`fixed left-0 top-0 z-100 h-screen w-screen bg-background`]:
            fullPage,
        },
      )}
    >
      <Spinner className={spinnerClassName} />

      <div className={'text-sm text-muted-foreground'}>{children}</div>
    </div>
  );
}