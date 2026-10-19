'use client';

import Link from 'next/link';

import { LogOut, Menu } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/shadcn/dropdown-menu';
import { If } from '~/components/if';
import { Trans } from '~/components/trans';

import { personalAccountNavigationConfig } from '~/lib/config/personal-account-navigation.config';

export function HomeMobileNavigation() {
  const Links = personalAccountNavigationConfig.routes.map((item, index) => {
    if ('children' in item) {
      return item.children.map((child) => {
        return (
          <DropdownLink
            key={child.path}
            Icon={child.Icon}
            path={child.path}
            label={child.label}
          />
        );
      });
    }

    if ('divider' in item) {
      return <DropdownMenuSeparator key={index} />;
    }
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className={'h-9'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={10} className={'w-screen rounded-none'}>
        <If condition={true}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <Trans i18nKey={'common:yourAccounts'} />
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
        </If>

        <DropdownMenuGroup>{Links}</DropdownMenuGroup>

        <DropdownMenuSeparator />

        <SignOutDropdownItem onSignOut={() => {}} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>,
) {
  return (
    <DropdownMenuItem asChild key={props.path}>
      <Link
        href={props.path}
        className={'flex h-12 w-full items-center space-x-4'}
      >
        {props.Icon}

        <span>
          <Trans i18nKey={props.label} defaults={props.label} />
        </span>
      </Link>
    </DropdownMenuItem>
  );
}

function SignOutDropdownItem(
  props: React.PropsWithChildren<{
    onSignOut: () => unknown;
  }>,
) {
  return (
    <DropdownMenuItem
      className={'flex h-12 w-full items-center space-x-4'}
      onClick={props.onSignOut}
    >
      <LogOut className={'h-6'} />

      <span>
        <Trans i18nKey={'common:signOut'} defaults={'Sign out'} />
      </span>
    </DropdownMenuItem>
  );
}
