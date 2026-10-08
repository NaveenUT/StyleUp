/**
 * Section: Decision Tables
 * Business Rule(s): BR5, BR6, BR7
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source) + Mode B (live, this session — navbar branch)
 * Source files analysed: signup.html:66-79; signin.html:57-77; navbar.js:1-51
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-081–TC-087
 * Decision tables referenced: Table 1 (Sign Up gate), Table 2 (Sign In gate), Table 3 (Navbar render)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { triggerAndCaptureAlert, assertNoDialogFires } from '../../utils/waitHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Decision Tables', () => {
  test('TC-081: Sign Up Table 1 row 1 — Name invalid, other fields irrelevant', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('', 'not-an-email', '1');
    // Table 1 row 1: Name fails → short-circuits before Email/Password are read at all.
    expect(message).toBe('Enter correct name');
  });

  test('TC-082: Sign Up Table 1 row 2 — Name valid, Email invalid, Password irrelevant', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('Sam', 'sam@test.org', '1');
    expect(message).toBe('Enter correct Email');
  });

  test('TC-083: Sign Up Table 1 row 3 — Name valid, Email valid, Password invalid', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('Sam', 'sam@test.com', 'short');
    expect(message).toBe('Weak Password:Enter atleast 8 character');
  });

  test('TC-084: Sign Up Table 1 row 4 — all three valid', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    await signUpPage.fillForm('Sam', 'sam.dt081@test.com', 'Sam@1234');
    const dialogFired = assertNoDialogFires(page);
    await signUpPage.submit();
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);
  });

  test('TC-085: Sign In Table 2 row 1 — Email and Password both match one record', async ({ signInPage, page }) => {
    const account = makeAccount('DT Row1', { Email: 'dtrow1@test.com', Password: 'Secure@123' });
    await seedUserdata(page, [account]);
    await signInPage.setup();
    const message = await signInPage.login(account.Email, account.Password);
    expect(message).toBe('Login successfull');
    await expect(page).toHaveURL(/\/index\.html$/);
    const logginName = await page.evaluate(() => JSON.parse(window.localStorage.getItem('logginName') || '[]'));
    expect(logginName).toEqual([account]);
  });

  test('TC-086: Sign In Table 2 row 2 — no record matches both fields together', async ({ signInPage, page }) => {
    const account = makeAccount('DT Row2', { Email: 'dtrow2@test.com', Password: 'Secure@123' });
    await seedUserdata(page, [account]);
    await signInPage.setup();
    const message = await signInPage.login(account.Email, 'WrongPassword1');
    expect(message).toBe('Incorrect Id or password');
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-087: Navbar Table 3 row 1 vs row 3 — same loginStatus=true, different page family', async ({ homePage, signInPage, page }) => {
    await homePage.setup();
    await page.evaluate(() => {
      window.localStorage.setItem('userdata', JSON.stringify([{ name: 'Nav Tester', Email: 'nav@test.com', Password: 'Nav@1234' }]));
      window.localStorage.setItem('loginStatus', 'true');
    });
    await homePage.reload();
    // Table 3 row 1: index.html (navbar.js page) shows the dynamic authenticated navbar
    await expect(homePage.navbar.logOutButton).toBeVisible();

    await signInPage.setup();
    // Table 3 row 3 (defect): signin.html shows the static guest-style navbar regardless —
    // it never reads loginStatus at all (Finding 7).
    expect(await page.locator('#login_Status').count()).toBe(0);
    await expect(signInPage.signUpLink).toBeVisible();
  });
});
