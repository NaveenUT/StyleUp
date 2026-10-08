/**
 * Section: Compliance
 * Test Case IDs covered: TC-091, TC-092
 * Business Rule(s): BR14
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

test.describe('Compliance', () => {
  test('TC-091: Footer\'s Privacy Policy item does not resolve to a real document, from this page @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    await test.step('Click "Privacy Policy" in this page\'s footer', () => searchResultsPage.footerCell('Privacy Policy').click());

    await expect(page).toHaveURL(/\/search\.html$/);
  });

  test('TC-092: No consent is obtained before an Add to Cart click writes to client storage @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();
    await page.evaluate(() => window.localStorage.removeItem('cartData'));

    // No consent banner/modal exists anywhere in source (grepped — zero matches outside
    // terms-of-use.html's own body text); the only dialog that appears is the add-to-cart
    // success alert itself, confirming storage is written immediately with no consent gate.
    const message = await test.step('Click "Add to Cart" on any tile', () => searchResultsPage.addToCartByIndex(0));
    expect(message).toContain('Added to Cart');

    const cartData = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cartData') || '[]'));
    expect(cartData.length).toBeGreaterThan(0);
  });
});
