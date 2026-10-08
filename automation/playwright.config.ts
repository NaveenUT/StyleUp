import { defineConfig, devices } from '@playwright/test';
import { config } from './utils/config';

/**
 * Target app is served statically (python -m http.server 5501) from the repo root.
 * baseURL matches the routing mode confirmed in SOURCE_CODE_INVENTORY.md: plain
 * multi-page navigation via <file>.html, no SPA router, no hash routing.
 */
export default defineConfig({
  testDir: './tests', // discovers spec files in every subfolder (homepage/, signin/, etc.)
  fullyParallel: false, // localStorage-backed app state; tests within a file are not isolated by design
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
  ['html'],
  ['list'],
  ['json', { outputFile: 'test-results/results.json' }],
],
  use: {
    baseURL: config.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'python -m http.server 5501 --directory ..',
    url: `${config.baseUrl}/index.html`,
    reuseExistingServer: true,
    timeout: 10_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // // WebKit is the closest automatable stand-in for Safari; it is not Safari itself —
    // // recorded here, not glossed over, per the register's own Compatibility cases.
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // // Requires a local Edge install; if absent, this project simply fails to launch —
    // // run the other 3 projects standalone via --project=chromium/firefox/webkit.
    // { name: 'msedge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
});
