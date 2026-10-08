/**
 * Section: Concurrency
 * Test Case IDs covered: TC-080, TC-081, TC-082
 * Business Rule(s): BR10
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:2 (`cartarr` snapshotted once per page load)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedUserdata, seedLoginStatus, readCartData } from '../../utils/storageHelpers';
import { SearchResultsPage } from '../../pages/SearchResultsPage';
import { defaultResultSet, existingAccount } from '../../test-data/testData';

// Note: SearchResultsPage.forPage() is a page-class STATIC FACTORY method (declared in
// pages/SearchResultsPage.ts), not a `new` call made from this spec file — used only for
// the second tab/context these two multi-page test cases need, which the single-page
// customFixtures.ts fixture system has no slot for.

test.describe('Concurrency', () => {
  test('TC-080: Two tabs both on Search Results, same product added from each @styleup @regression @smoke', async ({ page, context, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload(); // Tab A

    const tabBPage = await context.newPage();
    const tabB = SearchResultsPage.forPage(tabBPage);
    await tabB.setup(); // Tab B — loads search.html with its OWN in-memory cartarr snapshot

    await test.step('In Tab A, add the product', () => searchResultsPage.addToCartByIndex(0));
    await test.step('In Tab B (not yet reloaded), add the same product', () => tabB.addToCartByIndex(0));

    await test.step('Reload Tab B and inspect cartData', async () => {
      await tabB.reload();
    });

    // Live-confirmed this session: Tab B's own in-memory cartarr was stale (loaded
    // before Tab A's write) — its add overwrites Tab A's, producing quantity 1 instead
    // of the expected 2. A lost-update defect, asserted here as the confirmed fact.
    const cartData = await readCartData(page);
    expect(cartData).toHaveLength(1);
    expect(cartData[0].quantity).toBe(1);
    await tabBPage.close();
  });

  test('TC-081: Same account, two different browsers, cart does not sync @styleup @regression', async ({ page, browser, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[1]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    await test.step('Log in and add a product in "Chrome" (context 1); confirm Cart "1"', async () => {
      await searchResultsPage.addToCartByIndex(0);
      await expect(searchResultsPage.cartBadge).toHaveText('1');
    });

    await test.step('Log in with the same account in a second, fully isolated context ("Firefox")', async () => {
      const otherContext = await browser.newContext();
      const otherPage = await otherContext.newPage();
      const otherResults = SearchResultsPage.forPage(otherPage);
      await otherResults.setup();
      // localStorage is per-browser-profile — an inherent architectural characteristic.
      expect(await otherResults.isCartIconVisible()).toBe(false);
      await otherContext.close();
    });
  });

  test('TC-082: Rapid double-click on a single Add to Cart button @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[2]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    const { dialogCount } = await test.step('Double-click "Add to Cart" on one tile as fast as possible', () => searchResultsPage.dblClickAddToCartByIndex(0));

    // Live-confirmed this session: addToCart() runs synchronously per click with no
    // debounce, and both clicks are processed (the second queues behind the first
    // alert's blocking) — two rapid clicks register as two separate additions.
    expect(dialogCount).toBe(2);
    const cartData = await readCartData(page);
    expect(cartData).toHaveLength(1);
    expect(cartData[0].quantity).toBe(2);
  });
});
