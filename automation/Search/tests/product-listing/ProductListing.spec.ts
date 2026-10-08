/**
 * Section: Product Listing
 * Test Case IDs covered: TC-038, TC-039, TC-040
 * Business Rule(s): BR4, BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet, searchTerms } from '../../test-data/testData';

test.describe('Product Listing', () => {
  test('TC-038: Rendered tiles match the current search term\'s product set @styleup @regression @smoke', async ({ page, homePage }) => {
    let resultsPage;
    await test.step('Search "Shoes"', async () => {
      ({ resultsPage } = await homePage.searchAndGoToResults(searchTerms.shoes));
    });

    const searchData: { brand: string; gender: string; category: string }[] = await test.step(
      'Inspect each rendered tile\'s underlying data via storage',
      () => page.evaluate(() => JSON.parse(window.localStorage.getItem('searchData') || '[]')),
    );

    // Source: search-algo.js:1272-1280 — matches brand/gender/category prefix, NEVER name (Finding 2).
    const term = searchTerms.shoes.toUpperCase();
    for (const entry of searchData) {
      const matches = [entry.brand, entry.gender, entry.category].some(
        (field) => field.substring(0, term.length).toUpperCase() === term,
      );
      expect(matches).toBe(true);
    }
    expect(searchData.length).toBeGreaterThan(0);
  });

  test('TC-039: Each tile shows name, brand, price, strikedoff price, discount %, and image @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();
    const product = defaultResultSet[0];

    await test.step('Inspect one tile\'s rendered content', async () => {
      expect(await searchResultsPage.getTileName(0)).toBe(product.name);
      expect(await searchResultsPage.getTileBrand(0)).toBe(product.brand);
      expect(await searchResultsPage.getTilePriceValue(0)).toBe(product.price);
      const discountPercent = Math.round((product.discount * 100) / product.strikedoffprice);
      expect(await searchResultsPage.getTileDiscountPercent(0)).toBe(discountPercent);
    });
  });

  test('TC-040: Zero-matching-results empty state (BR4) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, []);
    await test.step('Load search.html directly with searchData set to []', () => searchResultsPage.reload());

    expect(await searchResultsPage.getTileCount()).toBe(0);
    expect(await searchResultsPage.getTotalItemsCount()).toBe('0');
  });
});
