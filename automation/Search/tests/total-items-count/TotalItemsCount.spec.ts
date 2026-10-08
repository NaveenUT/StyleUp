/**
 * Section: Total Items Count
 * Test Case IDs covered: TC-003, TC-004, TC-005, TC-006
 * Business Rule(s): BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet, searchTerms } from '../../test-data/testData';

test.describe('Total Items Count', () => {
  test('TC-003: Count matches rendered tiles on initial load @styleup @regression @smoke', async ({ page, homePage }) => {
    let resultsPage;
    await test.step('Search "Shoes" from index.html', async () => {
      ({ resultsPage } = await homePage.searchAndGoToResults(searchTerms.shoes));
    });

    const [tileCount, label] = await test.step('Count the rendered product tiles and read the Total items number', async () => {
      return [await resultsPage!.getTileCount(), await resultsPage!.getTotalItemsCount()];
    });

    expect(label).toBe(String(tileCount));
  });

  test('TC-004: Count updates correctly after a filter @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Check the "Shoes" CATEGORIES box', async () => {
      await searchResultsPage.checkCategory('Shoes');
    });

    const tileCount = await test.step('Count the newly rendered tiles', () => searchResultsPage.getTileCount());
    const label = await test.step('Read the count label', () => searchResultsPage.getTotalItemsCount());

    expect(label).toBe(String(tileCount));
    expect(tileCount).toBe(2); // defaultResultSet: exactly 2 Shoes items
  });

  test('TC-005: Count updates correctly after a sort @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
    const before = await searchResultsPage.getTileCount();

    await test.step('Select "Low to High" on Sort by Price', async () => {
      await searchResultsPage.selectSortByPrice('ascending');
    });

    const label = await test.step('Compare the count label to the (unchanged) number of rendered tiles', () => searchResultsPage.getTotalItemsCount());
    expect(label).toBe(String(before));
  });

  test('TC-006: Count updates correctly after a Brand selection @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Select "Nike" on Sort by Brand', async () => {
      await searchResultsPage.selectSortByBrand('Nike');
    });

    const tileCount = await test.step('Compare the count label to the rendered tile count', () => searchResultsPage.getTileCount());
    const label = await searchResultsPage.getTotalItemsCount();
    expect(label).toBe(String(tileCount));
    expect(tileCount).toBe(1); // defaultResultSet: exactly 1 Nike item
  });
});
