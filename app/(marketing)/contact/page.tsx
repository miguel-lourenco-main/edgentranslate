import { Heading } from '~/components/shadcn/heading';
import { Trans } from '~/components/trans';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { ContactForm } from '~/(marketing)/contact/_components/contact-form';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  return {
    title: 'Contact',
  };
}

async function ContactPage() {
  return (
    <div className='mt-12'>
      <SitePageHeader
        title={'Contact'}
        subtitle={'Get in touch.'}
      />

      <div className={'container mx-auto'}>
        <div
          className={'flex flex-1 flex-col items-center justify-center py-12'}
        >
          <div
            className={
              'flex w-full max-w-lg flex-col space-y-4 rounded-lg border p-8'
            }
          >
            <div>
              <Heading level={3}>
                <Trans i18nKey={'marketing:contactHeading'} />
              </Heading>

              <p className={'text-muted-foreground'}>
                <Trans i18nKey={'marketing:contactSubheading'} />
              </p>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(ContactPage);
