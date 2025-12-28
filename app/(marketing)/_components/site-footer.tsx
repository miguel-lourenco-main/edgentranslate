import { Footer } from '~/components/footer';
import { Trans } from '~/components/trans';

import { AppLogo } from '~/components/app-logo';
import appConfig from '~/lib/config/app.config';

export function SiteFooter() {
  return (
    <Footer
      logo={<AppLogo />}
      description={<Trans i18nKey="marketing:footerDescription" />}
      copyright={
        <Trans
          i18nKey="marketing:copyright"
          values={{
            product: appConfig.name,
            year: new Date().getFullYear(),
          }}
        />
      }
      sections={[
        {
          heading: <Trans i18nKey="marketing:about" />,
          links: [
            { href: '/blog', label: <Trans i18nKey="marketing:blog" /> },
            { href: '/contact', label: <Trans i18nKey="marketing:contact" /> },
          ],
        },
        {
          heading: <Trans i18nKey="marketing:legal" />,
          links: [
            {
              href: '/terms-of-service',
              label: <Trans i18nKey="marketing:termsOfService" />,
            },
            {
              href: '/privacy-policy',
              label: <Trans i18nKey="marketing:privacyPolicy" />,
            },
            {
              href: '/cookie-policy',
              label: <Trans i18nKey="marketing:cookiePolicy" />,
            },
          ],
        },
      ]}
    />
  );
}
