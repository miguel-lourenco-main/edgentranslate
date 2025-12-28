'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { MAX_PAGES_SUBSCRIPTION } from '~/lib/constants';
import {
  BillingConfig,
  type LineItemSchema,
  getPlanIntervals,
  getPrimaryLineItem,
} from '~/lib/schemas/create-billing-schema';
import { formatCurrency } from '~/lib/utils';
import { Badge } from '~/components/shadcn/badge';
import { Button } from '~/components/shadcn/button';
import { If } from '~/components/if';
import { Separator } from '~/components/shadcn/separator';
import { Trans } from '~/components/trans';
import { cn } from '~/lib/utils';

import { LineItemDetails } from '../line-item-details';
import { PageAmountInput } from '~/components/billing/polydoc/page-counter';
import { calculateTieredCost, getBillingInfoForPageCount, getTierText } from '~/lib/billing/utils';
import { CurrentBillingInfo, Interval, Paths } from '~/lib/interfaces';
import FeaturesList from '../features-list';


export function PolydocPricingTable({
  config,
  paths,
  CheckoutButtonRenderer,
  redirectToCheckout = true,
  displayPlanDetails = true,
  alwaysDisplayMonthlyPrice = true,
}: {
  config: BillingConfig;
  paths: Paths;
  displayPlanDetails?: boolean;
  alwaysDisplayMonthlyPrice?: boolean;
  redirectToCheckout?: boolean;
  CheckoutButtonRenderer?: React.ComponentType<{
    planId: string;
    productId: string;
    highlighted?: boolean;
  }>;
}) {
  const intervals = getPlanIntervals(config).filter(Boolean) as Interval[];
  
  const [interval, setInterval] = useState(intervals[0]!);

  const [pageCount, setPageCount] = useState(50);

  const updatePageCount = (value: number) => {
    setPageCount(value);
  };

  const currentBillingInfo: CurrentBillingInfo = useMemo(() => {
    const { product, plan, tier, index } = getBillingInfoForPageCount(
      config.products,
      pageCount,
      interval,
    );

    if (product && tier && plan) {
      return {
        productName: product.name,
        tierText: getTierText(tier, plan.lineItems[0]?.unit),
        tierIndex: index,
      };
    }

    return {
      productName: 'Business',
      tierText: '$0.10 / page',
      tierIndex: 2,
    };
  }, [config.products, interval, pageCount]);

  return (
    <div className={'flex flex-col space-y-8 xl:space-y-12'}>
      <PageAmountInput 
        onPageCountChange={updatePageCount} 
        value={pageCount} 
        billingInfo={currentBillingInfo}
      />
      <div className={'flex justify-center'}>
        {intervals.length > 1 ? (
          <PlanIntervalSwitcher
            intervals={intervals}
            interval={interval}
            setInterval={setInterval}
          />
        ) : null}
      </div>
      <div className={'flex flex-col items-start space-y-6 lg:space-y-0 justify-center lg:flex-row lg:space-x-4'}>
        {config.products.map((product) => {
          const plan = product.plans.find((plan) => {
            if (plan.paymentType === 'recurring') {
              return plan.interval === interval;
            }
            return plan;
          });

          if (!plan) {
            return null;
          }

          const primaryLineItem = getPrimaryLineItem(config, plan.id);

          if (!plan.custom && !primaryLineItem) {
            throw new Error(`Primary line item not found for plan ${plan.id}`);
          }

          const modifiedProduct = { ...product };
          const modifiedLineItem = {...primaryLineItem} as z.infer<typeof LineItemSchema>;

          if (product.id === 'pro' && modifiedLineItem) {
            if (primaryLineItem?.tiers) {
              const tiers = primaryLineItem.tiers;
              modifiedLineItem.cost = calculateTieredCost(pageCount, tiers);
            }
          }

          // Determine if this plan should be highlighted
          const isHighlighted = (
            (product.id === 'free' && pageCount === 5) ||
            (product.id === 'business' && pageCount === MAX_PAGES_SUBSCRIPTION) ||
            (product.id === 'pro' && pageCount > 5 && pageCount < MAX_PAGES_SUBSCRIPTION)
          );
          
          return (
            <PricingItem
              selectable
              key={plan.id}
              plan={plan}
              redirectToCheckout={redirectToCheckout}
              primaryLineItem={modifiedLineItem}
              product={modifiedProduct}
              paths={paths}
              displayPlanDetails={displayPlanDetails}
              alwaysDisplayMonthlyPrice={alwaysDisplayMonthlyPrice}
              CheckoutButton={CheckoutButtonRenderer}
              pageCount={pageCount}
              highlighted={isHighlighted}
              popular={product.id === 'pro'}
            />
          );
        })}
      </div>
    </div>
  );
}

function PricingItem(
  props: React.PropsWithChildren<{
    className?: string;
    displayPlanDetails: boolean;

    paths: Paths;

    selectable: boolean;

    primaryLineItem: z.infer<typeof LineItemSchema> | undefined;

    redirectToCheckout?: boolean;
    alwaysDisplayMonthlyPrice?: boolean;

    plan: {
      id: string;
      custom?: boolean;
      lineItems: z.infer<typeof LineItemSchema>[];
      interval?: Interval;
      name?: string;
      href?: string;
      label?: string;
    };

    CheckoutButton?: React.ComponentType<{
      planId: string;
      productId: string;
      highlighted?: boolean;
    }>;

    product: {
      id: string;
      name: string;
      currency: string;
      description: string;
      badge?: string;
      highlighted?: boolean;
      features: string[];
    };
    pageCount: number;
    highlighted?: boolean;
    popular?: boolean;
  }>,
) {
  //const highlighted = props.product.highlighted ?? false;

  const lineItem = props.primaryLineItem;

  // we exclude flat line items from the details since
  // it doesn't need further explanation
  const lineItemsToDisplay = props.plan.lineItems.filter((item) => {
    return item.type !== 'flat';
  });

  const interval = props.plan.interval as Interval;

  const [openDetails, setOpenDetails] = useState<boolean>(false);

  return (
    <div
      data-cy={'subscription-plan'}
      className={cn(
        props.className,
        `w-full relative flex flex-1 grow flex-col items-stretch justify-between self-stretch rounded-xl border p-8 lg:w-4/12 xl:max-w-100`,
        `transition-all duration-300 ease-in-out`,
        {
          ['border-primary']: props.highlighted,
          ['border-border']: !props.highlighted,
        },
      )}
    >
      {props.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>Popular</Badge>
        </div>
      )}

      <div className={'flex flex-col space-y-6 justify-center'}>
        <div className={'flex flex-col space-y-2.5'}>
          <div className={'flex items-center space-x-6'}>
            <b
              className={
                'text-current-foreground font-heading font-semibold uppercase tracking-tight'
              }
            >
              <Trans
                i18nKey={props.product.name}
                defaults={props.product.name}
              />
            </b>
          </div>

          <span className={cn(`text-muted-foreground h-6 text-sm`)}>
            <Trans
              i18nKey={props.product.description}
              defaults={props.product.description}
            />
          </span>
        </div>

        <Separator />

        <div className={'flex flex-col space-y-2'}>
          <Price isMonthlyPrice={props.alwaysDisplayMonthlyPrice}>
            <LineItemPrice
              plan={props.plan}
              product={props.product}
              interval={interval}
              lineItem={lineItem}
              alwaysDisplayMonthlyPrice={props.alwaysDisplayMonthlyPrice}

            />
          </Price>

          <If condition={props.plan.name}>
            <span
              className={cn(
                `animate-in slide-in-from-left-4 fade-in text-muted-foreground flex items-center space-x-0.5 text-sm capitalize`,
              )}
            >
              <span>
                <If
                  condition={props.plan.interval}
                  fallback={<Trans i18nKey={'billing:lifetime'} />}
                >
                  {(interval) => (
                    <Trans i18nKey={`billing:billingInterval.${interval}`} />
                  )}
                </If>
              </span>

              {/**
               *<If condition={lineItem && lineItem?.type !== 'flat' && props.product.id !== 'business'}>
                  <span>/</span>

                  <span
                    className={cn(
                      `animate-in slide-in-from-left-4 fade-in text-sm capitalize`,
                    )}
                  >
                    <If condition={lineItem?.type === 'per_seat'}>
                      <Trans i18nKey={'billing:perTeamMember'} />
                    </If>

                    <If condition={lineItem?.unit}>
                        <Trans
                          i18nKey={'billing:perUnit'}
                          values={{
                            unit: lineItem?.unit,
                          }}
                        />
                      </If>
                  </span>
                </If>
              */}
            </span>
          </If>
        </div>

        <If condition={props.selectable}>
          <If
            condition={props.plan.id && props.CheckoutButton}
            fallback={
              <DefaultCheckoutButton
                paths={props.paths}
                product={props.product}
                highlighted={props.highlighted}
                plan={props.plan}
                redirectToCheckout={props.redirectToCheckout}
              />
            }
          >
            {(CheckoutButton) => (
              <CheckoutButton
                highlighted={props.highlighted}
                planId={props.plan.id}
                productId={props.product.id}
              />
            )}
          </If>
        </If>

        <Separator />

        <div className={'flex flex-col'}>
          <FeaturesList
            features={props.product.features}
            pageCount={props.pageCount}
            interval={props.plan.interval ?? 'month'}
          />
        </div>

        <If condition={props.displayPlanDetails && lineItemsToDisplay.length}>
          <Separator />

          <div className="overflow-hidden">
            {openDetails ? (
              <div className='flex flex-col space-y-2 items-center justify-center transition-all duration-300 ease-in-out origin-top scale-100 opacity-100'>
                <LineItemDetails
                  selectedInterval={props.plan.interval}
                  currency={props.product.currency}
                  lineItems={lineItemsToDisplay}
                  pageCount={props.pageCount}
                />
                <Button variant={'default'} color='primary' className='w-fit' onClick={() => setOpenDetails(false)}>
                  <Trans i18nKey={'billing:seeLessDetails'} />
                </Button>
              </div>
            ) : (
              <div className='flex justify-center transition-all duration-300 ease-in-out origin-top scale-95'>
                <Button variant={'default'} color='primary' className='w-fit' onClick={() => setOpenDetails(true)}>
                  <Trans i18nKey={'billing:seeMoreDetails'} />
                </Button>
              </div>
            )}
          </div>
        </If>
      </div>
    </div>
  );
}

function Price({
  children,
  isMonthlyPrice = true,
}: React.PropsWithChildren<{
  isMonthlyPrice?: boolean;
}>) {
  return (
    <div
      className={`animate-in slide-in-from-left-4 fade-in flex items-end gap-2 duration-500`}
    >
      <span
        className={
          'font-heading flex items-center text-3xl font-semibold tracking-tighter'
        }
      >
        {children}
      </span>

      <If condition={isMonthlyPrice}>
        <span className={'text-muted-foreground text-sm leading-loose'}>
          <Trans i18nKey={'billing:perMonth'} />
        </span>
      </If>
    </div>
  );
}

function PlanIntervalSwitcher(
  props: React.PropsWithChildren<{
    intervals: Interval[];
    interval: Interval;
    setInterval: (interval: Interval) => void;
  }>,
) {
  return (
    <div className={'flex'}>
      {props.intervals.map((plan, index) => {
        const selected = plan === props.interval;

        const className = cn(
          'focus:!ring-0 !outline-none animate-in transition-all fade-in',
          {
            'rounded-r-none border-r-transparent': index === 0,
            'rounded-l-none': index === props.intervals.length - 1,
            ['hover:text-primary border text-muted-foreground']: !selected,
            ['font-semibold cursor-default hover:text-initial hover:bg-background']:
              selected,
          },
        );

        return (
          <Button
            key={plan}
            variant={'outline'}
            className={className}
            onClick={() => props.setInterval(plan)}
          >
            <span className={'flex items-center space-x-1'}>
              <If condition={selected}>
                <CheckCircle className={'animate-in fade-in zoom-in-90 h-4'} />
              </If>

              <span className={'capitalize'}>
                <Trans i18nKey={`common:billingInterval.${plan}`} />
              </span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}

function DefaultCheckoutButton(
  props: React.PropsWithChildren<{
    plan: {
      id: string;
      name?: string | undefined;
      href?: string;
      buttonLabel?: string;
    };

    product: {
      name: string;
    };

    paths: Paths;
    redirectToCheckout?: boolean;

    highlighted?: boolean;
  }>,
) {
  const { t } = useTranslation('billing');
  
  //const linkHref =props.plan.href ?? `app/billing` ?? '';

  const linkHref = `/`

  const label = props.plan.buttonLabel ?? 'common:getStartedWithPlan';

  return (
    <Link className={'w-full'} href={linkHref}>
      <Button
        size={'lg'}
        className={'border-primary w-full rounded-lg border'}
        variant={props.highlighted ? 'default' : 'outline'}
      >
        <span>
          <Trans
            i18nKey={label}
            defaults={label}
            values={{
              plan: t(props.product.name, {
                defaultValue: props.product.name,
              }),
            }}
          />
        </span>

        <ArrowRight className={'ml-2 h-4'} />
      </Button>
    </Link>
  );
}

function LineItemPrice({
  lineItem,
  plan,
  interval,
  product,
  alwaysDisplayMonthlyPrice = true,
}: {
  lineItem: z.infer<typeof LineItemSchema> | undefined;
  plan: {
    label?: string;
    custom?: boolean;
  };
  interval: Interval | undefined;
  product: {
    currency: string;
  };
  alwaysDisplayMonthlyPrice?: boolean;
}) {
  const { i18n } = useTranslation();
  const isYearlyPricing = interval === 'year';

  const cost = lineItem
    ? isYearlyPricing
      ? alwaysDisplayMonthlyPrice
        ? Number(lineItem.cost / 12).toFixed(2)
        : lineItem.cost
      : lineItem?.cost
    : 0;

  const costString =
    plan.custom
      ? 'Custom'
      : lineItem && formatCurrency({
            currencyCode: product.currency,
            locale: i18n.language,
          value: cost,
        });

  const labelString = plan.label && (
    <Trans i18nKey={plan.label} defaults={plan.label} />
  );

  return costString ?? labelString ?? <Trans i18nKey={'billing:custom'} />;
}