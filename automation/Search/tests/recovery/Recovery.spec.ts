/**
 * Section: Recovery
 * Test Case IDs covered: TC-083, TC-084, TC-085, TC-086, TC-087
 * Business Rule(s): BR12, BR13
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, removeStorageKey, setStorageRaw } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

test.describe('Recovery', () => {
  test('TC-083: Active filter does not survive a page refresh @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Check "Shoes"', () => searchResultsPage.checkCategory('Shoes'));
    await test.step('Refresh the page (F5)', () => searchResultsPage.reload());

    expect(await searchResultsPage.isCategoryChecked('Shoes')).toBe(false);
    expect(await searchResultsPage.getTileCount()).toBe(defaultResultSet.length);
  });

  test('TC-084: Active sort does not survive a page refresh @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
    const originalOrder = await searchResultsPage.getAllTileNames();

    await test.step('Select "Low to High"', () => searchResultsPage.selectSortByPrice('ascending'));
    await test.step('Refresh the page', () => searchResultsPage.reload());

    expect(await searchResultsPage.getAllTileNames()).toEqual(originalOrder);
  });

  test('TC-085: Browser-back from this page returns to a usable homepage @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    await test.step('Press the browser Back button', () => searchResultsPage.goBack());

    // Whatever page preceded search.html in history (or about:blank for a page opened
    // fresh with no prior entry) — either way, no crash, no error page.
    await expect(searchResultsPage.body).toBeVisible();
  });

  test('TC-086: Page opened with searchData entirely absent @styleup @regression', async ({ page, searchResultsPage }) => {
    await searchResultsPage.reload();
    await test.step('Remove the searchData key entirely', () => removeStorageKey(page, 'searchData'));
    await test.step('Load search.html directly', () => searchResultsPage.reload());

    expect(await searchResultsPage.getTileCount()).toBe(0);
    expect(await searchResultsPage.getTotalItemsCount()).toBe('0');
  });

  test('TC-087: Page opened with a malformed searchData value @styleup @regression', async ({ page, searchResultsPage }) => {
    await searchResultsPage.reload();
    const getErrors = searchResultsPage.collectPageErrors();

    await test.step('Set localStorage.searchData to the literal string "not-json"', () => setStorageRaw(page, 'searchData', 'not-json'));
    await test.step('Load search.html', () => searchResultsPage.reload());

    // Defect: JSON.parse("not-json") (search.js:1) throws uncaught — no try/catch
    // exists, so the page fails with a Console error rather than degrading gracefully.
    expect(getErrors().length).toBeGreaterThan(0);
  });
});
