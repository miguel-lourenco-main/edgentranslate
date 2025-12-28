import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

// local imports
import { BillingPage } from './_components/billing-page';
import { loadPersonalAccountBillingPageData } from './_lib/server/personal-account-billing-page.loader';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { Subscription, LineItem } from '~/lib/types';
import { getPaymentMethods } from '@kit/stripe';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:billingTab');

  return {
    title,
  };
};

async function PersonalAccountBillingPage() {

  const user = await requireUserInServerComponent();
  const [data, customerId] = await loadPersonalAccountBillingPageData(user.id);

  const hasPaymentMethods = customerId ? (await getPaymentMethods(customerId)).data.length > 0 : false;

  return (
    <BillingPage 
      subscriptionData={data as Subscription & {
        items: LineItem[];
      } | null} 
      customerId={customerId}
      hasPaymentMethods={hasPaymentMethods}
    />
  );
}

export default withI18n(PersonalAccountBillingPage);
