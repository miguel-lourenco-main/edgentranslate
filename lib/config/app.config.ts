import { z } from 'zod';

const production = process.env.NODE_ENV === 'production';

function isTruthyEnv(value: string | undefined) {
  return value === '1' || value === 'true' || value === 'yes';
}

const AppConfigSchema = z
  .object({
    name: z
      .string()
      .describe(`This is the name of your SaaS. Ex. "Makerkit"`)
      .min(1, { message: `Please provide the variable NEXT_PUBLIC_PRODUCT_NAME` }),
    title: z
      .string()
      .describe(`This is the default title tag of your SaaS.`)
      .min(1, { message: `Please provide the variable NEXT_PUBLIC_SITE_TITLE` }),
    description: z
      .string()
      .describe(`This is the default description of your SaaS.`)
      .min(1, { message: `Please provide the variable NEXT_PUBLIC_SITE_DESCRIPTION` }),
    url: z
      .string()
      .min(1, { message: `Please provide the variable NEXT_PUBLIC_SITE_URL` })
      .url({
        message: `Please provide a valid URL for NEXT_PUBLIC_SITE_URL, such as: 'https://example.com'`,
      }),
    locale: z
      .string()
      .describe(`This is the default locale of your SaaS.`)
      .min(1, { message: `Please provide the variable NEXT_PUBLIC_DEFAULT_LOCALE` })
      .default('en'),
    theme: z.enum(['light', 'dark', 'system']),
    production: z.boolean(),
    themeColor: z.string(),
    themeColorDark: z.string(),
  })
  .refine(
    (schema) => {
      const isCI =
        isTruthyEnv(process.env.NEXT_PUBLIC_CI) ||
        isTruthyEnv(process.env.CI) ||
        isTruthyEnv(process.env.GITLAB_CI);

      if (isCI || !schema.production) {
        return true;
      }

      // Allow local production builds (e.g. testing `next build` locally) using http://localhost.
      // For real production deployments we enforce HTTPS to avoid shipping a broken sitemap/robots config.
      try {
        const parsed = new URL(schema.url);

        if (parsed.protocol === 'https:') {
          return true;
        }

        if (
          parsed.protocol === 'http:' &&
          ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)
        ) {
          return true;
        }

        return false;
      } catch {
        return false;
      }
    },
    {
      message: `Please provide a valid HTTPS URL. Set the variable NEXT_PUBLIC_SITE_URL with a valid URL, such as: 'https://example.com'`,
      path: ['url'],
    },
  )
  .refine(
    (schema) => {
      return schema.themeColor !== schema.themeColorDark;
    },
    {
      message: `Please provide different theme colors for light and dark themes.`,
      path: ['themeColor'],
    },
  );

const appConfig = AppConfigSchema.parse({
  name: process.env.NEXT_PUBLIC_PRODUCT_NAME,
  title: process.env.NEXT_PUBLIC_SITE_TITLE,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_SITE_URL,
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  theme: process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE,
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR,
  themeColorDark: process.env.NEXT_PUBLIC_THEME_COLOR_DARK,
  production,
});

export default appConfig;
