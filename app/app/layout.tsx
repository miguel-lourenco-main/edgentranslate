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
import { personalAccountNavigationConfig } from '~/lib/config/personal-account-navigation.config';
import { withI18n } from '~/lib/i18n/with-i18n';

// App shell layout: sidebar or header nav depending on env config.
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

        <HomeMobileNavigation/>
      </PageMobileNavigation>

      <PageBody>{children}</PageBody>
    </Page>
  );
}

export default withI18n(UserHomeLayout);

async function getLayoutStyle() {
  return personalAccountNavigationConfig.style as PageLayoutStyle;
}
