/**
 * Section: Compatibility
 * Test Case IDs covered: TC-097, TC-098
 * Business Rule(s): BR7
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 * Engine mapping (see playwright.config.ts): chromium≈Chrome/Edge, firefox, webkit≈Safari.
 * "Incognito" is inherent — every Playwright test starts with a fresh, isolated context.
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedUserdata, seedLoginStatus } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount } from '../../test-data/testData';

test.describe('Compatibility', () => {
  test('TC-097: Filter, sort, and Add to Cart interaction paths behave identically across environments @styleup @regression @smoke', async ({ page, searchResultsPage, browserName }) => {
    await seedSearchData(page, [defaultResultSet[0], defaultResultSet[1]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    await test.step('One filter', () => searchResultsPage.checkGender(defaultResultSet[0].gender as 'Boys' | 'Girls'));
    await test.step('One sort', () => searchResultsPage.selectSortByPrice('ascending'));
    const message = await test.step('One add-to-cart', () => searchResultsPage.addToCartByIndex(0));

    expect(message).toContain('Added to Cart');
    test.info().annotations.push({ type: 'engine', description: browserName });
  });

  test('TC-098: Native <select> and checkbox rendering is consistent across environments @styleup @regression', async ({ page, searchResultsPage, browserName }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    const tags = await page.evaluate(() => ({
      sortPrice: document.getElementById('sort_price')?.tagName,
      genderCheckbox: document.querySelector('#gender input')?.tagName,
      genderCheckboxType: (document.querySelector('#gender input') as HTMLInputElement)?.type,
    }));

    expect(tags.sortPrice).toBe('SELECT');
    expect(tags.genderCheckbox).toBe('INPUT');
    expect(tags.genderCheckboxType).toBe('checkbox');
    test.info().annotations.push({ type: 'engine', description: browserName });
  });
});
