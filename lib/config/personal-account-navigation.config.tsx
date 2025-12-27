import { CreditCard, Languages, User } from 'lucide-react';
import { z } from 'zod';
import { NavigationConfigSchema } from '~/lib/schemas/navigation-config.schema';

import pathsConfig from '~/lib/config/paths.config';

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
        path: pathsConfig.app.home,
        Icon: <User className={iconClasses} />,
      },
      {
        label: 'common:routes.billing',
        path: pathsConfig.app.home,
        Icon: <CreditCard className={iconClasses} />,
      }
    ].filter((route) => !!route),
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const personalAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
