/**
 * Section: Equivalence Classes
 * Test Case IDs covered: TC-053, TC-054, TC-055
 * Business Rule(s): BR2
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet, Product } from '../../test-data/testData';

async function names(sp: { getAllTileNames(): Promise<string[]> }): Promise<Set<string>> {
  return new Set(await sp.getAllTileNames());
}

test.describe('Equivalence Classes', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
  });

  test('TC-053: Discount checkbox partitions @styleup @regression @smoke', async ({ searchResultsPage }) => {
    const class1 = await test.step('Class 1: "10" (≥10%)', async () => {
      await searchResultsPage.checkDiscount('10');
      return names(searchResultsPage);
    });
    const class2 = await test.step('Class 2: "50" (≥50%, a subset of Class 1)', async () => {
      await searchResultsPage.uncheckDiscount('10');
      await searchResultsPage.checkDiscount('50');
      return names(searchResultsPage);
    });
    for (const n of class2) expect(class1.has(n)).toBe(true);
  });

  test('TC-054: Brand dropdown partitions: named brand vs "All Brands" vs zero-match brand @styleup @regression', async ({ page, searchResultsPage }) => {
    const class1 = await test.step('Class 1: "Nike" (matches exist)', async () => {
      await searchResultsPage.selectSortByBrand('Nike');
      return names(searchResultsPage);
    });
    const class2 = await test.step('Class 2: "" (All Brands)', async () => {
      await searchResultsPage.selectSortByBrand('');
      return names(searchResultsPage);
    });

    const nineBrands: Product[] = defaultResultSet.filter((p) => p.brand !== 'H&M');
    await seedSearchData(page, nineBrands);
    await searchResultsPage.reload();
    const class3 = await test.step('Class 3: a brand with zero matches in this result set', async () => {
      await searchResultsPage.selectSortByBrand('H&M');
      return names(searchResultsPage);
    });

    expect(class1).toEqual(new Set(['Zeta Tee']));
    // Classes 2 and 3 are IDENTICAL — both show the full unfiltered list (Finding 6) —
    // confirming they collapse into one observable equivalence class despite being
    // conceptually distinct.
    expect(class3).toEqual(new Set(nineBrands.map((p) => p.name)));
  });

  test('TC-055: GENDER/CATEGORIES checkbox partitions are each independent, non-composing classes @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Apply GENDER "Boys" alone; note result', () => searchResultsPage.checkGender('Boys'));
    const categoryAlone = await test.step('Apply CATEGORIES "Shoes" alone; note result', async () => {
      await searchResultsPage.checkCategory('Shoes');
      return names(searchResultsPage);
    });
    const bothApplied = await test.step('Apply both in sequence; note result', () => names(searchResultsPage));

    // Step 3's result equals step 2's result exactly — the last-applied filter's class
    // alone governs; no compound "Boys AND Shoes" class exists (Finding 3).
    expect(bothApplied).toEqual(categoryAlone);
  });
});
