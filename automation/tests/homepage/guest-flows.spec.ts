/**
 * Section: Guest User Flows
 * Business Rule(s): BR1, BR2, BR10
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: index.html; navbar.js:1,36-51,63-84; signin.html:22-25
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-062–TC-065
 */
import { test, expect } from '../../fixtures/customFixtures';
import { gotoPath } from '../../utils/navigationHelpers';

test.describe('Guest User Flows', () => {
  test('TC-062: Guest can view home page', async ({ homePage, page }) => {
    let dialogFired = false;
    page.once('dialog', () => { dialogFired = true; });
    await homePage.setup();
    await expect(page.locator('#navbar')).toBeVisible();
    expect(dialogFired).toBe(false);
  });

  test('TC-063: Guest sees no Basket icon', async ({ homePage, navbar }) => {
    await homePage.setup();
    // Source: navbar.js:36-51 — guest branch appends only Sign In/Sign Up, no cart div
    await expect(navbar.cartIcon).toHaveCount(0);
    await expect(navbar.guestSignInButton).toBeVisible();
    await expect(navbar.guestSignUpButton).toBeVisible();
  });

  test('TC-064: Direct-URL bypass of login gate (defect)', async ({ mensPage, page }) => {
    await mensPage.setup();
    // Defect: navbar.js's verifyLogin() only guards the top-menu click handler
    // (navbar.js:59-62) — there is no page-load-time guard anywhere in mens.html/mens.js,
    // so a direct URL visit loads the full page with no login check at all.
    await expect(page.locator('#Right-section')).toBeVisible();
    await expect(page).toHaveURL(/\/mens\.html$/);
  });

  test('TC-065: Sign In/Sign Up\'s own unguarded category links (defect)', async ({ signInPage, page }) => {
    await signInPage.setup();
    // Defect: signin.html:22-25 renders MEN/WOMEN/KIDS/HOME LIVING as plain <a href>
    // anchors, not the login-gated <div> pattern navbar.js uses on other pages.
    await signInPage.categoryLink('MEN').click();
    await expect(page).toHaveURL(/\/mens\.html$/);
  });
});
