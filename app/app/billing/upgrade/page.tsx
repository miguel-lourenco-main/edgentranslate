import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

// local imports
import { loadPersonalAccountBillingPageData } from '../_lib/server/personal-account-billing-page.loader';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { PersonalAccountCheckoutForm } from '../_components/personal-account-checkout-form';
import { PageBody } from '@kit/ui/page';
import { AppBreadcrumbs } from '@kit/ui/app-breadcrumbs';
import { HomeLayoutPageHeader } from '../../_components/home-page-header';
import { SubscriptionWithLineItems } from '~/lib/types';
import { Trans } from '@kit/ui/trans';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('billing:upgradeTab');

  return {
    title,
  };
};

// apps/polydoc/app/app/(user)/billing/upgrade/page.tsx
async function UpgradePersonalAccountBillingPage() {
  const user = await requireUserInServerComponent();
  const [data, customerId] = await loadPersonalAccountBillingPageData(user.id);
  
  return (
    <>
      <HomeLayoutPageHeader
        title={<Trans i18nKey={'billing:upgradeTab'} />}
        description={<AppBreadcrumbs />}
      />

      <PageBody>
        <div className={'flex flex-col space-y-4'}>
          <PersonalAccountCheckoutForm 
            key={customerId} 
            customerId={customerId} 
            subscription={data as SubscriptionWithLineItems}
          />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(UpgradePersonalAccountBillingPage);
