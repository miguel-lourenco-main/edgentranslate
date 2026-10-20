import { Header } from '~/components/header';

import { AppLogo } from '~/components/app-logo';
import { TryV2Link } from '~/(legacy)/_components/try-v2-link';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';

export function SiteHeader(props: { account: { id: string; name: string; picture_url: string; email: string } }) {
  return (
    <Header
      logo={<AppLogo />}
      navigation={<SiteNavigation />}
      actions={
        <>
          <TryV2Link />
          <SiteHeaderAccountSection account={props.account} />
        </>
      }
    />
  );
}
