/**
 * Section: Decision Tables
 * Test Case IDs covered: TC-066–TC-071
 * Business Rule(s): BR2, BR3, BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source), live-verified this session for TC-066/067
 *   (see comment on TC-067 below)
 * Decision tables referenced: Table A (Filter × Sort), Table B (multi-group filter),
 *   Table C (Brand × Filter), Table D (Add to Cart × User type)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedUserdata, seedLoginStatus } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount } from '../../test-data/testData';

test.describe('Decision Tables', () => {
  test('TC-066: Table A row 2 — filter active, then sort applied (filter is discarded) @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Check "Shoes"; confirm filtered results', async () => {
      await searchResultsPage.checkCategory('Shoes');
      expect(await searchResultsPage.getTileCount()).toBe(2);
    });
    await test.step('Select "Low to High" without unchecking "Shoes"', () => searchResultsPage.selectSortByPrice('ascending'));

    const prices = await searchResultsPage.getAllTilePrices();
    // Full searchArr is shown, sorted ascending by price, ignoring the still-checked
    // "Shoes" box (Table A, row 2).
    expect(prices).toHaveLength(defaultResultSet.length);
    for (let i = 0; i < prices.length - 1; i++) expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
  });

  test('TC-067: Table A row 4 — sort active, then filter applied (sort is discarded) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Select "Low to High"; confirm ascending order', async () => {
      await searchResultsPage.selectSortByPrice('ascending');
      const prices = await searchResultsPage.getAllTilePrices();
      for (let i = 0; i < prices.length - 1; i++) expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    });
    await test.step('Check "Tshirts"', () => searchResultsPage.checkCategory('Tshirts'));

    // ⚠ SOURCE DISCREPANCY
    // Phase 1 expects: "The Shoes-filtered subset is shown in searchArr's original
    // (unsorted) order, not price order."
    // Source/live behaviour shows (confirmed this session): search.js:64-66's
    // `searchArr.sort(...)` mutates `searchArr` IN PLACE (Array.prototype.sort always
    // sorts the receiver and returns the same reference) — it is not a copy. A
    // subsequent checkbox filter's `.filter()` call (search.js:127-141) then reads that
    // now-permanently-reordered `searchArr`, so the Tshirts-filtered subset comes out in
    // PRICE order ["Zeta Tee","Alpha Tee"], not original insertion order ["Alpha Tee",
    // "Zeta Tee"] — live-verified via a throwaway probe against this exact 2-item case.
    // Assertion below follows Phase 1 (expects original/unsorted order) and is EXPECTED
    // TO FAIL against current source — raised for triage before merge, not weakened.
    const names = await searchResultsPage.getAllTileNames();
    expect(names).toEqual(['Alpha Tee', 'Zeta Tee']);
  });

  test('TC-068: Table B row 3 — cross-group checkbox combination @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Check "Girls"', () => searchResultsPage.checkGender('Girls'));
    await test.step('Check "Dresses"', () => searchResultsPage.checkCategory('Dresses'));

    const names = await searchResultsPage.getAllTileNames();
    expect(new Set(names)).toEqual(new Set(['Iota Dress', 'Delta Dress']));
    expect(await searchResultsPage.isGenderChecked('Girls')).toBe(true);
  });

  test('TC-069: Table C — brand selection after a CATEGORIES filter discards it @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Check "Tshirts"; confirm filtered results', async () => {
      await searchResultsPage.checkCategory('Tshirts');
      expect(new Set(await searchResultsPage.getAllTileNames())).toEqual(new Set(['Alpha Tee', 'Zeta Tee']));
    });
    await test.step('Select "Nike"', () => searchResultsPage.selectSortByBrand('Nike'));

    // Nike-filtered subset (from full searchArr) shown, not "Nike Tshirts" — the Tshirts
    // filter is discarded (Table C, row 2). `.filter()` never mutates searchArr, so this
    // one composes exactly as the register describes (unlike TC-067's sort-then-filter case).
    expect(await searchResultsPage.getAllTileNames()).toEqual(['Zeta Tee']);
  });

  test('TC-070: Table D row 1 — authenticated, cart non-empty (compliant) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    await test.step('Add a product', () => searchResultsPage.addToCartByIndex(0));
    await expect(searchResultsPage.cartBadge).toHaveText('1');
  });

  test('TC-071: Table D row 3 — guest, cart non-empty (defect) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    const getErrors = searchResultsPage.collectPageErrors();
    await test.step('Add a product as a guest; check the Console', () => searchResultsPage.addToCartByIndex(0));

    expect(await searchResultsPage.isCartIconVisible()).toBe(false);
    expect(getErrors().some((e) => e.includes('Cannot set properties of null'))).toBe(true);
  });
});
