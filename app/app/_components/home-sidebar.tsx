import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
  SidebarProvider,
} from '~/components/shadcn/sidebar';
import { cn } from '~/lib/utils';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { personalAccountNavigationConfig } from '~/lib/config/personal-account-navigation.config';

// Sidebar layout for /app; tokens widget and profile dropdown pinned to footer.
import SidebarTokensLeft from './custom/sidebar-tokens-left';
import { DUMMY_ACCOUNT } from '~/lib/constants';

const minimized = personalAccountNavigationConfig.sidebarCollapsed;

export function HomeSidebar() {

  return (
    <SidebarProvider minimized={minimized}>
      <Sidebar>
        <SidebarHeader className={'h-16 justify-center'}>
          <div className={'flex items-center justify-start'}>
            <AppLogo
              className={cn({
                'max-w-full': minimized,
                'py-2': !minimized,
              })}
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarNavigation config={personalAccountNavigationConfig} />
        </SidebarContent>

        <div className={'absolute bottom-4 left-0 w-full flex flex-col gap-y-4'}>
          <SidebarContent className={`my-5 mx-2`}>
            <SidebarTokensLeft />
          </SidebarContent>

          <SidebarFooter>
            <ProfileAccountDropdownContainer account={
              DUMMY_ACCOUNT
            } />
          </SidebarFooter>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}
