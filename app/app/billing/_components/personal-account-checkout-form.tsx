'use client';

import { useState, useTransition, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { PolydocPlanPicker } from '@kit/billing-gateway/components';
import { useAppEvents } from '@kit/shared/events';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';
import billingConfig from '~/config/billing.config';
import { createPersonalAccountCheckoutSession } from '../_lib/server/server-actions';
import { Subscription, LineItem } from '~/lib/types';

const EmbeddedCheckout = dynamic(
  async () => {
    const { EmbeddedCheckout } = await import('@kit/billing-gateway/checkout');
    return { default: EmbeddedCheckout };
  },
  { ssr: false }
);

const MemoizedPlanPicker = memo(PolydocPlanPicker);

function PersonalAccountCheckoutFormComponent(props: {
  customerId: string | null | undefined;
  subscription: Subscription & {
    items: LineItem[];
  } | null;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const appEvents = useAppEvents();
  const [checkoutToken, setCheckoutToken] = useState<string | undefined>(undefined);

  const canStartTrial = !props.customerId;

  const handleSubmit = useCallback(({ planId, productId, pageCount }: { planId: string; productId: string, pageCount: number }) => {
    startTransition(async () => {
      try {
        
        appEvents.emit({
          type: 'checkout.started',
          payload: { planId },
        });

        const { checkoutToken } = await createPersonalAccountCheckoutSession({
          planId,
          productId,
          pageCount,
        });

        setCheckoutToken(checkoutToken);
      } catch (e) {
        console.error(e);
        setError(true);
      }
    });
  }, [appEvents, startTransition]);

  if (checkoutToken) {
    console.log('checkoutToken', checkoutToken);
    return (
      <EmbeddedCheckout
        checkoutToken={checkoutToken}
        provider={billingConfig.provider}
        onClose={() => setCheckoutToken(undefined)}
      />
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'common:subscribeCardTitle'} />
          </CardTitle>
          <CardDescription>
            <Trans i18nKey={'common:subscribeCardDescription'} />
          </CardDescription>
        </CardHeader>
        <CardContent className={'space-y-12'}>
          <If condition={error}>
            <ErrorAlert />
          </If>
          <MemoizedPlanPicker
            pending={pending}
            config={billingConfig}
            canStartTrial={canStartTrial}
            onSubmit={handleSubmit}
            currentSubscriptionVariantId={props.subscription?.items[0]?.variant_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorAlert() {
  return (
    <Alert variant={'destructive'}>
      <ExclamationTriangleIcon className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'common:planPickerAlertErrorTitle'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'common:planPickerAlertErrorDescription'} />
      </AlertDescription>
    </Alert>
  );
}

export const PersonalAccountCheckoutForm = memo(PersonalAccountCheckoutFormComponent);