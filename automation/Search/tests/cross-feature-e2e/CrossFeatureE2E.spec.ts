/**
 * Section: Cross-Feature End-to-End Journeys
 * Test Case IDs covered: TC-122, TC-123, TC-124, TC-125, TC-126
 * Business Rule(s): BR1, BR2, BR3, BR4, BR9, BR10, BR11
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedUserdata, seedLoginStatus, readCartData } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount, searchTerms } from '../../test-data/testData';

test.describe('Cross-Feature End-to-End Journeys', () => {
  test('TC-122: Guest search → filter → sort → add to cart → sign in, ending in a persisted-state assertion @styleup @regression @smoke', async ({ page, homePage, loginPage }) => {
    await seedUserdata(page, [existingAccount]);
    // .setup() explicitly — this test also destructures loginPage, whose own fixture
    // setup() auto-navigates to signin.html; whichever fixture resolves last determines
    // where the test body actually starts, so home's own start page can't be assumed.
    await homePage.setup();

    const { resultsPage } = await test.step('Search "Shoes"', () => homePage.searchAndGoToResults(searchTerms.shoes));
    await test.step('Apply the "Shoes" CATEGORIES filter', () => resultsPage.checkCategory('Shoes'));
    await test.step('Apply "Low to High" (per Table A, this discards the filter)', () => resultsPage.selectSortByPrice('ascending'));
    await test.step('Add the top-listed item to cart as a guest', () => resultsPage.addToCartByIndex(0));

    await test.step('Sign in', async () => {
      await loginPage.setup();
      await loginPage.login(existingAccount.Email, existingAccount.Password);
    });

    const cartData = await readCartData(page);
    expect(cartData).toHaveLength(1);
  });

  test('TC-123: Authenticated multi-add across two distinct products with a Discount filter in between @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.setup();

    await test.step('Apply ">30% off"', () => searchResultsPage.checkDiscount('30'));
    await test.step('Add the first listed product', () => searchResultsPage.addToCartByIndex(0));
    await test.step('Add a second, different listed product', () => searchResultsPage.addToCartByIndex(1));

    await expect(searchResultsPage.cartBadge).toHaveText('2');
    const cartData = await readCartData(page);
    expect(cartData).toHaveLength(2);
    expect(cartData[0].quantity).toBe(1);
    expect(cartData[1].quantity).toBe(1);
  });

  test('TC-124: Brand selection after a category filter, ending in an add-to-cart persisted-state assertion @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.setup();

    await test.step('Check "Shoes"', () => searchResultsPage.checkCategory('Shoes'));
    await test.step('Select "Nike" (per Table C, this discards the Shoes filter)', () => searchResultsPage.selectSortByBrand('Nike'));
    const visibleName = await searchResultsPage.getTileName(0);
    await test.step('Add the first listed item', () => searchResultsPage.addToCartByIndex(0));

    // cartData holds the Nike-brand item actually visible at the moment of the click —
    // not necessarily a "Nike Shoes" item, per the Table C defect.
    const cartData = await readCartData(page);
    expect(cartData[0].name).toBe(visibleName);
    expect(cartData[0].name).toBe('Zeta Tee'); // defaultResultSet's sole Nike item
  });

  test('TC-125: Zero-result search state followed by a fresh, successful search @styleup @regression', async ({ page, homePage }) => {
    const message1 = await test.step('Search a well-formed but non-matching term', () => homePage.search(searchTerms.nonMatching));
    expect(message1).toBe('Product not Found');
    await expect(page).toHaveURL(/\/index\.html$/);

    const { resultsPage, message: message2 } = await test.step('Search "Shoes" instead', () => homePage.searchAndGoToResults(searchTerms.shoes));
    expect(message2).toMatch(/^\d+ no\. of products found$/);
    expect(await resultsPage.getTileCount()).toBeGreaterThan(0);
  });

  test('TC-126: Full guest-to-authenticated Add to Cart journey via the console-error path, ending in a persisted-state assertion @styleup @regression', async ({ page, homePage, loginPage }) => {
    await seedUserdata(page, [existingAccount]);
    // .setup() explicitly — see TC-122's comment on the same loginPage/homePage fixture-
    // ordering footgun.
    await homePage.setup();

    const { resultsPage } = await test.step('Search "Shoes"', () => homePage.searchAndGoToResults(searchTerms.shoes));
    const getErrors = resultsPage.collectPageErrors();
    await test.step('Add an item as a guest (note the Console error per TC-050)', () => resultsPage.addToCartByIndex(0));
    expect(getErrors().some((e) => e.includes('Cannot set properties of null'))).toBe(true);

    await test.step('Sign in', async () => {
      await loginPage.setup();
      await loginPage.login(existingAccount.Email, existingAccount.Password);
    });

    // Despite the guest-side console error, cartData was still correctly written (the
    // error occurs in cartItems(), called AFTER localStorage.setItem in addToCart()) —
    // the item persists and the icon correctly shows "1" post-login.
    const cartData = await readCartData(page);
    expect(cartData).toHaveLength(1);
    await expect(homePage.cartBadge).toHaveText('1');
  });
});
