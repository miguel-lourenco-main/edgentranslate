import { withI18n } from '~/lib/i18n/with-i18n';
import RunsPage from './_components/custom/runs-page';

export const generateMetadata = async () => {
  return {
    title: 'Home',
  };
};

async function Page() {

  return (
    <RunsPage/>
  );
}

export default withI18n(Page);
