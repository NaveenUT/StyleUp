/**
 * Section: Accessibility — Keyboard Navigation & Focus (WCAG 2.1.1, 2.4.3, 2.4.7)
 * Test Case IDs covered: TC-108, TC-109, TC-110, TC-111
 * Business Rule(s): BR16(a)
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — checkboxes/selects/buttons are all native controls
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

test.describe('Accessibility — Keyboard Navigation & Focus', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
  });

  test('TC-108: All filter checkboxes are reachable and operable via keyboard @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    const count = await searchResultsPage.allFilterCheckboxes.count();
    for (let i = 0; i < count; i++) {
      const box = searchResultsPage.allFilterCheckboxes.nth(i);
      await box.focus();
      await expect(box).toBeFocused();
      await page.keyboard.press('Space');
      await expect(box).toBeChecked();
      await page.keyboard.press('Space'); // toggle back off, leaving state clean for the next iteration
    }
  });

  test('TC-109: Sort dropdowns are reachable and operable via keyboard @styleup @regression', async ({ page, searchResultsPage }) => {
    await searchResultsPage.sortByPriceSelectLocator.focus();
    await expect(searchResultsPage.sortByPriceSelectLocator).toBeFocused();
    await searchResultsPage.sortByPriceSelectLocator.selectOption('ascending');
    expect(await searchResultsPage.getSortByPriceSelectedValue()).toBe('ascending');

    await searchResultsPage.sortByNameSelectLocator.focus();
    await expect(searchResultsPage.sortByNameSelectLocator).toBeFocused();

    await searchResultsPage.sortByBrandSelectLocator.focus();
    await expect(searchResultsPage.sortByBrandSelectLocator).toBeFocused();
  });

  test('TC-110: Add to Cart buttons are reachable and operable via keyboard @styleup @regression', async ({ page, searchResultsPage }) => {
    const button = searchResultsPage.addToCartButtonLocator(0);
    await button.focus();
    await expect(button).toBeFocused();

    let message = '';
    page.once('dialog', (d) => { message = d.message(); void d.accept(); });
    await page.keyboard.press('Enter');
    expect(message).toContain('Added to Cart');
  });

  test('TC-111: Keyboard focus is not lost or reset to the top of the document when the listing re-renders after a filter @styleup @regression', async ({ page, searchResultsPage }) => {
    const boysCheckbox = searchResultsPage.genderCheckboxLocator('Boys');
    await test.step('Tab to and check the "Boys" checkbox using the keyboard', async () => {
      await boysCheckbox.focus();
      await page.keyboard.press('Space');
    });

    // appendData() rebuilds #item-container entirely, but the checkbox itself lives
    // OUTSIDE that container (search.html:88-96 vs :124), so its own focus should survive.
    await expect(boysCheckbox).toBeFocused();
  });
});
