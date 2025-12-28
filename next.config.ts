import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static-first: always export a fully static site.
  output: 'export',
  trailingSlash: true,

  // `next export` requires disabling the Next.js Image optimizer.
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH || '' : '',
};

export default nextConfig;
