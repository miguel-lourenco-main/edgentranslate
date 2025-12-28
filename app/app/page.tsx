import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import RunsPage from './_components/custom/runs-page';

const isStaticExport =
  process.env.GITLAB_PAGES === 'true' || process.env.GITLAB_PAGES === '1';

export const generateMetadata = async () => {
  const title = isStaticExport
    ? 'Home'
    : (await createI18nServerInstance()).t('account:homePage');

  return {
    title,
  };
};

async function Page() {

  return (
    <RunsPage/>
  );
}

export default withI18n(Page);
