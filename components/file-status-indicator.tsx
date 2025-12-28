'use client';

import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '~/lib/utils';

export function FileStatusIndicator(props: {
  id?: string;
  status: 'uploading' | 'uploaded' | 'client' | 'error';
  className?: string;
}) {
  const { status, className } = props;

  const base = cn(
    'absolute right-2 top-2 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shadow-sm',
    className,
  );

  switch (status) {
    case 'uploading':
      return (
        <div className={cn(base, 'bg-muted text-foreground')}>
          <Loader2 className="h-3 w-3 animate-spin" />
        </div>
      );
    case 'uploaded':
      return (
        <div className={cn(base, 'bg-emerald-600 text-white')}>
          <CheckCircle2 className="h-3 w-3" />
        </div>
      );
    case 'client':
      return <div className={cn(base, 'bg-muted text-foreground')}>Client</div>;
    case 'error':
      return (
        <div className={cn(base, 'bg-destructive text-destructive-foreground')}>
          <AlertTriangle className="h-3 w-3" />
          Error
        </div>
      );
    default:
      return null;
  }
}


