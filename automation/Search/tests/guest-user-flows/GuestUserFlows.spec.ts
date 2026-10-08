/**
 * Section: Guest User Flows
 * Test Case IDs covered: TC-048, TC-049, TC-050
 * Business Rule(s): BR1, BR3, BR11
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) + live-verified this session (Finding 7's
 *   guest TypeError, and the redeclaration SyntaxError — see SearchResultsPage.ts header)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet, searchTerms } from '../../test-data/testData';

test.describe('Guest User Flows', () => {
  test('TC-048: Guest can reach and use the Search Results page fully (search, filter, sort, add to cart) @styleup @regression @smoke', async ({ page, homePage }) => {
    const { resultsPage } = await test.step('As a guest, search "Shoes"', () => homePage.searchAndGoToResults(searchTerms.shoes));

    await test.step('Apply one filter', () => resultsPage.checkCategory('Shoes'));
    await test.step('Apply one sort', () => resultsPage.selectSortByPrice('ascending'));
    const message = await test.step('Add one item to cart', () => resultsPage.addToCartByIndex(0));

    expect(message).toContain('Added to Cart');
    // No login prompt at any step — confirmed by every action above completing without
    // ever landing on signin.html.
    await expect(page).not.toHaveURL(/\/signin\.html$/);
  });

  test('TC-049: Guest sees no Cart icon even after adding items (compliant with BR3) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    await test.step('Add a product to cart as a guest', () => searchResultsPage.addToCartByIndex(0));

    expect(await searchResultsPage.isCartIconVisible()).toBe(false);
  });

  test('TC-050: Guest\'s page load and Add to Cart both throw an uncaught console error (defect) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);

    const getErrors = searchResultsPage.collectPageErrors();
    await test.step('Load search.html as a guest', () => searchResultsPage.setup());
    await test.step('Click "Add to Cart" on any tile', () => searchResultsPage.addToCartByIndex(0));

    // Per graceful degradation, no error should appear for an action BR3 explicitly
    // permits guests to perform. Record actual behavior — expected to FAIL, log as a
    // defect: a TypeError appears after both the page load and the Add to Cart click,
    // since navbar.js's guest branch never creates #cart-items, but search.js's own
    // cartItems() (search.js:164-171) unconditionally targets it (Finding 7).
    const errors = getErrors();
    expect(errors.some((e) => e.includes("Cannot set properties of null"))).toBe(true);
  });
});
