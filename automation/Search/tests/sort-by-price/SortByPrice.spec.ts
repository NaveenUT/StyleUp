/**
 * Section: Sort by Price
 * Test Case IDs covered: TC-021, TC-022
 * Business Rule(s): BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:61-74, numeric comparator (Finding 8)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

test.describe('Sort by Price', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
  });

  test('TC-021: "Low to High" re-orders ascending @styleup @regression @smoke', async ({ searchResultsPage }) => {
    const before = await test.step('Record all prices in current order', () => searchResultsPage.getAllTilePrices());

    await test.step('Select "Low to High"', () => searchResultsPage.selectSortByPrice('ascending'));

    const after = await test.step('Compare new order', () => searchResultsPage.getAllTilePrices());
    for (let i = 0; i < after.length - 1; i++) expect(after[i]).toBeLessThanOrEqual(after[i + 1]);
    expect([...after].sort((a, b) => a - b)).toEqual([...before].sort((a, b) => a - b));
  });

  test('TC-022: "High to Low" re-orders descending @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Select "High to Low"', () => searchResultsPage.selectSortByPrice('descending'));

    const after = await searchResultsPage.getAllTilePrices();
    for (let i = 0; i < after.length - 1; i++) expect(after[i]).toBeGreaterThanOrEqual(after[i + 1]);
  });
});
