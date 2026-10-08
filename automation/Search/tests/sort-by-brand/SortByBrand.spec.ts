/**
 * Section: Sort by Brand
 * Test Case IDs covered: TC-026–TC-037
 * Business Rule(s): BR2
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:93-105, filter + zero-match fallback (Finding 6)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet, Product } from '../../test-data/testData';
import type { Brand } from '../../pages/SearchResultsPage';

const BY_BRAND: Record<string, string> = Object.fromEntries(defaultResultSet.map((p) => [p.brand, p.name]));

test.describe('Sort by Brand', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
  });

  const namedBrands = ['US-Polo', 'Max', 'YK-Disney', 'H&M', 'Trends', 'Nike', 'Polo', 'Addidas', 'Reebok', 'RedTape'] as const;
  for (const brand of namedBrands) {
    const tcId = { 'US-Polo': 'TC-026', Max: 'TC-027', 'YK-Disney': 'TC-028', 'H&M': 'TC-029', Trends: 'TC-030', Nike: 'TC-031', Polo: 'TC-032', Addidas: 'TC-033', Reebok: 'TC-034', RedTape: 'TC-035' }[brand];
    test(`${tcId}: "${brand}" filters to that brand only @styleup @regression`, async ({ searchResultsPage }) => {
      await test.step(`Select "${brand}"`, () => searchResultsPage.selectSortByBrand(brand));
      const names = await searchResultsPage.getAllTileNames();
      expect(names).toEqual([BY_BRAND[brand]]);
    });
  }

  test('TC-036: "All Brands" restores the full list @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Select a named brand, confirm filtering', async () => {
      await searchResultsPage.selectSortByBrand('Nike');
      expect(await searchResultsPage.getAllTileNames()).toEqual(['Zeta Tee']);
    });
    await test.step('Select "Sort by Brand"\'s placeholder option again', () => searchResultsPage.selectSortByBrand(''));

    expect(await searchResultsPage.getTileCount()).toBe(defaultResultSet.length);
  });

  test('TC-037: A brand with zero matches in the current result set is visually indistinguishable from "All Brands" (defect/discrepancy) @styleup @regression', async ({ page, searchResultsPage }) => {
    // A result set deliberately missing one brand ("H&M") entirely.
    const nineBrands: Product[] = defaultResultSet.filter((p) => p.brand !== 'H&M');
    await seedSearchData(page, nineBrands);
    await searchResultsPage.reload();

    await test.step('Select "H&M" when no product in the current set has that brand', () => searchResultsPage.selectSortByBrand('H&M'));

    // Per Finding 6, the fallback branch shows the full unfiltered searchArr — identical
    // to selecting "All Brands" — with no "0 products for this brand" indication.
    const namesAfterZeroMatch = await searchResultsPage.getAllTileNames();
    expect(new Set(namesAfterZeroMatch)).toEqual(new Set(nineBrands.map((p) => p.name)));

    await searchResultsPage.selectSortByBrand('');
    const namesAfterAllBrands = await searchResultsPage.getAllTileNames();
    expect(new Set(namesAfterZeroMatch)).toEqual(new Set(namesAfterAllBrands));
  });
});
