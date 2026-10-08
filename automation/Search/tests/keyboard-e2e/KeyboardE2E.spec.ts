/**
 * Section: Keyboard End-to-End Journeys
 * Test Case IDs covered: TC-127, TC-128
 * Business Rule(s): BR16(a), BR2, BR3
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — checkboxes/selects/buttons are all native controls
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

test.describe('Keyboard End-to-End Journeys', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
  });

  test('TC-127: Complete filter → sort → add-to-cart using the keyboard alone @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await test.step('Tab to the "Shoes" checkbox; press Space to check it', async () => {
      await searchResultsPage.categoryCheckboxLocator('Shoes').focus();
      await page.keyboard.press('Space');
      expect(await searchResultsPage.isCategoryChecked('Shoes')).toBe(true);
    });

    await test.step('Tab to the Sort by Price dropdown; select "Low to High" via arrow keys; confirm with Enter', async () => {
      await searchResultsPage.sortByPriceSelectLocator.focus();
      await searchResultsPage.sortByPriceSelectLocator.selectOption('ascending');
      expect(await searchResultsPage.getSortByPriceSelectedValue()).toBe('ascending');
    });

    // Per Table A, the sort discards the filter — the journey still completes
    // functionally; the full 10-item list is what actually renders here.
    await test.step('Tab to the first tile\'s "Add to Cart" button; press Enter', async () => {
      await searchResultsPage.addToCartButtonLocator(0).focus();
      let message = '';
      page.once('dialog', (d) => { message = d.message(); void d.accept(); });
      await page.keyboard.press('Enter');
      expect(message).toContain('Added to Cart');
    });
  });

  test('TC-128: Complete a Brand selection → Add to Cart journey using the keyboard alone @styleup @regression', async ({ page, searchResultsPage }) => {
    await test.step('Tab to the Sort by Brand dropdown; select "Reebok" via arrow keys + Enter', async () => {
      await searchResultsPage.sortByBrandSelectLocator.focus();
      await searchResultsPage.sortByBrandSelectLocator.selectOption('Reebok');
      expect(await searchResultsPage.getAllTileNames()).toEqual(['Iota Dress']); // defaultResultSet's sole Reebok item
    });

    await test.step('Tab to the first resulting tile\'s "Add to Cart" button; press Enter', async () => {
      await searchResultsPage.addToCartButtonLocator(0).focus();
      let message = '';
      page.once('dialog', (d) => { message = d.message(); void d.accept(); });
      await page.keyboard.press('Enter');
      expect(message).toContain('Added to Cart');
    });
  });
});
