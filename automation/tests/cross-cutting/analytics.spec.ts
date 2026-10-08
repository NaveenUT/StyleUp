/**
 * Section: Analytics
 * Business Rule(s): Unmapped (no stating rule for Analytics, per the register's own text)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: every .js file (grepped for gtag/dataLayer/analytics/fetch(/sendBeacon/XMLHttpRequest)
 * Pages inspected: index.html (live network capture, this session)
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-114
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Analytics', () => {
  test('TC-114: No tracking/analytics call fires on key actions (zero-case)', async ({ homePage, signInPage, page }) => {
    // Zero-case confirmed by grep across every .js file in the repo (SOURCE_CODE_INVENTORY.md
    // "Not found" section) — gtag/dataLayer/analytics/sendBeacon/XMLHttpRequest/fetch( all
    // return zero matches. This test's own contribution is the live Network-panel half.
    const account = makeAccount('Analytics Tester', { Email: 'analytics@test.com', Password: 'Analytics@1' });
    await seedUserdata(page, [account]);

    const externalRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (!url.includes('localhost:5501') && req.resourceType() !== 'image') externalRequests.push(url);
    });

    await homePage.setup();
    await homePage.navbar.search('Shoes');
    await signInPage.setup();
    await signInPage.login(account.Email, account.Password);

    expect(externalRequests).toEqual([]);
  });
});
