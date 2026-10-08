/**
 * Section: State Transitions
 * Business Rule(s): BR2, BR3, BR9
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signin.html:52-78; navbar.js:1-90; mens.js:170-197; cart.html:139-144
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-088–TC-092
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata, seedNow } from '../../utils/storageHelpers';
import { triggerAndCaptureAlert } from '../../utils/waitHelpers';
import { makeAccount } from '../../test-data/testData';

const ACCOUNT = makeAccount('State Tester', { Email: 'state.tester@test.com', Password: 'State@1234' });

test.describe('State Transitions', () => {
  test('TC-088: Guest → Authenticated, on valid sign-in', async ({ signInPage, homePage, page }) => {
    await seedUserdata(page, [ACCOUNT]);
    await signInPage.setup();
    await signInPage.login(ACCOUNT.Email, ACCOUNT.Password);
    await expect(page).toHaveURL(/\/index\.html$/);
    const loginStatus = await page.evaluate(() => window.localStorage.getItem('loginStatus'));
    expect(loginStatus).toBe('true');
    // Source: navbar.js:1,4-35 — navbar re-executes on this fresh document load and
    // reads the now-true loginStatus, switching to the authenticated branch.
    await expect(homePage.navbar.logOutButton).toBeVisible();
  });

  test('TC-089: Authenticated → Guest, on logout', async ({ homePage, page }) => {
    await homePage.setup();
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT] });
    await homePage.reload();
    await expect(homePage.navbar.logOutButton).toBeVisible();

    await homePage.navbar.logOut();
    const loginStatus = await page.evaluate(() => window.localStorage.getItem('loginStatus'));
    expect(loginStatus).toBe('false');
    await expect(homePage.navbar.guestSignInButton).toBeVisible();
  });

  test('TC-090: Re-entry into the Authenticated state (already-authenticated user reloads)', async ({ homePage, page }) => {
    await homePage.setup();
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT], logginName: [] });
    await homePage.reload();
    await expect(homePage.navbar.logOutButton).toBeVisible();

    await homePage.reload();
    // Remains authenticated; no re-prompt (no dialog); no duplicate session artifact —
    // a plain reload never calls signin.html's myfunction(), so logginName is untouched.
    await expect(homePage.navbar.logOutButton).toBeVisible();
    const logginName = await page.evaluate(() => JSON.parse(window.localStorage.getItem('logginName') || '[]'));
    expect(logginName).toEqual([]);
  });

  test('TC-091: Cart 0 → n → 0', async ({ homePage, mensPage, cartPage, page }) => {
    await homePage.setup();
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT], cartData: [] });
    await mensPage.setup();
    await expect(mensPage.navbar.cartBadge).toHaveText('0');

    await triggerAndCaptureAlert(page, () => mensPage.addToCart(0));
    await expect(mensPage.navbar.cartBadge).toHaveText('1');

    await cartPage.setup();
    await cartPage.removeItem(0);
    await homePage.setup();
    await expect(homePage.navbar.cartBadge).toHaveText('0');
    const cartData = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cartData') || '[]'));
    expect(cartData).toEqual([]);
  });

  test('TC-092: Invalid transition attempt — Guest tries to reach an Authenticated-only state directly', async ({ mensPage, page }) => {
    let dialogMessage: string | null = null;
    page.once('dialog', (d) => { dialogMessage = d.message(); void d.accept(); });
    await mensPage.setup();

    // ⚠ SOURCE DISCREPANCY
    // Phase 1 expects: verifyLogin()'s guest branch redirects to signin.html with an
    // alert, blocking this transition (contrast with TC-065's stated exception).
    // Source shows: verifyLogin() (navbar.js:63-84) is bound ONLY to click events on
    // the top-menu's #products_page divs (navbar.js:59-62) — there is no page-load-time
    // guard anywhere in mens.html/mens.js. A direct URL navigation never calls
    // verifyLogin() at all, so no alert fires and the page loads fully unauthenticated —
    // this is the SAME fact TC-064 in guest-flows.spec.ts already establishes as a
    // defect, directly contradicting this test case's own Phase 1 framing. Assertion
    // below follows Phase 1 (expects the alert/redirect) and is EXPECTED TO FAIL against
    // current source — raised for triage before merge, not weakened.
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogMessage).toBe('Please Login First');
  });
});
