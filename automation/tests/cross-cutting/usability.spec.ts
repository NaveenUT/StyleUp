/**
 * Section: Usability
 * Business Rule(s): Unmapped (no stating rule for Usability, per the register's own text)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:66-79; signin.html:57-71; navbar.js:52-55
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-115–TC-118
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Usability', () => {
  test('TC-115: Each Sign Up error names its specific field (compliant)', async ({ signUpPage }) => {
    await signUpPage.setup();
    let message = await signUpPage.registerExpectingAlert('', 'irrelevant@test.com', 'Test@1234');
    expect(message.toLowerCase()).toContain('name');

    message = await signUpPage.registerExpectingAlert('Valid Name', 'invalid-email', 'Test@1234');
    expect(message.toLowerCase()).toContain('email');

    message = await signUpPage.registerExpectingAlert('Valid Name', 'valid@test.com', 'short');
    expect(message.toLowerCase()).toContain('password');
  });

  test('TC-116: Sign-in failure message does not name a specific field', async ({ signInPage, page }) => {
    const account = makeAccount('Usability', { Email: 'usability@test.com', Password: 'Usability@1' });
    await seedUserdata(page, [account]);
    await signInPage.setup();
    const message = await signInPage.login(account.Email, 'WrongPassword1');
    // Objectively verifiable: the message names BOTH "Id" and "password" jointly rather
    // than pinpointing WHICH ONE was actually wrong (here, specifically the password) —
    // less field-specific than Sign Up's errors (TC-115), each of which names exactly one
    // field tied to one specific problem. May be an intentional security trade-off
    // (cross-ref client-side-security.spec.ts TC-107) rather than a usability defect
    // in isolation.
    expect(message).toBe('Incorrect Id or password');
  });

  test('TC-117: Minimum steps to complete the Sign In journey against the UI\'s own minimum', async ({ signInPage, page }) => {
    const account = makeAccount('Min Steps', { Email: 'minsteps@test.com', Password: 'MinSteps@1' });
    await seedUserdata(page, [account]);
    await signInPage.setup();
    // 5 interactions: focus+type Email, focus+type Password, submit — the UI's own minimum.
    await signInPage.emailField.focus();
    await signInPage.fillEmail(account.Email);
    await signInPage.passwordField.focus();
    await signInPage.fillPassword(account.Password);
    await signInPage.login(account.Email, account.Password);
    await expect(page).toHaveURL(/\/index\.html$/);
  });

  test('TC-118: No destructive/irreversible action lacks confirmation (zero-case for this scope)', async ({ homePage, page }) => {
    await homePage.setup();
    await page.evaluate(() => {
      window.localStorage.setItem('userdata', JSON.stringify([{ name: 'Logout Test', Email: 'logout@test.com', Password: 'Logout@1' }]));
      window.localStorage.setItem('loginStatus', 'true');
    });
    await homePage.reload();

    let dialogFired = false;
    page.once('dialog', (d) => { dialogFired = true; void d.accept(); });
    await homePage.navbar.logOut();
    // Logout executes immediately with no confirmation dialog — reversible (the user
    // can simply sign in again), so this absence is not itself a defect.
    expect(dialogFired).toBe(false);
  });
});
