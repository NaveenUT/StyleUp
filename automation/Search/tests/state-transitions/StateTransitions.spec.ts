/**
 * Section: State Transitions
 * Test Case IDs covered: TC-072, TC-073, TC-074, TC-075
 * Business Rule(s): BR9, BR10
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedNow, seedUserdata, readCartData } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount, searchTerms } from '../../test-data/testData';

test.describe('State Transitions', () => {
  test('TC-072: Filter unapplied → applied → unapplied @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
    const initialCount = await test.step('Note initial (unapplied) tile count', () => searchResultsPage.getTileCount());

    await test.step('Check "Shoes" (applied)', () => searchResultsPage.checkCategory('Shoes'));
    await test.step('Uncheck "Shoes" (unapplied)', () => searchResultsPage.uncheckCategory('Shoes'));

    expect(await searchResultsPage.getTileCount()).toBe(initialCount);
  });

  test('TC-073: Sort has no path back to "default" once an option is chosen (defect) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Select "Low to High"; confirm ascending order', async () => {
      await searchResultsPage.selectSortByPrice('ascending');
      const prices = await searchResultsPage.getAllTilePrices();
      for (let i = 0; i < prices.length - 1; i++) expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    });
    const sortedOrder = await searchResultsPage.getAllTileNames();

    await test.step('Re-select the dropdown\'s original blank "Sort by Price" placeholder option', () => searchResultsPage.selectSortByPrice(''));

    // Defect: search.js:61-74's handlesortprice() has no branch matching an empty
    // value — neither `if` fires, so nothing happens and the previously-sorted order remains.
    expect(await searchResultsPage.getAllTileNames()).toEqual(sortedOrder);
  });

  test('TC-074: Cart count 0 → n → 0 @styleup @regression', async ({ page, searchResultsPage, cartPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await seedNow(page, { userdata: [existingAccount], loginStatus: true, cartData: [] });
    // .setup() (not .reload()) — this test also destructures cartPage, whose own
    // fixture setup() auto-navigates to cart.html; reload() would just reload whichever
    // page fixture resolution left us on, not necessarily search.html.
    await searchResultsPage.setup();
    await test.step('Confirm icon "0"', async () => {
      await expect(searchResultsPage.cartBadge).toHaveText('0');
    });

    await test.step('Add the product; confirm "1"', async () => {
      await searchResultsPage.addToCartByIndex(0);
      await expect(searchResultsPage.cartBadge).toHaveText('1');
    });

    await test.step('Remove it via the Cart page; return here and confirm "0"', async () => {
      await cartPage.setup();
      await cartPage.removeItem(0);
      await searchResultsPage.setup();
      await expect(searchResultsPage.cartBadge).toHaveText('0');
    });
  });

  test('TC-075: Guest → Authenticated while remaining conceptually on this journey @styleup @regression', async ({ page, searchResultsPage, loginPage, homePage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await seedUserdata(page, [existingAccount]); // Precondition: account exists — sign-in itself still runs through the real UI below
    // .setup() (not .reload()) — this test also destructures loginPage/homePage, whose
    // fixtures auto-navigate elsewhere; reload() would reload whichever page fixture
    // resolution left us on, not necessarily search.html.
    await searchResultsPage.setup();

    await test.step('As a guest, add a product to cart', () => searchResultsPage.addToCartByIndex(0));

    await test.step('Sign in', async () => {
      await loginPage.setup();
      await loginPage.login(existingAccount.Email, existingAccount.Password);
    });

    await test.step('Return to search.html (a fresh search)', async () => {
      await homePage.setup();
      const { resultsPage } = await homePage.searchAndGoToResults(searchTerms.shoes);
      await expect(resultsPage.cartBadge).toHaveText('1');
    });

    const cartData = await readCartData(page);
    expect(cartData).toHaveLength(1);
  });
});
