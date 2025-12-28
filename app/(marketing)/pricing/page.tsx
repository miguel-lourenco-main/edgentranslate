import { PolydocPricingTable } from '~/components/billing/polydoc/polydoc-pricing-table';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import billingConfig from '~/lib/config/billing.config';
import pathsConfig from '~/lib/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:pricing'),
  };
};

const paths = {
  signUp: pathsConfig.app.home,
  return: pathsConfig.app.app,
};

async function PricingPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div className={'flex flex-col space-y-12 mt-12'}>
      <SitePageHeader
        title={t('marketing:pricing')}
        subtitle={t('marketing:pricingSubtitle')}
      />

      <div className={'container mx-auto pb-8 xl:pb-16'}>
        <PolydocPricingTable paths={paths} config={billingConfig} />
      </div>
    </div>
  );
}

export default withI18n(PricingPage);
