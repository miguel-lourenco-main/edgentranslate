'use client';

import Link from 'next/link';

import {
  ChevronsUpDown,
  Globe,
  Home,
  LogOut,
  MessageCircleQuestion,
  Shield,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './shadcn/dropdown-menu';
import { If } from './if';
import { SubMenuModeToggle } from './mode-toggle';
import { ProfileAvatar } from './profile-avatar';
import { Trans } from './trans';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
/**
 * Improve this component so that it can be used in both the web and polydoc apps, with different paths/routes.
 */

export function PersonalAccountDropdown({
  className,
  showProfileName = true,
  paths,
  features,
  account,
}: {
  account: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    email: string | null;
  };

  paths: {
    app: string;
  };

  features: {
    enableThemeToggle: boolean;
  };

  showProfileName?: boolean;

  className?: string;
}) {

  const displayName = account?.name ?? account?.email ?? '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open your profile menu"
        data-test={'account-dropdown-trigger'}
        className={cn(
          'animate-in fade-in focus:outline-primary flex cursor-pointer items-center duration-500 group-data-[minimized=true]:px-0',
          className ?? '',
          {
            ['active:bg-secondary/50 items-center space-x-4 rounded-md' +
            ' hover:bg-secondary p-2 transition-colors']: showProfileName,
          },
        )}
      >
        <ProfileAvatar
          className={'rounded-md'}
          fallbackClassName={'rounded-md border'}
          displayName={displayName ?? account?.email ?? ''}
          pictureUrl={account?.picture_url}
        />

        <If condition={showProfileName}>
          <div
            className={
              'fade-in animate-in flex w-full flex-col truncate text-left group-data-[minimized=true]:hidden'
            }
          >
            <span
              data-test={'account-dropdown-display-name'}
              className={'truncate text-sm'}
            >
              {displayName}
            </span>

            <span
              data-test={'account-dropdown-email'}
              className={'text-muted-foreground truncate text-xs'}
            >
              {account?.email}
            </span>
          </div>

          <ChevronsUpDown
            className={
              'text-muted-foreground mr-1 h-8 group-data-[minimized=true]:hidden'
            }
          />
        </If>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={'xl:min-w-60!'}>
        <DropdownMenuItem className={'h-10! rounded-none'}>
          <div
            className={'flex flex-col justify-start truncate text-left text-xs'}
          >
            <div className={'text-muted-foreground'}>
              <Trans i18nKey={'common:signedInAs'} />
            </div>

            <div>
              <span className={'block truncate'}>{account?.email}</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={'s-full flex items-center space-x-2'}
            href={"/"}
          >
            <Globe className={'h-5'} />

            <span>
              <Trans i18nKey={'common:landingPage'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={'s-full flex items-center space-x-2'}
            href={paths.app}
          >
            <Home className={'h-5'} />

            <span>
              <Trans i18nKey={'common:routes.app'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <If condition={features.enableThemeToggle}>
          <SubMenuModeToggle />
        </If>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          data-test={'account-dropdown-sign-out'}
          role={'button'}
          className={'cursor-pointer'}
          onClick={() => { toast.success('This feature is not available in this version') }}
        >
          <span className={'flex w-full items-center space-x-2'}>
            <LogOut className={'h-5'} />

            <span>
              <Trans i18nKey={'auth:signOut'} />
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
