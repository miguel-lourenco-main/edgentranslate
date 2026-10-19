import Link from 'next/link';

import { UiVariantLink } from '~/components/ui-variant-link';
import { UI_VARIANT_PATHS } from '~/lib/config/ui-variant.config';

// v2 has no i18n provider yet (undecided, #3); read the shared key straight from the
// bundled English strings, as lib/i18n/resources.ts does.
import marketing from '../../../public/locales/en/marketing.json';

export function V2Header() {
  return (
    <header className="v2-header">
      <Link href={UI_VARIANT_PATHS.v2} className="v2-brand">
        PolyDoc <span className="v2-badge">v2</span>
      </Link>
      <UiVariantLink to="legacy" className="v2-switch">
        {marketing.legacyUi}
      </UiVariantLink>
    </header>
  );
}
