import type { NextConfig } from 'next';

const isGitLabPages =
  process.env.GITLAB_PAGES === 'true' ||
  process.env.GITLAB_PAGES === '1' ||
  process.env.CI_PAGES === 'true';

const projectName = process.env.CI_PROJECT_NAME?.trim();
const gitlabBasePath = projectName ? `/${projectName}` : '';
const basePath = isGitLabPages ? gitlabBasePath : '';

const nextConfig: NextConfig = {
  // When deploying to GitLab Pages, we export a fully static site.
  ...(isGitLabPages ? { output: 'export', trailingSlash: true } : {}),

  // GitLab Pages serves the site under /<projectName>.
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),

  // `next export` requires disabling the Next.js Image optimizer.
  images: {
    unoptimized: isGitLabPages,
  },
};

export default nextConfig;
