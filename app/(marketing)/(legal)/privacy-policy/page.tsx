import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

const isStaticExport =
  process.env.GITLAB_PAGES === 'true' || process.env.GITLAB_PAGES === '1';

export async function generateMetadata() {
  return {
    title: isStaticExport
      ? 'Privacy Policy'
      : (await createI18nServerInstance()).t('marketing:privacyPolicy'),
  };
}

async function PrivacyPolicyPage() {
  const t = isStaticExport ? null : (await createI18nServerInstance()).t;

  return (
    <div>
      <SitePageHeader
        title={t ? t('marketing:privacyPolicy') : 'Privacy Policy'}
        subtitle={
          t
            ? t('marketing:privacyPolicyDescription')
            : 'How we handle your data.'
        }
      />

      <div className={'container mx-auto py-8'}>
        <div>Your terms of service content here</div>
      </div>
    </div>
  );
}

export default withI18n(PrivacyPolicyPage);
