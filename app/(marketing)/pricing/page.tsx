import { PolydocPricingTable } from '~/components/billing/polydoc/polydoc-pricing-table';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import billingConfig from '~/lib/config/billing.config';
import pathsConfig from '~/lib/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

const isStaticExport =
  process.env.GITLAB_PAGES === 'true' || process.env.GITLAB_PAGES === '1';

export const generateMetadata = async () => {
  return {
    title: isStaticExport
      ? 'Pricing'
      : (await createI18nServerInstance()).t('marketing:pricing'),
  };
};

const paths = {
  signUp: pathsConfig.app.home,
  return: pathsConfig.app.app,
};

async function PricingPage() {
  const t = isStaticExport ? null : (await createI18nServerInstance()).t;

  return (
    <div className={'flex flex-col space-y-12 mt-12'}>
      <SitePageHeader
        title={t ? t('marketing:pricing') : 'Pricing'}
        subtitle={t ? t('marketing:pricingSubtitle') : 'Choose a plan.'}
      />

      <div className={'container mx-auto pb-8 xl:pb-16'}>
        <PolydocPricingTable paths={paths} config={billingConfig} />
      </div>
    </div>
  );
}

export default withI18n(PricingPage);
