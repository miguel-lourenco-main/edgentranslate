import { ReactNode } from 'react';

interface GradientSecondaryTextProps {
  children: ReactNode;
}

export function GradientSecondaryText({ children }: GradientSecondaryTextProps) {
  return (
    <span className="bg-gradient-to-r from-foreground/60 to-foreground/40 bg-clip-text text-transparent">
      {children}
    </span>
  );
}



