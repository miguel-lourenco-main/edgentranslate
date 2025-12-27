import { formatDate } from 'date-fns';
import { BadgeCheck } from 'lucide-react';

import { BillingConfig, getProductPlanPairByVariantId } from '~/lib/schemas/create-billing-schema';
import { Tables } from '~/lib/database.types';
import { Alert, AlertDescription, AlertTitle } from '~/components/shadcn/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/shadcn/card';
import { If } from '~/components/if';
import { Trans } from '~/components/trans';

import { CurrentPlanBadge } from '~/components/billing/polydoc/current-plan-badge';

import CurrentPages from '../polydoc/current-pages';
import { LineItemDetails } from '../line-item-details';

type Subscription = Tables<'subscriptions'>;
type LineItem = Tables<'subscription_items'>;

interface Props {
  scheduledQuantity: number | null;
  scheduledProductId: string | null;
  subscription: Subscription & {
    items: LineItem[];
  };
  config: BillingConfig;
}

export function PolydocCurrentSubscriptionCard({
  scheduledQuantity,
  scheduledProductId,
  subscription,
  config,
}: React.PropsWithChildren<Props>) {
  
  const lineItems = subscription.items;
  const firstLineItem = lineItems[0];

  if (!firstLineItem) {
    throw new Error('No line items found in subscription');
  }

  const isTrial = subscription.status === 'trialing';
  let planId = firstLineItem.variant_id;

  if (isTrial) {
    planId = 'free-monthly';
  }

  const { product, plan } = getProductPlanPairByVariantId(
    config,
    planId,
  );

  if (!product || !plan) {
    throw new Error(
      'Product or plan not found. Did you forget to add it to the billing config?',
    );
  }

  const productLineItems = plan.lineItems;

  let scheduledProductName = null;

  if (scheduledProductId) {
    const { product: scheduledProduct } = getProductPlanPairByVariantId(
      config,
      scheduledProductId,
    );

    scheduledProductName = scheduledProduct.name;

    if(scheduledProductName === 'Free') {
      scheduledQuantity = 5;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Trans i18nKey="billing:planCardTitle" />
        </CardTitle>

        <CardDescription>
          <Trans i18nKey="billing:planCardDescription" />
        </CardDescription>
      </CardHeader>

      <CardContent className={'space-y-4 border-t pt-4 text-sm'}>
        <div className={'flex flex-col space-y-1'}>
          <div className={'flex items-center space-x-2 text-lg font-semibold'}>
            <BadgeCheck
              className={
                's-6 fill-green-500 text-white dark:fill-white dark:text-black'
              }
            />

            <span data-test={'polydoc-current-plan-card-product-name'}>
              {<Trans i18nKey={product.name} defaults={product.name} />}
            </span>

            <CurrentPlanBadge status={subscription.status} />
          </div>

          <div>
            <p className={'text-muted-foreground'}>
              <Trans
                i18nKey={product.description}
                defaults={product.description}
              />
            </p>
          </div>
        </div>

        {/*
         Only show the alert if the subscription requires action
          (e.g. trial ending soon, subscription canceled, etc.)
        */}

        <If condition={subscription.cancel_at_period_end && product.id !== 'free'}>
          <Alert variant={'warning'} className={'w-fit'}>
            <AlertTitle>
              <Trans i18nKey="billing:subscriptionCancelled" />
            </AlertTitle>

            <AlertDescription>
              <Trans i18nKey="billing:cancelledSubscriptionDate" values={{
                plan: scheduledProductName,
                quantity: scheduledQuantity,
                unit: 'pages',
              }} />:
              <span className={'ml-1'}>
                {formatDate(subscription.period_ends_at ?? '', 'P')}
              </span>
            </AlertDescription>
          </Alert>
        </If>

        <If condition={!subscription.cancel_at_period_end && scheduledQuantity && scheduledProductName && subscription.schedule}>
          <Alert variant={'warning'} className={'w-fit'} data-testid={'polydoc-billing-downgrade-subscription-alert'}>
            <AlertTitle>
              <Trans i18nKey="billing:subscriptionDowngraded" />
            </AlertTitle>

            <AlertDescription>
              <Trans i18nKey="billing:downgradedSubscriptionDate" values={{
                plan: scheduledProductName,
                quantity: scheduledQuantity,
                unit: 'pages',
              }} />:
              <span className={'ml-1'}>
                {formatDate(subscription.period_ends_at ?? '', 'P')}
              </span>
            </AlertDescription>
          </Alert>
        </If>

        <div className="flex w-full space-x-12">
          <CurrentPages size="large" />
          <div className="flex flex-col space-y-0.5">
            <span className="font-semibold">
              <Trans i18nKey="billing:detailsLabel" />
            </span>

            <LineItemDetails
              lineItems={productLineItems}
              currency={subscription.currency}
              selectedInterval={firstLineItem.interval}
              pageCount={firstLineItem.quantity}
              subscribed_page={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
