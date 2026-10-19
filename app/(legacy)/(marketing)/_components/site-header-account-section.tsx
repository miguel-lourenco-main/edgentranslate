'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

import { ArrowRightIcon } from 'lucide-react';

import { PersonalAccountDropdown } from '~/components/personal-account-dropdown';
import { Button } from '~/components/shadcn/button';
import { If } from '~/components/if';
import { Trans } from '~/components/trans';

import pathsConfig from '~/lib/config/paths.config';

const ModeToggle = dynamic(() =>
  import('~/components/mode-toggle').then((mod) => ({
    default: mod.ModeToggle,
  })),
);

const paths = {
  app: pathsConfig.app.app,
};

const features = {
  enableThemeToggle: true,
};

export function SiteHeaderAccountSection({
  account,
}: React.PropsWithChildren<{
  account: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
    email: string | null;
  };
}>) {
  if (!account) {
    return <AuthButtons />;
  }

  return <SuspendedPersonalAccountDropdown account={account} />;
}

function SuspendedPersonalAccountDropdown(props: { account: { id: string | null; name: string | null; picture_url: string | null; email: string | null; } }) {
  if (props.account) {
    return (
      <PersonalAccountDropdown
        showProfileName={false}
        paths={paths}
        features={features}
        account={props.account}
      />
    );
  }

  return <AuthButtons />;
}

function AuthButtons() {
  return (
    <div className={'flex space-x-2'}>
      <div className={'hidden space-x-0.5 md:flex'}>
        <If condition={features.enableThemeToggle}>
          <ModeToggle />
        </If>

        <Button asChild variant={'ghost'}>
          <Link href={pathsConfig.app.home}>
            <Trans i18nKey={'auth:signIn'} />
          </Link>
        </Button>
      </div>

      <Button asChild className="group" variant={'default'} data-test="sign-up">
        <Link href={pathsConfig.app.home}>
          <Trans i18nKey={'auth:signUp'} />

          <ArrowRightIcon
            className={
              'ml-1 hidden h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 lg:block'
            }
          />
        </Link>
      </Button>
    </div>
  );
}
