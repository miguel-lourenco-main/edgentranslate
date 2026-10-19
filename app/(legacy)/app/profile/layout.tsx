import { Trans } from '~/components/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

// local imports
import { HomeLayoutPageHeader } from '../_components/home-page-header';

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <>
      <HomeLayoutPageHeader
        title={'Profile'}
        description={'Your Profile Page'}
      />

      {props.children}
    </>
  );
}

export default withI18n(UserSettingsLayout);
