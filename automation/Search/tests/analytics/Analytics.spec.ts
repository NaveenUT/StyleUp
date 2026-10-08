/**
 * Section: Analytics
 * Test Case IDs covered: TC-093
 * Business Rule(s): Unmapped (no stating rule for Analytics, per the register's own text)
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — every .js file grepped for
 *   gtag/dataLayer/analytics/fetch(/sendBeacon/XMLHttpRequest, zero matches
 */
import { test, expect } from '../../fixtures/customFixtures';
import { searchTerms } from '../../test-data/testData';
import { config } from '../../utils/config';

test.describe('Analytics', () => {
  test('TC-093: No tracking call fires on search, filter, sort, or Add to Cart (zero-case) @styleup @regression @smoke', async ({ page, homePage }) => {
    const ownHost = new URL(config.baseUrl).host;
    const externalRequests: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (!url.includes(ownHost) && req.resourceType() !== 'image') externalRequests.push(url);
    });

    const { resultsPage } = await test.step('Land on the page', () => homePage.searchAndGoToResults(searchTerms.shoes));
    await test.step('Apply a filter', () => resultsPage.checkCategory('Shoes'));
    await test.step('Apply a sort', () => resultsPage.selectSortByPrice('ascending'));
    await test.step('Add to cart', () => resultsPage.addToCartByIndex(0));

    expect(externalRequests).toEqual([]);
  });
});
