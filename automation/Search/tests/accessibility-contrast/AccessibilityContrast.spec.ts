/**
 * Section: Accessibility — Contrast (WCAG 1.4.3)
 * Test Case IDs covered: TC-117, TC-118
 * Business Rule(s): BR16(d)
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) + live computed-style measurement
 *
 * Live-measured values this session (relative-luminance formula, computed styles
 * against effective backgrounds): filter label 21:1, sort dropdown 21:1, product name
 * 21:1, breadcrumb 21:1, footer 20.27:1 — all PASS. Add to Cart button 3.51:1 and Total
 * Items count 4.00:1 — both FAIL the 4.5:1 normal-text floor, newly confirmed defects
 * per the register's own "Record any element below 4.5:1... as a FAIL" instruction.
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { contrastRatio } from '../../utils/accessibilityHelpers';
import { defaultResultSet } from '../../test-data/testData';

const MIN_NORMAL_TEXT_RATIO = 4.5;

test.describe('Accessibility — Contrast', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();
  });

  test('TC-117: Filter/sort/product-listing area text contrast (WCAG 1.4.3) @styleup @regression @smoke', async ({ searchResultsPage }) => {
    await test.step('Measure contrast of a filter label (compliant, 21:1)', async () => {
      const ratio = await contrastRatio(searchResultsPage.filterSpanFor(searchResultsPage.genderCheckboxLocator('Boys')));
      expect(ratio).toBeGreaterThanOrEqual(MIN_NORMAL_TEXT_RATIO);
    });
    await test.step('Measure contrast of the sort dropdown text (compliant, 21:1)', async () => {
      const ratio = await contrastRatio(searchResultsPage.sortByPriceSelectLocator);
      expect(ratio).toBeGreaterThanOrEqual(MIN_NORMAL_TEXT_RATIO);
    });
    await test.step('Measure contrast of the product name/price (compliant, 21:1)', async () => {
      const ratio = await contrastRatio(searchResultsPage.tileNameLocator(0));
      expect(ratio).toBeGreaterThanOrEqual(MIN_NORMAL_TEXT_RATIO);
    });
    await test.step('Measure contrast of the Add to Cart button (FAIL — defect, 3.51:1)', async () => {
      // Record actual behavior — expected to FAIL, log as a defect: white text on this
      // button's background measures 3.51:1, below the 4.5:1 normal-text floor.
      const ratio = await contrastRatio(searchResultsPage.addToCartButtonLocator(0));
      expect(ratio).toBeGreaterThanOrEqual(MIN_NORMAL_TEXT_RATIO);
    });
  });

  test('TC-118: Breadcrumb, Total Items count, and Footer text contrast (WCAG 1.4.3) @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Measure contrast of the breadcrumb (compliant, 21:1)', async () => {
      const ratio = await contrastRatio(searchResultsPage.breadcrumbLocator);
      expect(ratio).toBeGreaterThanOrEqual(MIN_NORMAL_TEXT_RATIO);
    });
    await test.step('Measure contrast of the Total Items count (FAIL — defect, 4.00:1)', async () => {
      // Record actual behavior — expected to FAIL, log as a defect: measures 4.00:1,
      // just below the 4.5:1 normal-text floor.
      const ratio = await contrastRatio(searchResultsPage.itemCountLabel);
      expect(ratio).toBeGreaterThanOrEqual(MIN_NORMAL_TEXT_RATIO);
    });
    await test.step('Measure contrast of the footer (compliant, 20.27:1)', async () => {
      const ratio = await contrastRatio(searchResultsPage.footerTable);
      expect(ratio).toBeGreaterThanOrEqual(MIN_NORMAL_TEXT_RATIO);
    });
  });
});
