/**
 * Section: Boundary — Discount Ranges
 * Test Case IDs covered: TC-056, TC-057, TC-058
 * Business Rule(s): BR2
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:143-163, predicate: (discount*100)/strikedoffprice>=Number(value)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { boundaryProducts } from '../../test-data/testData';

test.describe('Boundary — Discount Ranges', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [
      boundaryProducts.atTwentyPercent,
      boundaryProducts.belowTwentyPercent,
      boundaryProducts.aboveTwentyPercent,
    ]);
    await searchResultsPage.reload();
  });

  test('TC-056: Product exactly at a discount threshold is included @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check ">20% off"', () => searchResultsPage.checkDiscount('20'));
    const names = await searchResultsPage.getAllTileNames();
    expect(names).toContain(boundaryProducts.atTwentyPercent.name);
  });

  test('TC-057: Product just below a discount threshold is excluded @styleup @regression', async ({ searchResultsPage }) => {
    await searchResultsPage.checkDiscount('20');
    const names = await searchResultsPage.getAllTileNames();
    expect(names).not.toContain(boundaryProducts.belowTwentyPercent.name);
  });

  test('TC-058: Product just above a discount threshold is included @styleup @regression', async ({ searchResultsPage }) => {
    await searchResultsPage.checkDiscount('20');
    const names = await searchResultsPage.getAllTileNames();
    expect(names).toContain(boundaryProducts.aboveTwentyPercent.name);
  });
});
