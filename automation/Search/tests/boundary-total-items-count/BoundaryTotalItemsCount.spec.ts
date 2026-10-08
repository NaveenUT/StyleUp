/**
 * Section: Boundary — Total Items Count
 * Test Case IDs covered: TC-059, TC-060, TC-061
 * Business Rule(s): BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

test.describe('Boundary — Total Items Count', () => {
  test('TC-059: Count displays correctly at 0 @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, []);
    await test.step('Load with an empty searchData', () => searchResultsPage.reload());
    expect(await searchResultsPage.getTotalItemsCount()).toBe('0');
  });

  test('TC-060: Count displays correctly at exactly 1 @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
    await test.step('Apply a filter/brand known to yield exactly 1 tile', () => searchResultsPage.selectSortByBrand('Nike'));
    expect(await searchResultsPage.getTotalItemsCount()).toBe('1');
    expect(await searchResultsPage.getTileCount()).toBe(1);
  });

  test('TC-061: Count displays correctly at n (multiple) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await test.step('Search with no filter', () => searchResultsPage.reload());
    expect(await searchResultsPage.getTotalItemsCount()).toBe(String(defaultResultSet.length));
  });
});
