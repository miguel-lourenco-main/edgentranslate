import type { NextConfig } from 'next';

const basePath = process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '';

const nextConfig: NextConfig = {
  // Static-first: always export a fully static site.
  output: 'export',
  trailingSlash: true,

  // `next export` requires disabling the Next.js Image optimizer.
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
  // Exposed so client code can build absolute URLs to files in /public.
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  experimental: {
    // app/(legacy) and app/(v2) are separate root layouts (#3), so the site-wide 404
    // lives in app/global-not-found.tsx, which renders its own <html>.
    globalNotFound: true,
  },
};

export default nextConfig;
