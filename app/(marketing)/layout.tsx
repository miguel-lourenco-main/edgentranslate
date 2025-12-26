import { Database } from '~/lib/database.types';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';
import { withI18n } from '~/lib/i18n/with-i18n';

async function SiteLayout(props: React.PropsWithChildren) {
  const client = getSupabaseServerClient<Database>();

  const {
    data: { user },
  } = await client.auth.getUser();

  return (
    <div className={'flex min-h-screen flex-col'}>
      <SiteHeader user={user} />
      <div className="mt-[4.5rem]"> {/* Add padding to account for fixed header */}
        {props.children}
      </div>
      <SiteFooter />
    </div>
  );
}

export default withI18n(SiteLayout);
