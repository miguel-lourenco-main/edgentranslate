import { Header } from '~/components/header';

import { AppLogo } from '~/components/app-logo';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';
import { UiVariantLink } from '~/components/ui-variant-link';

export function SiteHeader(props: { account: { id: string; name: string; picture_url: string; email: string } }) {
  return (
    <Header
      logo={<AppLogo />}
      navigation={<SiteNavigation />}
      actions={
        <>
          <UiVariantLink />
          <SiteHeaderAccountSection account={props.account} />
        </>
      }
    />
  );
}
