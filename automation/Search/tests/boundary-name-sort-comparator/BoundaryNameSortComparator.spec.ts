/**
 * Section: Boundary — Name Sort Comparator
 * Test Case IDs covered: TC-064, TC-065
 * Business Rule(s): BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:75-92 (UTF-16 code point comparison)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { boundaryProducts } from '../../test-data/testData';

test.describe('Boundary — Name Sort Comparator', () => {
  test('TC-064: Leading-whitespace product name sorts unexpectedly under "Ascending" (discrepancy) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [boundaryProducts.normalName, boundaryProducts.leadingSpaceName]);
    await searchResultsPage.reload();

    await test.step('Apply "Ascending"', () => searchResultsPage.selectSortByName('ascending'));

    // A space character (code point 32) sorts before all letters, so this name appears
    // first regardless of its letters — a comparator discrepancy, confirmed here.
    // Identified by brand, not exact rendered text: innerText (unlike the underlying
    // sort, which compares the raw string) collapses the tile's leading whitespace per
    // normal HTML rendering rules, live-confirmed this session.
    expect(await searchResultsPage.getTileBrand(0)).toBe(boundaryProducts.leadingSpaceName.brand);
  });

  test('TC-065: Leading-digit product name sorts before all letter-initial names under "Ascending" (discrepancy) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [boundaryProducts.normalName, boundaryProducts.leadingDigitName]);
    await searchResultsPage.reload();

    await searchResultsPage.selectSortByName('ascending');

    // Digit characters (code points 48–57) sort before all letters.
    const names = await searchResultsPage.getAllTileNames();
    expect(names[0]).toBe(boundaryProducts.leadingDigitName.name);
  });
});
