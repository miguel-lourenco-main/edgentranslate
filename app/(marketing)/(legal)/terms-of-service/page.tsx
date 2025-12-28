import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

const isStaticExport =
  process.env.GITLAB_PAGES === 'true' || process.env.GITLAB_PAGES === '1';

export async function generateMetadata() {
  return {
    title: isStaticExport
      ? 'Terms of Service'
      : (await createI18nServerInstance()).t('marketing:termsOfService'),
  };
}

async function TermsOfServicePage() {
  const t = isStaticExport ? null : (await createI18nServerInstance()).t;

  return (
    <div>
      <SitePageHeader
        title={t ? t(`marketing:termsOfService`) : 'Terms of Service'}
        subtitle={
          t
            ? t(`marketing:termsOfServiceDescription`)
            : 'The rules for using the service.'
        }
      />

      <div className={'container mx-auto py-8'}>
        <div>Your terms of service content here</div>
      </div>
    </div>
  );
}

export default withI18n(TermsOfServicePage);
