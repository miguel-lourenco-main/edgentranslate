import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  return {
    title: 'Terms of Service',
  };
}

async function TermsOfServicePage() {
  return (
    <div>
      <SitePageHeader
        title={'Terms of Service'}
        subtitle={'The rules for using the service.'}
      />

      <div className={'container mx-auto py-8'}>
        <div>Your terms of service content here</div>
      </div>
    </div>
  );
}

export default withI18n(TermsOfServicePage);
