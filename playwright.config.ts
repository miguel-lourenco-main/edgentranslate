import { defineConfig, devices } from '@playwright/test';

// Runs against E2E_BASE_URL when set (e.g. a static build served under a base path),
// otherwise starts the dev server.
const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 1000 } } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm dev --port ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000,
      },
});
