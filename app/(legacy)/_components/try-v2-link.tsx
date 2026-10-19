import { Sparkles } from 'lucide-react';

import { Button } from '~/components/shadcn/button';
import { Trans } from '~/components/trans';
import { UiVariantLink } from '~/components/ui-variant-link';
import { SHOW_V2_LINK } from '~/lib/config/ui-variant.config';
import { cn } from '~/lib/utils';

/**
 * "Try the new UI" for the legacy headers (#3): the marketing header and the /app
 * navigation (sidebar, header menu, mobile menu). Renders nothing unless the build sets
 * NEXT_PUBLIC_SHOW_V2_LINK=1.
 */
export function TryV2Link({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  if (!SHOW_V2_LINK) return null;

  return (
    <Button asChild variant="ghost" className={cn(iconOnly ? 'px-2' : null, className)}>
      <UiVariantLink to="v2">
        {iconOnly ? (
          <>
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="sr-only">
              <Trans i18nKey="marketing:tryNewUi" />
            </span>
          </>
        ) : (
          <Trans i18nKey="marketing:tryNewUi" />
        )}
      </UiVariantLink>
    </Button>
  );
}
