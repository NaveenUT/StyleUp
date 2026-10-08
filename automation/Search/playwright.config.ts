import { defineConfig, devices } from '@playwright/test';
import { config } from './utils/config';

/**
 * Target app is served statically (python -m http.server 5501) from the repo root,
 * two levels up from this project (d:\Style-Up-E-commerce-Website--master). Plain
 * multi-page navigation via <file>.html — no SPA router, no hash routing, confirmed
 * by reading every navigation call in search.js/search-algo.js/navbar.js.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: config.timeout,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['monocart-reporter', { name: 'Search Results Page — Test Report', outputFile: 'monocart-report/index.html' }],
  ],
  use: {
    baseURL: config.baseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'python -m http.server 5501 --directory ../..',
    url: config.baseUrl,
    reuseExistingServer: true,
    timeout: 10_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // WebKit is the closest automatable stand-in for Safari, not Safari itself.
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    // Requires a local Edge install; if absent this project simply fails to launch —
    // run the other 3 projects standalone via --project=chromium/firefox/webkit.
    { name: 'msedge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
  ],
});
