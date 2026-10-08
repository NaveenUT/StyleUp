/**
 * Section: Accessibility — Images & Alt Text (WCAG 1.1.1)
 * Test Case IDs covered: TC-115, TC-116
 * Business Rule(s): BR16(c)
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

test.describe('Accessibility — Images & Alt Text', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();
  });

  test('TC-115: Product tile images have no alt text at all (defect) @styleup @regression @smoke', async ({ searchResultsPage }) => {
    // No alt attribute is set anywhere in appendData() (Finding 12) — a screen-reader
    // user hears nothing describing the product image.
    expect(await searchResultsPage.getTileImageAlt(0)).toBeNull();
  });

  test('TC-116: Logo alt-text is present and correct on this page (compliant) @styleup @regression', async ({ searchResultsPage }) => {
    expect(await searchResultsPage.logo.getAttribute('alt')).toBe('logo');
  });
});
