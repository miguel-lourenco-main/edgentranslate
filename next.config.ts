import type { NextConfig } from 'next';

function normalizeBasePath(value: string | undefined) {
  const raw = (value ?? '').trim();
  if (!raw || raw === '/') return '';
  const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

const nextConfig: NextConfig = {
  // Static-first: always export a fully static site.
  output: 'export',
  trailingSlash: true,

  // `next export` requires disabling the Next.js Image optimizer.
  images: {
    unoptimized: true,
  },

  ...(basePath
    ? {
        // For deployments under a sub-path (e.g. GitLab Project Pages),
        // this ensures assets resolve to `/<basePath>/_next/...`.
        basePath,
        assetPrefix: basePath,
      }
    : {}),
};

export default nextConfig;
