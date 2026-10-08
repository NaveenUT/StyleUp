/**
 * Section: Accessibility — Forms & Labels (WCAG 1.3.1, 4.1.2)
 * Test Case IDs covered: TC-112, TC-113, TC-114
 * Business Rule(s): BR16(b)
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.html grepped for <label/aria-/role=, zero matches (Finding 13)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';



test.describe('Accessibility — Forms & Labels', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
  });

  test('TC-112: Filter checkboxes have no programmatically associated label (defect) @styleup @regression @smoke', async ({ searchResultsPage }) => {
    const anyCheckbox = searchResultsPage.genderCheckboxLocator('Boys');
    // Expected to FAIL: no <label> exists anywhere in search.html (Finding 13) — each
    // checkbox is followed only by a plain <span>; it has no id, so no <label for> could
    // reference it even in principle.
    expect(await anyCheckbox.getAttribute('id')).toBeNull();
    expect(await anyCheckbox.getAttribute('aria-label')).toBeNull();
    expect(await searchResultsPage.labelCount()).toBe(0);
  });

  test('TC-113: Sort dropdowns\' accessible name is unstable, changing after selection (defect) @styleup @regression', async ({ searchResultsPage }) => {
    const before = await test.step('Note the name before any selection', () => searchResultsPage.getSortByPriceAccessibleName());
    expect(before).toBe('Sort by Price');

    await test.step('Select "Low to High"', () => searchResultsPage.selectSortByPrice('ascending'));

    const after = await searchResultsPage.getSortByPriceAccessibleName();
    // The descriptive name is lost once a selection is made — there is no separate
    // <label>/aria-label, only the currently selected <option> text (Finding 13).
    expect(after).toBe('Low to High');
    expect(after).not.toBe(before);
  });

  test('TC-114: All Add to Cart buttons share one identical accessible name (defect) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0], defaultResultSet[1]]);
    await searchResultsPage.reload();

    const name0 = await searchResultsPage.addToCartButtonLocator(0).innerText();
    const name1 = await searchResultsPage.addToCartButtonLocator(1).innerText();
    // Both announce identically as "Add to Cart" with no product-distinguishing text —
    // a screen-reader user cannot tell which button adds which product (Finding 12).
    expect(name0).toBe('Add to Cart');
    expect(name1).toBe('Add to Cart');
    expect(name0).toBe(name1);
  });
});
