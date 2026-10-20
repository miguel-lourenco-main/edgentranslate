import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { Button } from '~/components/shadcn/button';
import { Heading } from '~/components/shadcn/heading';
import { Trans } from '~/components/trans';

import { LegacyRoot } from '~/(legacy)/_components/legacy-root';
import { SiteHeader } from '~/(legacy)/(marketing)/_components/site-header';
import { withI18n } from '~/lib/i18n/with-i18n';
import { DUMMY_ACCOUNT } from '~/lib/constants';
import { generateRootMetadata } from '~/lib/root-metdata';

/*
 * The site-wide 404 (exported as 404.html). With two root layouts, `(legacy)` and
 * `(v2)`, a plain app/not-found.tsx has no root layout to render in, so this is a
 * global-not-found (experimental.globalNotFound) that brings its own shell: the legacy
 * one, since legacy is the default UI (#3).
 */
export const generateMetadata = async () => {
  return {
    ...(await generateRootMetadata()),
    title: 'Not found',
  };
};

const NotFoundPage = async () => {

  return (
    <LegacyRoot>
      <div className={'flex h-screen flex-1 flex-col'}>
        <SiteHeader account={DUMMY_ACCOUNT}/>

        <div
          className={
            'container m-auto flex w-full flex-1 flex-col items-center justify-center'
          }
        >
          <div className={'flex flex-col items-center space-y-12'}>
            <div>
              <h1 className={'font-heading text-8xl font-extrabold xl:text-9xl'}>
                <Trans i18nKey={'common:pageNotFoundHeading'} />
              </h1>
            </div>

            <div className={'flex flex-col items-center space-y-8'}>
              <div className={'flex flex-col items-center space-y-2.5'}>
                <div>
                  <Heading level={1}>
                    <Trans i18nKey={'common:pageNotFound'} />
                  </Heading>
                </div>

                <p className={'text-muted-foreground'}>
                  <Trans i18nKey={'common:pageNotFoundSubHeading'} />
                </p>
              </div>

              <Button asChild variant={'outline'}>
                <Link href={'/'}>
                  <ArrowLeft className={'mr-2 h-4'} />

                  <Trans i18nKey={'common:backToHomePage'} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LegacyRoot>
  );
};

export default withI18n(NotFoundPage);
