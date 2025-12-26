import { If } from '@kit/ui/if';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
  SidebarProvider,
} from '@kit/ui/shadcn-sidebar';
import { cn } from '@kit/ui/lib';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import featuresFlagConfig from '~/config/feature-flags.config';
import { personalAccountNavigationConfig } from '~/config/personal-account-navigation.config';
import { UserNotifications } from '~/app/(user)/_components/user-notifications';

// home imports
import type { UserWorkspace } from '../_lib/server/load-user-workspace';
import { HomeAccountSelector } from './home-account-selector';
import SidebarTokensLeft from './custom/sidebar-tokens-left';

interface HomeSidebarProps {
  workspace: UserWorkspace;
}

const minimized = personalAccountNavigationConfig.sidebarCollapsed;

export function HomeSidebar(props: HomeSidebarProps) {
  const { workspace, user, accounts } = props.workspace;

  return (
    <SidebarProvider minimized={minimized}>
      <Sidebar>
        <SidebarHeader className={'h-16 justify-center'}>
          <div className={'flex items-center justify-between space-x-2'}>
            <If
              condition={featuresFlagConfig.enableTeamAccounts}
              fallback={
                <AppLogo
                  className={cn({
                    'max-w-full': minimized,
                    'py-2': !minimized,
                  })}
                />
              }
            >
              <HomeAccountSelector userId={user.id} accounts={accounts} />
            </If>

            <div className={'group-data-[minimized=true]:hidden'}>
              <UserNotifications userId={user.id} />
            </div>
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
            <ProfileAccountDropdownContainer user={user} account={workspace} />
          </SidebarFooter>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}
