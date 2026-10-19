import {
  BorderedNavigationMenu,
  BorderedNavigationMenuItem,
} from '~/components/bordered-navigation-menu';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { personalAccountNavigationConfig } from '~/lib/config/personal-account-navigation.config';
import { DUMMY_ACCOUNT } from '~/lib/constants';

export function HomeMenuNavigation() {
  const routes = personalAccountNavigationConfig.routes.reduce<
    Array<{
      path: string;
      label: string;
      Icon?: React.ReactNode;
      end?: boolean | ((path: string) => boolean);
    }>
  >((acc, item) => {
    if ('children' in item) {
      return [...acc, ...item.children];
    }

    if ('divider' in item) {
      return acc;
    }

    return [...acc, item];
  }, []);

  return (
    <div className={'flex w-full flex-1 justify-between'}>
      <div className={'flex items-center space-x-8'}>
        <AppLogo />

        <BorderedNavigationMenu>
          {routes.map((route) => (
            <BorderedNavigationMenuItem {...route} key={route.path} />
          ))}
        </BorderedNavigationMenu>
      </div>

      <div className={'flex justify-end space-x-2.5'}>
        <ProfileAccountDropdownContainer account={DUMMY_ACCOUNT} />
      </div>
    </div>
  );
}
