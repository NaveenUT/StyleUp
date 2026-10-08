/**
 * Section: Usability
 * Test Case IDs covered: TC-094, TC-095, TC-096
 * Business Rule(s): Unmapped (no stating rule for Usability, per the register's own text)
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

test.describe('Usability', () => {
  test('TC-094: Zero-results state does not suggest a next action (objective finding) @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, []);
    await test.step('Load the page with searchData: []', () => searchResultsPage.reload());

    expect(await searchResultsPage.getTotalItemsCount()).toBe('0');
    const combined = (await searchResultsPage.getFilterAndListingText()).toLowerCase();
    expect(combined).not.toContain('clear filter');
    expect(combined).not.toContain('browse categories');
    expect(combined).not.toContain('try again');
  });

  test('TC-095: No single action exists to clear all active filters at once (objective finding) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Check one box in each of GENDER, CATEGORIES, and Discount', async () => {
      await searchResultsPage.checkGender('Boys');
      await searchResultsPage.checkCategory('Shoes');
      await searchResultsPage.checkDiscount('10');
    });

    const pageText = (await searchResultsPage.getFilterAndListingText()).toLowerCase();
    expect(pageText).not.toContain('clear all');
    expect(pageText).not.toContain('reset filters');
  });

  test('TC-096: Selected sort option remains visibly selected after the listing re-renders (compliant) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Select "Low to High"', () => searchResultsPage.selectSortByPrice('ascending'));

    expect(await searchResultsPage.getSortByPriceSelectedValue()).toBe('ascending');
  });
});
