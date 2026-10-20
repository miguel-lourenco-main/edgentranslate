import { use } from 'react';

import { If } from '~/components/if';
import {
  Page,
  PageLayoutStyle,
  PageBody,
  PageMobileNavigation,
  PageNavigation,
} from '~/components/page';

import { AppLogo } from '~/components/app-logo';
import { TryV2Link } from '~/(legacy)/_components/try-v2-link';
import { personalAccountNavigationConfig } from '~/lib/config/personal-account-navigation.config';
import { withI18n } from '~/lib/i18n/with-i18n';

// home imports
import { HomeMenuNavigation } from './_components/home-menu-navigation';
import { HomeMobileNavigation } from './_components/home-mobile-navigation';
import { HomeSidebar } from './_components/home-sidebar';

function UserHomeLayout({ children }: React.PropsWithChildren) {
  const style = use(getLayoutStyle());

  return (
    <Page style={style}>
      <PageNavigation>
        <If condition={style === 'header'}>
          <HomeMenuNavigation/>
        </If>

        <If condition={style === 'sidebar'}>
          <HomeSidebar/>
        </If>
      </PageNavigation>

      <PageMobileNavigation className={'flex items-center justify-between'}>
        <AppLogo />

        <div className={'flex items-center gap-x-1'}>
          <TryV2Link />
          <HomeMobileNavigation/>
        </div>
      </PageMobileNavigation>

      <PageBody>{children}</PageBody>
    </Page>
  );
}

export default withI18n(UserHomeLayout);

async function getLayoutStyle() {
  return personalAccountNavigationConfig.style as PageLayoutStyle;
}
