import { CreditCard, Languages, User } from 'lucide-react';
import { z } from 'zod';
import { NavigationConfigSchema } from '~/lib/schemas/navigation-config.schema';

import pathsConfig from '~/lib/config/paths.config';

// Icon size shared across personal-account sidebar/header nav items.
const iconClasses = 'w-4';

const routes = [
  {
    label: 'custom:fileTranslationsTitle',
    children: [{
      label: 'custom:fileTranslationsTitle',
      path: pathsConfig.app.app,
      Icon: <Languages className={iconClasses} />,
        end: true,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.profile,
        Icon: <User className={iconClasses} />,
      },
    ].filter((route) => !!route),
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const personalAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
