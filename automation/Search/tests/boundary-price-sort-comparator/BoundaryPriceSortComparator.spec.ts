/**
 * Section: Boundary — Price Sort Comparator
 * Test Case IDs covered: TC-062, TC-063
 * Business Rule(s): BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:61-74
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet, boundaryProducts } from '../../test-data/testData';

test.describe('Boundary — Price Sort Comparator', () => {
  test('TC-062: Two products with identical price both remain present after an ascending sort (stability check) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [boundaryProducts.samePriceA, boundaryProducts.samePriceB]);
    await searchResultsPage.reload();

    await test.step('Apply "Low to High"', () => searchResultsPage.selectSortByPrice('ascending'));

    const names = await searchResultsPage.getAllTileNames();
    expect(names).toHaveLength(2);
    expect(new Set(names)).toEqual(new Set([boundaryProducts.samePriceA.name, boundaryProducts.samePriceB.name]));
  });

  test('TC-063: Ascending and descending sorts both contain the full original multiset of tiles @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
    const originalNames = await test.step('Record all product names', () => searchResultsPage.getAllTileNames());

    const ascendingNames = await test.step('Apply "Low to High"; record names again', async () => {
      await searchResultsPage.selectSortByPrice('ascending');
      return searchResultsPage.getAllTileNames();
    });
    const descendingNames = await test.step('Apply "High to Low"; record names again', async () => {
      await searchResultsPage.selectSortByPrice('descending');
      return searchResultsPage.getAllTileNames();
    });

    expect(new Set(ascendingNames)).toEqual(new Set(originalNames));
    expect(new Set(descendingNames)).toEqual(new Set(originalNames));
  });
});
