'use client';

import { cn } from '~/lib/utils';
import { BorderBeam } from '~/components/magic-ui/border-beam'; 
import { ShineBorder } from '~/components/magic-ui/shine-border';
import { NeonGradientCard } from '~/components/magic-ui/neon-gradient-card';

interface TierEffectProps {
  children: React.ReactNode;
  className?: string;
  effectType: 'beam' | 'shine' | 'neon' | 'none';
  colors?: {
    from: string;
    to: string;
  };
  borderRadius?: number;
  borderWidth?: number;
}

export function TierEffect({
  children,
  className,
  effectType,
  colors = {
    from: "#ffaa40",
    to: "#9c40ff"
  },
  borderRadius = 12,
  borderWidth = 3,
}: TierEffectProps) {
  const containerClassName = "h-[34px] min-w-[120px] flex shadow-xl items-center justify-center text-sm";

  const outsideClassName = "h-[28px] min-w-[120px]";
  const insideClassName = "flex size-full items-center justify-center text-sm bg-transparent font-semibold";  

  switch (effectType) {
    case 'beam':
      return (
        <div className="relative inline-block text-foreground">
          <div className={cn(
            containerClassName,
            "relative border rounded-xl text-foreground ",
            className
          )}>
            {children}
            <BorderBeam
              size={50}
              borderWidth={borderWidth}
              colorFrom={colors.from}
              colorTo={colors.to}
              className="!inset-[1px]"
            />
          </div>
        </div>
      );
    
    case 'shine':
      return (
        <div className="relative inline-block text-foreground">
          <ShineBorder
            className={cn("border text-foreground ", containerClassName, className)}
            borderRadius={borderRadius}
            borderWidth={borderWidth}
            color={[colors.from, colors.to]}
          >
            {children}
          </ShineBorder>
        </div>
      );
    
    case 'neon':
      return (
        <div className="relative inline-block text-white">
          <NeonGradientCard
            className={cn(
                outsideClassName,
                "text-white",
                className
              )}
            borderRadius={borderRadius}
            borderSize={borderWidth}
            neonColors={{
              firstColor: colors.from,
              secondColor: colors.to
            }}
            insideClassName={insideClassName}
          >
            {children}
          </NeonGradientCard>
        </div>
      );
    
    default:
      return (
        <div className="relative inline-block">
          <div className={cn(
            containerClassName,
            "relative border rounded-xl text-foreground",
            className
          )}>
            {children}
          </div>
        </div>
      );
  }
}

export function TierEffectShowcase() {
  return (
    <div className="flex gap-4 items-center p-4">
      <TierEffect 
        effectType="beam"
        colors={{ from: "#ffaa40", to: "#9c40ff" }}
      >
        $0.00 / page
      </TierEffect>

      <TierEffect 
        effectType="shine"
        colors={{ from: "#A07CFE", to: "#FE8FB5" }}
      >
        $0.20 / page
      </TierEffect>

      <TierEffect 
        effectType="neon"
        colors={{ from: "#ff00aa", to: "#00FFF1" }}
      >
        $0.10 / page
      </TierEffect>
    </div>
  );
} 