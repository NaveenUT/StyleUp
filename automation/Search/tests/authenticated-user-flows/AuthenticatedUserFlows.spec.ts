/**
 * Section: Authenticated User Flows
 * Test Case IDs covered: TC-051, TC-052
 * Business Rule(s): BR3, BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedLoginStatus, seedUserdata } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount, searchTerms } from '../../test-data/testData';

test.describe('Authenticated User Flows', () => {
  test('TC-051: Cart icon reflects the correct summed quantity across multiple distinct products @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0], defaultResultSet[1]]);
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await searchResultsPage.reload();

    await test.step('Add product A, confirm icon shows "1"', async () => {
      await searchResultsPage.addToCartByIndex(0);
      await expect(searchResultsPage.cartBadge).toHaveText('1');
    });
    await test.step('Add product B, confirm icon shows "2"', async () => {
      await searchResultsPage.addToCartByIndex(1);
      await expect(searchResultsPage.cartBadge).toHaveText('2');
    });
  });

  test('TC-052: Session persists while navigating away and back to this page @styleup @regression', async ({ page, homePage }) => {
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    // Re-navigate homePage now that the seed is registered — the fixture's own initial
    // setup() ran before this test body's seeding calls, so the currently-loaded
    // index.html document does not yet reflect loginStatus=true until reloaded/re-navigated.
    await homePage.setup();
    const { resultsPage } = await homePage.searchAndGoToResults(searchTerms.boys);

    await test.step('Apply the CATEGORIES "Shoes" filter', () => resultsPage.checkCategory('Shoes'));

    await test.step('Navigate to another gated page and back, then re-search', async () => {
      await page.goto('mens.html', { waitUntil: 'domcontentloaded' });
      await expect(page).not.toHaveURL(/\/signin\.html$/); // session persists — no re-prompt

      // "back via Logo" — mens.html isn't a page class in this project's scope, so the
      // equivalent index.html re-entry is performed via HomePage.setup() rather than a
      // raw locator click on an out-of-scope page (zero-locators-in-specs rule).
      await homePage.setup();
      const { resultsPage: resultsPage2 } = await homePage.searchAndGoToResults(searchTerms.boys);
      // The filter itself is DOM/JS-only state, not stored — a fresh search legitimately
      // starts unfiltered again; this is expected, not a defect.
      expect(await resultsPage2.getTileCount()).toBeGreaterThan(0);
    });
  });
});
