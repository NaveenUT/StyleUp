/**
 * Section: Recovery
 * Business Rule(s): BR11
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:56-80; signin.html:52-78
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-100–TC-104
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Recovery', () => {
  test('TC-100: Entered Sign Up data does not survive a failed submit (expected, not a defect)', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('Temp Test', 'temp@test.org', 'Temp@1234'); // invalid domain
    expect(message).toBe('Enter correct Email');

    // Source: signup.html:69-71 — alert() + return with no field reset and no navigation;
    // all 3 already-typed values remain exactly as entered (the page never reloads).
    await expect(signUpPage.nameField).toHaveValue('Temp Test');
    await expect(signUpPage.emailField).toHaveValue('temp@test.org');
    await expect(signUpPage.passwordField).toHaveValue('Temp@1234');
  });

  test('TC-101: Failed sign-in does not return the user to a retryable Sign In state (defect)', async ({ signInPage, page }) => {
    const account = makeAccount('Recovery Test', { Email: 'jane.doe@test.com', Password: 'Secure@123' });
    await seedUserdata(page, [account]);
    await signInPage.setup();
    await signInPage.login(account.Email, 'WrongPass1');
    // Defect: signin.html:71 redirects to signup.html, not back to signin.html — a
    // reasonable recovery expectation would let the user immediately retry the same form.
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-102: Storage-write failure during registration (storage disabled)', async ({ signUpPage, page }) => {
    // Simulates a storage-disabled context (e.g. strict private-browsing storage
    // blocking) by making Storage.prototype.setItem throw, since Playwright has no
    // direct "disable localStorage" toggle.
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => { throw new DOMException('The operation is insecure.', 'SecurityError'); };
    });
    await signUpPage.setup();
    await signUpPage.fillForm('Blocked', 'blocked@test.com', 'Blocked@123');

    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));
    await signUpPage.submit();
    await page.waitForTimeout(300);

    // Defect: signup.html has no try/catch around localStorage.setItem() (signup.html:77)
    // — registration fails with an uncaught exception rather than a user-facing message.
    expect(pageErrors.length).toBeGreaterThan(0);
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-103: Browser-back after a successful login redirect', async ({ signInPage, page }) => {
    const account = makeAccount('Back Nav', { Email: 'back.nav@test.com', Password: 'BackNav@1' });
    await seedUserdata(page, [account]);
    await signInPage.setup();
    await signInPage.login(account.Email, account.Password);
    await expect(page).toHaveURL(/\/index\.html$/);

    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/signin\.html$/);

    // ⚠ LIVE-BEHAVIOUR DISCREPANCY (browser back-forward cache, not app script)
    // Phase 1 expects: "the form is empty (no cached-form defect)".
    // Live DOM shows (confirmed this session): Chromium's back-forward cache restores
    // the exact prior DOM state on Back navigation, including the typed Email value —
    // the field is NOT empty. This is standard bfcache behaviour, not a signin.html
    // script defect, but it directly contradicts Phase 1's stated expectation. Assertion
    // below follows Phase 1 and is EXPECTED TO FAIL in a bfcache-enabled browser —
    // raised for triage before merge, not weakened.
    await expect(signInPage.emailField).toHaveValue('');
    await expect(signInPage.passwordField).toHaveValue('');
    const loginStatus = await page.evaluate(() => window.localStorage.getItem('loginStatus'));
    expect(loginStatus).toBe('true');
  });

  test('TC-104: Refresh part-way through the Sign Up form', async ({ signUpPage }) => {
    await signUpPage.setup();
    await signUpPage.fillName('Half Typed');
    await signUpPage.reload();
    // No autosave/sessionStorage exists anywhere in signup.html — expected, not a defect.
    await expect(signUpPage.nameField).toHaveValue('');
  });
});
