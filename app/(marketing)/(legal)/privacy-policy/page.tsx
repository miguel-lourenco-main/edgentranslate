import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  return {
    title: 'Privacy Policy',
  };
}

async function PrivacyPolicyPage() {
  return (
    <div>
      <SitePageHeader
        title={'Privacy Policy'}
        subtitle={'How we handle your data.'}
      />

      <div className={'container mx-auto py-8'}>
        <div>Your terms of service content here</div>
      </div>
    </div>
  );
}

export default withI18n(PrivacyPolicyPage);
