import Link from 'next/link';

import { PolydocIcon } from '~/lib/icons';


export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string;
  className?: string;
  label?: string;
}) {
  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <PolydocIcon className={className} />
    </Link>
  );
}
