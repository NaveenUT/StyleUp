/**
 * Section: Add to Cart
 * Test Case IDs covered: TC-041, TC-042, TC-043, TC-044
 * Business Rule(s): BR3, BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:40-59
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedLoginStatus, seedUserdata, readCartData } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount } from '../../test-data/testData';

test.describe('Add to Cart', () => {
  test('TC-041: Guest can successfully add a product to the cart @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    const message = await test.step('Click "Add to Cart" on one tile', () => searchResultsPage.addToCartByIndex(0));
    expect(message).toBe(`Product ${defaultResultSet[0].name} Added to Cart Succesfuly`);

    const cartData = await test.step('Inspect cartData', () => readCartData(page));
    expect(cartData).toHaveLength(1);
    expect(cartData[0].quantity).toBe(1);
  });

  test('TC-042: Authenticated user can add a product and sees the Cart icon update @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[1]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    const message = await test.step('Click "Add to Cart"', () => searchResultsPage.addToCartByIndex(0));
    expect(message).toContain('Added to Cart Succesfuly');
    await expect(searchResultsPage.cartBadge).toHaveText('1');
  });

  test('TC-043: Adding the same product twice increments its quantity rather than duplicating the entry @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[2]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    await test.step('Add the product', () => searchResultsPage.addToCartByIndex(0));
    const secondMessage = await test.step('Add the same product again', () => searchResultsPage.addToCartByIndex(0));

    expect(secondMessage).toBe(`Product ${defaultResultSet[2].name} Added to Cart 2 Times`);
    const cartData = await readCartData(page);
    expect(cartData).toHaveLength(1);
    expect(cartData[0].quantity).toBe(2);
  });

  test('TC-044: cartprice stays arithmetically consistent with quantity × price @styleup @regression', async ({ page, searchResultsPage }) => {
    const product = defaultResultSet[3];
    await seedSearchData(page, [product]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    await searchResultsPage.addToCartByIndex(0);
    await searchResultsPage.addToCartByIndex(0);

    const cartData = await readCartData(page);
    expect(cartData[0].cartprice).toBe(product.price * cartData[0].quantity);
  });
});
