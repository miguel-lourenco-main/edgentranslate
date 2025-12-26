import {
  Pill,
  SecondaryHero,
} from '@kit/ui/marketing';

import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { PolydocPricingTable } from '@kit/billing-gateway/components';
import PolydocHero from './_components/polydoc-hero';
import { Heading } from '@kit/ui/heading';
import { AnimatedBeamTranslatedFiles } from '@kit/ui/animated-translated-files';
import { LANGUAGES_BY_REGION } from '@kit/shared/constants';
import { FILE_FORMAT_GROUPS } from '~/lib/constants';
import { getFileIcon } from '@kit/ui/lib';
import { FormatLanguageGrid } from './_components/format-language-grid';

function Home() {

  // This is to clear all subscriptions from Stripe, so we can run the tests
  // clearAllSubscriptionsFromStripe()
  
  const formatGroups = FILE_FORMAT_GROUPS.map(group => ({
    name: group.name,
    items: group.formats.map(format => ({ value: format }))
  }));

  const languageGroups = Object.entries(LANGUAGES_BY_REGION).map(([region, languages]) => ({
    name: region,
    items: languages
  }));

  return (
    <div 
      data-test-page='marketing'
      className={'mt-4 flex flex-col h-full space-y-24 py-14'}
    >
      <PolydocHero />

      <div
        className={'flex flex-col items-center bg-foreground/10 w-full pt-24 pb-32 px-16 xl:px-24 2xl:px-36 text-foreground'}
      >
        <Heading className='text-foreground' level={1}>Supported Formats and Languages</Heading>
        <div className={'flex w-fit items-center flex-col lg:px-8 lg:flex-row lg:gap-24 xl:gap-36 2xl:gap-72'}>
          <AnimatedBeamTranslatedFiles />
          <div className={'flex flex-col w-full items-center py-12 lg:py-24 space-y-8 max-w-2xl'}>
            <Heading level={2} className='text-center lg:text-end'>Our application supports most formats and languages</Heading>
            <div className={'flex flex-col items-center space-y-4 w-full'}>
              <span className={'text-xl'}>
                <strong>- From PDFs to PowerPoints, Word to Txt files</strong> - seamlessly translate your content while preserving the original formatting
              </span>
              <span className={'text-xl'}>
                <strong>- Break language barriers without breaking document layouts</strong>  - native-quality translations in over 100 languages
              </span>
              <span className={'text-xl'}>
                <strong>- Upload any file, get back a perfect translation</strong> - maintaining structure, style, and meaning across formats
              </span>
            </div>
          </div>
        </div>

        <div id='supported-formats' className='my-16'></div>

        <div className={'flex flex-col w-full items-center space-y-16'}>
          <Heading level={2}>Currently Supported Formats</Heading>
          <FormatLanguageGrid 
            groups={formatGroups}
            renderItem={(item) => (
              <div 
                key={item.value}
                className={`
                  flex items-center
                  px-3 lg:px-4 py-2
                  dark:bg-light-background bg-dark-background rounded-lg
                  min-w-[7rem] lg:min-w-[8rem] max-w-[10rem]
                  transition-colors
                `}
              >
                <div className='py-1 px-0.5 rounded-md bg-background'>
                  {getFileIcon(item.value, 'size-8')}
                </div>
                <span className={'ml-3 text-md truncate'}>
                  {item.value}
                </span>
              </div>
            )}
          />
        </div>

        <div id='supported-languages' className='my-16'></div>

        <div className={'flex flex-col items-center w-full space-y-16'}>
          <Heading level={2} >Currently Supported Languages</Heading>
          <FormatLanguageGrid 
            groups={languageGroups}
            renderItem={(item) => {
              const flag = item.label!.split(' ')[0];
              const name = item.label!.split(' ').slice(1).join(' ');
              
              return (
                <div 
                  key={item.value}
                  className={`
                    flex items-center
                    px-4 py-2
                    dark:bg-light-background bg-dark-background rounded-lg
                    min-w-[8rem] max-w-[10rem]
                    transition-colors
                  `}
                >
                  <span className="text-xl">{flag}</span>
                  <span className={'ml-3 text-md truncate'}>
                    {name}
                  </span>
                </div>
              );
            }}
          />
        </div>

      </div>

      <div className={'container mx-auto'}>
        <div
          className={
            'flex flex-col items-center justify-center space-y-16 py-16'
          }
        >
          <SecondaryHero
            pill={<Pill>Get started for free. No credit card required.</Pill>}
            heading="Fair pricing for all types of businesses"
            subheading="Get started on our free plan and upgrade when you are ready."
          />

          <div className={'w-full'}>
            <PolydocPricingTable
              config={billingConfig}
              paths={{
                signUp: pathsConfig.auth.signUp,
                return: pathsConfig.app.app,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);