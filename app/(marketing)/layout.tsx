import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';
import { withI18n } from '~/lib/i18n/with-i18n';
import { DUMMY_ACCOUNT } from '~/lib/constants';

async function SiteLayout(props: React.PropsWithChildren) {
  return (
    <div className={'flex min-h-screen flex-col'}>
      <SiteHeader account={DUMMY_ACCOUNT}/>
      <div className="mt-18"> {/* Add padding to account for fixed header */}
        {props.children}
      </div>
      <SiteFooter />
    </div>
  );
}

export default withI18n(SiteLayout);
