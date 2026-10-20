import Link from 'next/link';

import { UI_VARIANT_PATHS, type UiVariant } from '~/lib/config/ui-variant.config';

/**
 * Header link to the other UI variant (#3). Both variants are in this build, so this is
 * a next/link; they have separate root layouts, so following it is a full page load and
 * neither variant's CSS or providers carry over. Styling and the label come from the
 * caller, because the two variants do not share a design system.
 */
export function UiVariantLink({
  to,
  className,
  children,
}: React.PropsWithChildren<{ to: UiVariant; className?: string }>) {
  return (
    <Link href={UI_VARIANT_PATHS[to]} className={className} data-testid="ui-variant-link" data-ui-variant={to}>
      {children}
    </Link>
  );
}
