'use client';

import { Button } from '~/components/shadcn/button';
import { Trans } from '~/components/trans';
import { ALTERNATE_UI_URL, UI_VARIANT } from '~/lib/config/ui-variant.config';

/**
 * Header link between the current UI and the legacy UI. A plain <a> on purpose: the
 * target is another static build outside this build's basePath, so next/link would
 * prefix it and route it client-side.
 */
export function UiVariantLink() {
  if (!ALTERNATE_UI_URL) return null;

  return (
    <Button asChild variant="ghost" data-testid="ui-variant-link">
      <a href={ALTERNATE_UI_URL}>
        <Trans i18nKey={UI_VARIANT === 'legacy' ? 'marketing:tryNewUi' : 'marketing:legacyUi'} />
      </a>
    </Button>
  );
}
