import { Header } from '~/components/header';

import { AppLogo } from '~/components/app-logo';
import { Button } from '~/components/shadcn/button';
import { Trans } from '~/components/trans';
import { UiVariantLink } from '~/components/ui-variant-link';
import { SHOW_V2_LINK } from '~/lib/config/ui-variant.config';

import { SiteHeaderAccountSection } from './site-header-account-section';
import { SiteNavigation } from './site-navigation';

export function SiteHeader(props: { account: { id: string; name: string; picture_url: string; email: string } }) {
  return (
    <Header
      logo={<AppLogo />}
      navigation={<SiteNavigation />}
      actions={
        <>
          {SHOW_V2_LINK ? (
            <Button asChild variant="ghost">
              <UiVariantLink to="v2">
                <Trans i18nKey="marketing:tryNewUi" />
              </UiVariantLink>
            </Button>
          ) : null}
          <SiteHeaderAccountSection account={props.account} />
        </>
      }
    />
  );
}
