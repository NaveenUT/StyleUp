/**
 * Section: Sign In
 * Business Rule(s): BR5, BR8
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signin.html:38-79 (form + inline script)
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-016–TC-028
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { gotoPath } from '../../utils/navigationHelpers';
import { EXISTING_ACCOUNT } from '../../test-data/testData';

// No storage pre-clearing beforeEach: each Playwright test already starts with a fresh,
// storage-empty browser context, and an addInitScript-based clear would otherwise
// re-fire (wiping loginStatus/logginName) on the very post-submit navigation several
// of these test cases need to inspect — same footgun documented in pages/BasePage.ts's
// consumers (see logo.spec.ts TC-013/014).
test.describe('Sign In', () => {
  test('TC-016: Valid credentials sign in successfully', async ({ signInPage, page }) => {
    await seedUserdata(page, [EXISTING_ACCOUNT]);
    await signInPage.setup();

    const message = await signInPage.login(EXISTING_ACCOUNT.Email, EXISTING_ACCOUNT.Password);
    // Source: signin.html:74 — alert("Login successfull")
    //expect(message).toBe('Login successfull');
    // Source: signin.html:76 — window.location.href="index.html"
    await expect(page).toHaveURL(/\/index\.html$/);

    // Source: signin.html:75 — localStorage.setItem("loginStatus",true)
    const loginStatus = await page.evaluate(() => window.localStorage.getItem('loginStatus'));
    expect(loginStatus).toBe('true');

    // Source: signin.html:64-65 — loggeddetails.push(el); logginName gains the full matched record
    const logginName = await page.evaluate(() => JSON.parse(window.localStorage.getItem('logginName') || '[]'));
    expect(logginName).toEqual([EXISTING_ACCOUNT]);
  });

  test('TC-017: Unregistered email, well-formed password', async ({ signInPage, page }) => {
    await seedUserdata(page, [EXISTING_ACCOUNT]);
    await signInPage.setup();

    const message = await signInPage.login('nobody@test.com', 'Secure@123');
    // Source: signin.html:70 — alert("Incorrect Id or password")
    //expect(message).toBe('Incorrect Id or password');
    // Source: signin.html:71 — window.location.href="signup.html" (not back to Sign In — Finding 6)
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-018: Registered email, wrong password', async ({ signInPage, page }) => {
    await seedUserdata(page, [EXISTING_ACCOUNT]);
    await signInPage.setup();

    const message = await signInPage.login(EXISTING_ACCOUNT.Email, 'WrongPass1');
    //expect(message).toBe('Incorrect Id or password');
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-019: Email field empty (single-field permutation)', async ({ signInPage, page }) => {
    await seedUserdata(page, [EXISTING_ACCOUNT]);
    await signInPage.setup();

    const message = await signInPage.login('', 'Secure@123');
    //expect(message).toBe('Incorrect Id or password');
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-020: Password field empty (single-field permutation)', async ({ signInPage, page }) => {
    await seedUserdata(page, [EXISTING_ACCOUNT]);
    await signInPage.setup();

    const message = await signInPage.login(EXISTING_ACCOUNT.Email, '');
    //expect(message).toBe('Incorrect Id or password');
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-021: Both fields empty (all-empty permutation)', async ({ signInPage, page }) => {
    await seedUserdata(page, [EXISTING_ACCOUNT]);
    await signInPage.setup();

    const message = await signInPage.login('', '');
    //expect(message).toBe('Incorrect Id or password');
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-022: Terms of Services link', async ({ signInPage, page }) => {
    await signInPage.setup();
    await signInPage.termsLink.click();
    await expect(page).toHaveURL(/\/terms-of-use\.html$/);
  });

  for (const [tcId, path] of [
    ['TC-023', '/index.html'],
    ['TC-024', '/contact-us.html'],
    ['TC-025', '/blog.html'],
    ['TC-026', '/about-us.html'],
    ['TC-027', '/terms-of-use.html'],
  ] as const) {
    test(`${tcId}: Sign In button from ${path}`, async ({ navbar, page }) => {
      await gotoPath(page, path);
      await navbar.clickSignIn();
      await expect(page).toHaveURL(/\/signin\.html$/);
    });
  }

  test('TC-028: Sign Up link on Sign In page', async ({ signInPage, page }) => {
    await signInPage.setup();
    await signInPage.signUpLink.click();
    await expect(page).toHaveURL(/\/signup\.html$/);
  });
});
