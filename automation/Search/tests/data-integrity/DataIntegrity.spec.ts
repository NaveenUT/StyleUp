/**
 * Section: Data Integrity
 * Test Case IDs covered: TC-076, TC-077, TC-078, TC-079
 * Business Rule(s): BR9, BR3
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedUserdata, seedLoginStatus, readCartData } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount } from '../../test-data/testData';

test.describe('Data Integrity', () => {
  test('TC-076: Total Items count never drifts from the rendered tile count across filter/sort/brand operations (compliant) @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Apply a filter; compare count to tiles', async () => {
      await searchResultsPage.checkCategory('Shoes');
      expect(await searchResultsPage.getTotalItemsCount()).toBe(String(await searchResultsPage.getTileCount()));
    });
    await test.step('Apply a sort; compare again', async () => {
      await searchResultsPage.selectSortByPrice('ascending');
      // ⚠ SOURCE DISCREPANCY (newly discovered this conversion — contradicts the
      // register's own Finding 11, which calls this sequence "compliant")
      // Phase 1 expects: count equals rendered tile count at every one of the 3 steps.
      // Source shows: handlesortprice() (search.js:61-74) calls appendData(filterlist)
      // but NEVER calls getItemCount() — unlike the checkbox filters and
      // handlesortbrand(), which both do. After the preceding CATEGORIES filter set
      // #item-count to "2" (step 1), applying a sort re-renders the FULL, filter-
      // discarding 10-tile list (Table A row 2) but leaves the count label stuck at "2"
      // — live-confirmed this session. Assertion follows Phase 1 and is EXPECTED TO
      // FAIL against current source — raised for triage before merge, not weakened.
      expect(await searchResultsPage.getTotalItemsCount()).toBe(String(await searchResultsPage.getTileCount()));
    });
    await test.step('Apply a brand; compare again', async () => {
      await searchResultsPage.selectSortByBrand('Nike');
      expect(await searchResultsPage.getTotalItemsCount()).toBe(String(await searchResultsPage.getTileCount()));
    });
  });

  test('TC-077: A sort never loses or duplicates a tile @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
    const before = await test.step('Record the multiset of product names', () => searchResultsPage.getAllTileNames());

    await test.step('Apply "Descending" (name)', () => searchResultsPage.selectSortByName('descending'));

    const after = await searchResultsPage.getAllTileNames();
    expect(new Set(after)).toEqual(new Set(before));
    expect(after).toHaveLength(before.length);
  });

  test('TC-078: A cart entry written from this page holds every field exactly as rendered @styleup @regression', async ({ page, searchResultsPage }) => {
    const product = defaultResultSet[4];
    await seedSearchData(page, [product]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    const [renderedName, renderedPrice] = await test.step('Note the tile\'s displayed name and price', async () => {
      return [await searchResultsPage.getTileName(0), await searchResultsPage.getTilePriceValue(0)];
    });
    await test.step('Add to cart', () => searchResultsPage.addToCartByIndex(0));

    const cartData = await test.step('Inspect the cartData entry', () => readCartData(page));
    expect(cartData[0].name).toBe(renderedName);
    expect(cartData[0].price).toBe(renderedPrice);
  });

  test('TC-079: Cart count stays arithmetically equal to the sum of stored quantities across repeated adds @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[5]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    await test.step('Add the same product 3 times', async () => {
      await searchResultsPage.addToCartByIndex(0);
      await searchResultsPage.addToCartByIndex(0);
      await searchResultsPage.addToCartByIndex(0);
    });

    const cartData = await readCartData(page);
    expect(cartData[0].quantity).toBe(3);
    await expect(searchResultsPage.cartBadge).toHaveText('3');
  });
});
