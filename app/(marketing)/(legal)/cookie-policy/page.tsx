import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  return {
    title: 'Cookie Policy',
  };
}

async function CookiePolicyPage() {
  return (
    <div>
      <SitePageHeader
        title={'Cookie Policy'}
        subtitle={'How we use cookies.'}
      />

      <div className={'container mx-auto py-8'}>
        <div>Your terms of service content here</div>
      </div>
    </div>
  );
}

export default withI18n(CookiePolicyPage);
