import { use } from 'react';

import { PageBody } from '~/components/page';

import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { PersonalAccountSettingsContainer } from './_components/personal-account-settings'

const isStaticExport =
  process.env.GITLAB_PAGES === 'true' || process.env.GITLAB_PAGES === '1';

const features = {
  enableAccountDeletion: true,
  enablePasswordUpdate: true,
};

const callbackPath = pathsConfig.app.profile;
const accountHomePath = pathsConfig.app.profile;

const paths = {
  callback: callbackPath + `?next=${accountHomePath}`,
};

export const generateMetadata = async () => {
  const title = isStaticExport
    ? 'Settings'
    : (await createI18nServerInstance()).t('account:settingsTab');

  return {
    title,
  };
};

function PersonalAccountSettingsPage() {

  return (
    <PageBody>
      <div className={'flex w-full flex-1 flex-col lg:max-w-2xl'}>
        <PersonalAccountSettingsContainer
          account={{
            id: "1",
            name: "John Doe",
            picture_url: "/avatar.jpeg",
            email: "johndoe@gmail.com"
          }}
          features={features}
          paths={paths}
        />
      </div>
    </PageBody>
  );
}

export default withI18n(PersonalAccountSettingsPage);
