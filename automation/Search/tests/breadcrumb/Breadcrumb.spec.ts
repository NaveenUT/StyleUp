/**
 * Section: Breadcrumb
 * Test Case IDs covered: TC-001, TC-002
 * Business Rule(s): BR8
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — see pages/SearchResultsPage.ts
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { boundaryProducts } from '../../test-data/testData';

test.describe('Breadcrumb', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [boundaryProducts.atTwentyPercent]);
    await searchResultsPage.reload();
  });

  test('TC-001: "Home" breadcrumb segment does not navigate (defect against Section 3\'s stated behavior) @styleup @regression', async ({ page, searchResultsPage }) => {
    await test.step('Click directly on the word "Home" within the breadcrumb text', async () => {
      await searchResultsPage.clickBreadcrumbHomeSegment();
    });

    // Defect: search.html:49 is one plain text node with no <a>/onclick anywhere — clicking
    // it produces no navigation at all (Finding 10), contradicting Section 3's stated behavior.
    await expect(page).toHaveURL(/\/search\.html$/);
  });

  test('TC-002: "Search Store" segment is correctly static @styleup @regression', async ({ page, searchResultsPage }) => {
    await test.step('Click "Search Store"', async () => {
      await searchResultsPage.clickBreadcrumbSearchStoreSegment();
    });

    await expect(page).toHaveURL(/\/search\.html$/);
  });
});
