import { Interval } from "~/lib/interfaces";

import { Trans } from "~/components/trans";
import { cn } from '~/lib/utils';

import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function FeaturesList(
    props: React.PropsWithChildren<{
      features: string[];
      pageCount: number;
      interval: Interval;
    }>,
  ) {
    return (
      <ul className={'flex flex-col space-y-2'}>
        {props.features.map((feature) => {
  
          let featureText = feature;
          let className = '';
  
          if(feature === '{pagesPerMonth}'){
            featureText = `Pages per ${props.interval}: ${props.pageCount}`;
          }

          if(feature.startsWith('Everything in')){
            className = 'font-semibold';
          }
  
          if(feature === '{languagesLink}'){
  
            featureText = 'Supported Languages';
  
            return (
              <ListItem key={feature}>
                <Link href={'/#supported-languages'} className='underline'>
                  <Trans i18nKey={featureText} defaults={featureText} />
                </Link>
              </ListItem>
            );
          }
  
          return (
            <ListItem key={featureText} textClassName={className}>
              <Trans i18nKey={featureText} defaults={featureText} />
            </ListItem>
          );
        })}
      </ul>
    );
  }
  
  function ListItem({ children, textClassName }: React.PropsWithChildren<{ textClassName?: string }>) {
    return (
      <li className={'flex items-center space-x-2.5'}>
        <CheckCircle className={'text-primary h-4 min-h-4 w-4 min-w-4'} />
  
        <span
          className={cn(textClassName, 'text-sm', {
            ['text-secondary-foreground']: true,
          })}
        >
          {children}
        </span>
      </li>
    );
  }