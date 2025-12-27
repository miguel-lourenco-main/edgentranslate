'use client';

import { PlusSquare } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { LineItemSchema } from '~/lib/schemas/create-billing-schema';
import { formatCurrency, getCurrentTier } from '~/lib/utils';
import { If } from '~/components/if';
import { Trans } from '~/components/trans';
import { cn } from '~/lib/utils';
import { isActiveTier } from '~/lib/billing/utils';

const className = 'flex text-secondary-foreground items-center text-sm';

export function LineItemDetails(
  props: React.PropsWithChildren<{
    lineItems: z.infer<typeof LineItemSchema>[];
    currency: string;
    selectedInterval?: string | undefined;
    pageCount?: number;
    subscribed_page?: boolean
  }>,
) {
  const locale = useTranslation().i18n.language;
  const currencyCode = props?.currency.toLowerCase();

  return (
    <div className={'flex flex-col space-y-1'}>
      {props.lineItems.map((item, index) => {
        // If the item has a description, we render it as a simple text
        // and pass the item as values to the translation so we can use
        // the item properties in the translation.
        if (item.description) {
          return (
            <div key={index} className={className}>
              <span className={'flex items-center space-x-1.5'}>
                <PlusSquare className={'w-4'} />

                <Trans
                  i18nKey={item.description}
                  values={item}
                  defaults={item.description}
                />
              </span>
            </div>
          );
        }

        const SetupFee = () => (
          <If condition={item.setupFee}>
            <div className={className}>
              <span className={'flex items-center space-x-1'}>
                <PlusSquare className={'w-3'} />

                <span>
                  <Trans
                    i18nKey={'billing:setupFee'}
                    values={{
                      setupFee: formatCurrency({
                        currencyCode,
                        value: item.setupFee as number,
                        locale,
                      }),
                    }}
                  />
                </span>
              </span>
            </div>
          </If>
        );

        const FlatFee = () => (
          <div className={'flex flex-col'}>
            <div className={cn(className, 'space-x-1')}>
              <span className={'flex items-center space-x-1'}>
                <span className={'flex items-center space-x-1.5'}>
                  <PlusSquare className={'w-3'} />

                  <span>
                    <Trans i18nKey={'billing:basePlan'} />
                  </span>
                </span>

                <span>
                  <If
                    condition={props.selectedInterval}
                    fallback={<Trans i18nKey={'billing:lifetime'} />}
                  >
                    (
                    <Trans
                      i18nKey={`billing:billingInterval.${props.selectedInterval}`}
                    />
                    )
                  </If>
                </span>
              </span>

              <span>-</span>

              <span className={'text-xs font-semibold'}>
                {formatCurrency({
                  currencyCode,
                  value: item.cost * (props.pageCount ?? 1),
                  locale,
                })}
              </span>
            </div>

            <SetupFee />

            <If condition={item.tiers?.length}>
              <span className={'flex items-center space-x-1.5'}>
                <PlusSquare className={'w-3'} />

                <span className={'flex space-x-1 text-sm'}>
                  <span>
                    <Trans
                      i18nKey={'billing:perUnit'}
                      values={{
                        unit: item.unit,
                      }}
                    />
                  </span>
                </span>
              </span>

              <Tiers item={item} currency={props.currency} />
            </If>
          </div>
        );

        const PerSeat = () => (
          <div key={index} className={'flex flex-col'}>
            <div className={className}>
              <span className={'flex items-center space-x-1.5'}>
                <PlusSquare className={'w-3'} />

                <span>
                  <Trans i18nKey={'billing:perTeamMember'} />
                </span>
              </span>

              <If condition={!item.tiers?.length}>
                <span className={'font-semibold'}>
                  {formatCurrency({
                    currencyCode,
                    value: item.cost,
                    locale,
                  })}
                </span>
              </If>
            </div>

            <SetupFee />

            <If condition={item.tiers?.length}>
              <Tiers item={item} currency={props.currency} />
            </If>
          </div>
        );

        const Metered = () => (
          <div key={index} className={'flex flex-col'}>
            <div className={className}>
              <span className={'flex items-center space-x-1'}>
                <span className={'flex items-center space-x-1.5'}>
                  <PlusSquare className={'w-3'} />

                  <span className={'flex space-x-1'}>
                    <span>
                      <Trans
                        i18nKey={'billing:perUnit'}
                        values={{
                          unit: item.unit,
                        }}
                      />
                    </span>
                  </span>
                </span>
              </span>

              {/* If there are no tiers, there is a flat cost for usage */}
              <If condition={!item.tiers?.length}>
                <span className={'font-semibold'}>
                  {formatCurrency({
                    currencyCode,
                    value: item.cost,
                    locale,
                  })}
                </span>
              </If>
            </div>

            <SetupFee />

            {/* If there are tiers, we render them as a list */}
            <If condition={item.tiers?.length}>
              <Tiers item={item} currency={props.currency} />
            </If>
          </div>
        );

        const Tiered = () => (
          <div key={index} className={'flex flex-col'}>
            <div className={className}>
              <span className={'flex items-center space-x-1'}>
                <span className={'flex items-center space-x-1.5'}>
                  <PlusSquare className={'w-3'} />

                  <span className={'flex space-x-1'}>
                    <span>
                      <If condition={!props.subscribed_page}>
                        <Trans
                          i18nKey={'billing:proPlanTiers'}
                        />
                      </If>
                      <If condition={props.subscribed_page}>
                        <Trans
                          i18nKey={'billing:currentTier'}
                        />
                      </If>
                    </span>
                  </span>
                </span>
              </span>
            </div>

            <SetupFee />

            {/* If there are tiers, we render them as a list */}
            <If condition={item.tiers?.length && !props.subscribed_page}>
              <VolumeTiers item={item} currency={props.currency} currentPages={props.pageCount ?? 0} />
            </If>

            <If condition={props.subscribed_page}>
              <CurrentTier item={item} currency={props.currency} pageCount={props.pageCount ?? 0}/>
            </If>

          </div>
        );

        switch (item.type) {
          case 'flat':
            return <FlatFee key={item.id} />;

          case 'per_seat':
            return <PerSeat key={item.id} />;

          case 'metered': {
            return <Metered key={item.id} />;
          }
          case 'tiered': {
            return <Tiered key={item.id} />;
          }
        }
      })}
    </div>
  );
}

interface TierProps {
  currency: string;
  item: z.infer<typeof LineItemSchema>;
  index: number;
  tier: {
    cost: number;
    upTo: number | "unlimited";
  };
  isActive?: boolean;
}

function Tier({
  currency,
  item,
  index,
  tier,
  isActive = false
}: TierProps) {
  const unit = item.unit;
  const locale = useTranslation().i18n.language;

  const previousTier = item.tiers?.[index - 1];
  const isLastTier = tier.upTo === 'unlimited';

  const upTo = tier.upTo;

  return (
    <span
      className={cn(
        'text-secondary-foreground flex w-fit space-x-1 text-xs p-2 rounded-md transition-all duration-200',
        {
          'shadow-md bg-primary/5 border border-primary/20': isActive,
          'hover:bg-muted/50': !isActive
        }
      )}
      key={index}
    >
      <span>-</span>

      <If condition={isLastTier}>
        <span className={'font-bold'}>
          {formatCurrency({
            currencyCode: currency.toLowerCase(),
            value: tier.cost,
            locale,
          })}
        </span>

        <span>
          <Trans
            i18nKey={'billing:perPage'}
            values={{ unit }}
          />
        </span>

        <span>
          <Trans
            i18nKey={'billing:andAbove'}
            values={{
              unit,
              previousTier: previousTier ? previousTier.upTo : 0,
            }}
          />
        </span>
      </If>

      <If condition={!isLastTier}>
        <span className={'font-bold'}>
          {formatCurrency({
            currencyCode: currency.toLowerCase(),
            value: tier.cost,
            locale,
          })}
        </span>

        <span>
          <Trans
            i18nKey={'billing:perPage'}
            values={{ unit }}
          />
        </span>

        <span>
          <Trans
            i18nKey={'billing:fromPreviousTierUpTo'}
            values={{
              previousTierFrom: previousTier ? (previousTier.upTo as number) + 1 : 1,
              unit,
              upTo
            }}
          />
        </span>
      </If>
    </span>
  );
}

function CurrentTier({
  currency,
  item,
  pageCount
}: {
  currency: string;
  item: z.infer<typeof LineItemSchema>;
  pageCount: number
}){

  if(item.tiers){
    const tiersUpTo = item.tiers.map((tier) => tier.upTo)

    const index = getCurrentTier(pageCount, tiersUpTo)
    const tier = item.tiers[index]

    if(tier){

      return (
        <Tier 
          currency={currency} 
          item={item}
          index={index}
          tier={tier}
        />
      )
    }else{
      return(
        <Trans i18nKey={'billing:errorGettingTier'}/>
      )
    }
  }
  else{
    return(
      <Trans i18nKey={'billing:errorGettingTier'}/>
    )
  }
}

function Tiers({
  currency,
  item,
}: {
  currency: string;
  item: z.infer<typeof LineItemSchema>;
}) {
  const unit = item.unit;
  const locale = useTranslation().i18n.language;

  const tiers = item.tiers?.map((tier, index) => {
    const tiersLength = item.tiers?.length ?? 0;
    const previousTier = item.tiers?.[index - 1];
    const isLastTier = tier.upTo === 'unlimited';

    const previousTierFrom =
      previousTier?.upTo === 'unlimited'
        ? 'unlimited'
        : previousTier === undefined
          ? 0
          : previousTier.upTo + 1 || 0;

    const upTo = tier.upTo;
    const isIncluded = tier.cost === 0;

    return (
      <span
        className={'text-secondary-foreground flex space-x-1 text-xs'}
        key={index}
      >
        <span>-</span>

        <If condition={isLastTier}>
          <span className={'font-bold'}>
            {formatCurrency({
              currencyCode: currency.toLowerCase(),
              value: tier.cost,
              locale,
            })}
          </span>

          <If condition={tiersLength > 1}>
            <span>
              <Trans
                i18nKey={'billing:andAbove'}
                values={{
                  unit,
                  previousTier: (previousTierFrom as number) - 1,
                }}
              />
            </span>
          </If>

          <If condition={tiersLength === 1}>
            <span>
              <Trans
                i18nKey={'billing:forEveryUnit'}
                values={{
                  unit,
                }}
              />
            </span>
          </If>
        </If>

        <If condition={!isLastTier}>
          <If condition={isIncluded}>
            <span>
              <Trans i18nKey={'billing:includedUpTo'} values={{ unit, upTo }} />
            </span>
          </If>

          <If condition={!isIncluded}>
            <span className={'font-bold'}>
              {formatCurrency({
                currencyCode: currency.toLowerCase(),
                value: tier.cost,
                locale,
              })}
            </span>

            <span>
              <Trans
                i18nKey={'billing:fromPreviousTierUpTo'}
                values={{ previousTierFrom, unit, upTo }}
              />
            </span>
          </If>
        </If>
      </span>
    );
  });

  return <div className={'my-1 flex flex-col space-y-1.5'}>{tiers}</div>;
}

function VolumeTiers({
  currency,
  item,
  currentPages
}: {
  currency: string;
  item: z.infer<typeof LineItemSchema>;
  currentPages: number;
}) {
  const tiers = item.tiers?.map((tier, index) => {
    const isActive = isActiveTier(currentPages, index, item.tiers);
    
    return (
      <Tier
        key={index}
        currency={currency} 
        item={item}
        index={index}
        tier={tier}
        isActive={isActive}
      />
    );
  });

  return <div className={'my-1 flex flex-col space-y-1.5'}>{tiers}</div>;
}