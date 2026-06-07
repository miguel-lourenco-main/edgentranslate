'use client'

import { Progress } from "~/components/shadcn/progress";
import { cn } from '~/lib/utils';
import { useEffect, useState } from "react";

// TODO: Use UserTokens type when implementing handleCreditsChange
// type UserTokens = {
//   account_id: string;
//   credits: number;
//   monthly_credits: number;
// }

/** Displays remaining page quota; currently uses placeholder values until billing API is wired. */
type CurrentPagesProps = {
  size?: 'small' | 'normal' | 'large'
  collapsed?: boolean
}

const sizeStyles = {
  small: {
    container: 'w-full',
    value: 'text-lg',
    label: 'text-xs',
    progress: 'h-[0.5rem]'
  },
  normal: {
    container: 'w-[30rem]',
    value: 'text-2xl',
    label: 'text-sm',
    progress: 'h-[0.75rem]'
  },
  large: {
    container: 'w-[40rem]',
    value: 'text-3xl',
    label: 'text-sm',
    progress: 'h-[1rem]'
  }
} as const;

export default function CurrentPages({ size = 'normal', collapsed = false }: CurrentPagesProps) {

  const [tokens, setTokens] = useState<number>(0);
  const [monthlyTokens, setMonthlyTokens] = useState<number>(1);

  // TODO: Implement handleCreditsChange when needed
  // const handleCreditsChange = (userTokens: UserTokens) => {
  //   console.log('new userTokens', userTokens);
  //
  //   setTokens(userTokens.credits);
  //   setMonthlyTokens(userTokens.monthly_credits);
  // }

  // Function to fetch credits
  const fetchCredits = async (mounted: boolean) => {
    if (mounted) {
      setTokens(9000);
      setMonthlyTokens(10000);
    }
  };

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      void fetchCredits(mounted);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const styles = sizeStyles[size];

  return (
    <>
      {collapsed ? (
        <p className={cn(tokens.toString().length > 3 && 'text-xs')}>{tokens}</p>
      ):(
        <div className={`flex flex-col space-y-2 ${styles.container}`}>
          <div className="flex space-x-2">
            <div 
              data-test={'polydoc-current-pages-left'} 
              className={`${styles.value} text-foreground font-semibold`}
            >
              {tokens}
            </div>
            <p className={`${styles.label} mb-1 -mr-1 h-fit self-end text-muted-foreground`}>/</p>
            <div 
              data-test={'polydoc-current-pages-monthly'} 
              className={`${styles.label} mb-1 h-fit self-end text-muted-foreground`}
            >
              {monthlyTokens}
            </div>
            <p className={`${styles.label} mb-1 -mr-1 h-fit self-end text-muted-foreground`}>
              tokens left
            </p>
          </div>
          <Progress 
            className={styles.progress} 
            value={tokens > monthlyTokens ? 100 : (tokens/monthlyTokens) * 100} 
            max={monthlyTokens} 
          />
        </div>
      )}
    </>
  );
}
