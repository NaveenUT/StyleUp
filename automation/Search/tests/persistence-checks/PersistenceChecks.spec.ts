/**
 * Section: Persistence Checks (Logo, Cart Icon & Footer)
 * Test Case IDs covered: TC-045, TC-046, TC-047
 * Business Rule(s): BR7, BR8
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedLoginStatus, seedUserdata } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount } from '../../test-data/testData';

test.describe('Persistence Checks (Logo, Cart Icon & Footer)', () => {
  test('TC-045: Logo renders and functions identically on this page as on the homepage @styleup @regression', async ({ page, homePage, searchResultsPage }) => {
    await test.step('Guest state — Logo on index.html', async () => {
      await homePage.setup();
      await expect(homePage.logo).toBeVisible();
      await homePage.clickLogo();
      await expect(page).toHaveURL(/\/index\.html$/);
    });

    await test.step('Guest state — Logo on search.html behaves the same', async () => {
      await seedSearchData(page, [defaultResultSet[0]]);
      await searchResultsPage.setup();
      await expect(searchResultsPage.logo).toBeVisible();
      await searchResultsPage.logo.click();
      await expect(page).toHaveURL(/\/index\.html$/);
    });

    await test.step('Authenticated state — repeat the comparison on both pages', async () => {
      await seedUserdata(page, [existingAccount]);
      await seedLoginStatus(page, true);

      await homePage.setup();
      await expect(homePage.logo).toBeVisible();
      await homePage.clickLogo();
      await expect(page).toHaveURL(/\/index\.html$/);

      await searchResultsPage.setup();
      await expect(searchResultsPage.logo).toBeVisible();
      await searchResultsPage.logo.click();
      await expect(page).toHaveURL(/\/index\.html$/);
    });
  });

  test('TC-046: Cart icon appears only when authenticated, on this page specifically @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);

    await test.step('As a guest, load search.html; confirm no Cart icon', async () => {
      await searchResultsPage.setup();
      expect(await searchResultsPage.isCartIconVisible()).toBe(false);
    });

    await test.step('Sign in; reload search.html; confirm Cart icon now appears', async () => {
      await seedUserdata(page, [existingAccount]);
      await seedLoginStatus(page, true);
      await searchResultsPage.reload();
      expect(await searchResultsPage.isCartIconVisible()).toBe(true);
    });
  });

  test('TC-047: Footer renders identically on this page as established for the homepage @styleup @regression', async ({ page, homePage, searchResultsPage }) => {
    await test.step('Compare footer content on search.html vs index.html', async () => {
      await homePage.setup();
      const homeFooter = await homePage.getFooterText();

      await seedSearchData(page, [defaultResultSet[0]]);
      await searchResultsPage.reload();
      const searchFooter = (await searchResultsPage.footerTable.innerText()).trim();

      // ⚠ SOURCE DISCREPANCY
      // Phase 1 (TC-047) expects: identical content and behavior to the homepage's footer.
      // Source shows (TC-113's own Expected Result, and confirmed live here): search.html's
      // footer (search.html:130-147) has ZERO <a> tags anywhere in it (index.html's has 4
      // real links), and its 2nd Useful-Links row reads "Terms & Conditions" vs index.html's
      // "Blog" (search.html:137 vs index.html:72) — the two footers are not identical.
      // Assertion follows Phase 1 and is EXPECTED TO FAIL against current source — raised
      // for triage before merge, not weakened, per the protocol's Discrepancy Handling rule.
      expect(searchFooter).toBe(homeFooter);
    });
  });
});
