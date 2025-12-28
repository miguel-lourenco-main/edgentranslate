'use client'

import {
  BillingPortalCard,
  PolydocCurrentSubscriptionCard
} from '@kit/billing-gateway/components';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import billingConfig from '~/config/billing.config';

// local imports
import { HomeLayoutPageHeader } from '../../_components/home-page-header';
import { createPersonalAccountBillingPortalSession } from '../_lib/server/server-actions';
import { PersonalAccountCheckoutForm } from './personal-account-checkout-form';
import { Subscription, SubscriptionWithLineItems } from '~/lib/types';
import { getScheduledLineItem } from 'node_modules/@kit/stripe/src/lib/actions';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';
import { UpgradeBillingCard } from './upgrade-billing-card';
import { createAccountsApi } from '@kit/accounts/api';
import { Database } from '~/lib/database.types';

export function BillingPage({
  subscriptionData,
  customerId,
  hasPaymentMethods
}:{
  subscriptionData: SubscriptionWithLineItems | null,
  customerId: string | undefined
  hasPaymentMethods: boolean
}){

  const [subscription, setSubscription] = useState<SubscriptionWithLineItems | null>(subscriptionData);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const subscribeChanges = async () => {
      const client = getSupabaseBrowserClient<Database>();
      
      // Get current user's ID
      const { data: { session } } = await client.auth.getSession();
      const accountId = session?.user.id;
      
      if (accountId) {
        const channelName = `subscriptions-${Math.random().toString(36).slice(2, 9)}`;
        const channel = client.channel(channelName)
          .on(
            'postgres_changes',
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'subscriptions',
              filter: `account_id=eq.${accountId}` 
            },
            (payload): void => {
              console.log('Subscription update received:', payload);
              
              // Create async function to handle the subscription update
              const handleSubscriptionUpdate = async () => {
                const subscriptionPayload = (payload.new as Subscription);
                const api = createAccountsApi(client);
                const subLineItems = await api.getSubscriptionLineItems(subscriptionPayload.id);

                const newData = {
                  ...subscriptionPayload,
                  items: subLineItems
                };
                
                if (newData) {
                  setSubscription(newData);
                }
              };

              // Execute the async function
              void handleSubscriptionUpdate();
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
          });

        cleanup = () => {
          void channel.unsubscribe();
        };
      }
    };

    // Execute the async function
    void subscribeChanges();

    // Return the cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  const [sQuantity, setSQuantity] = useState<number | null>(null);
  const [sProductId, setSProductId] = useState<string | null>(null);

  useEffect(() => {
    const getSchedule = async () => {
      if (subscription?.schedule) {
        const { scheduledQuantity, scheduledProductId } = await getScheduledLineItem(subscription.schedule);
        setSQuantity(scheduledQuantity);
        setSProductId(scheduledProductId);
      }
    };

    void getSchedule();

  }, [subscription]);
  
  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'common:routes.billing'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className={'flex flex-col space-y-4'}>
          <If condition={!subscription}>
            <PersonalAccountCheckoutForm customerId={customerId} subscription={subscription} />

            <If condition={customerId}>
              <CustomerBillingPortalForm />
            </If>
          </If>

          <If condition={subscription}>
            {(subscription) => (
              <div className={'flex w-full flex-col space-y-6'}>
                <PolydocCurrentSubscriptionCard
                  scheduledQuantity={sQuantity}
                  scheduledProductId={sProductId}
                  subscription={subscription}
                  config={billingConfig}
                />

                <If condition={!hasPaymentMethods}>
                  <UpgradeBillingCard/>
                </If>

                <If condition={hasPaymentMethods}>
                  <CustomerBillingPortalForm />
                </If>
              </div>
            )}
          </If>
        </div>
      </PageBody>
    </>
  );
}
  
function CustomerBillingPortalForm() {
  return (
    <form action={createPersonalAccountBillingPortalSession}>
      <BillingPortalCard />
    </form>
  );
}
