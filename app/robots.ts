import { MetadataRoute } from 'next';

import appConfig from '~/lib/config/app.config';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${appConfig.url}/server-sitemap.xml`,
  };
}
