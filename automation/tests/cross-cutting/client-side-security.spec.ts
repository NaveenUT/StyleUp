/**
 * Section: Client-Side Security
 * Business Rule(s): BR10
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:56-79; signin.html:52-78; navbar.js (grepped, no el.name reference)
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-105–TC-110
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { assertNoDialogFires } from '../../utils/waitHelpers';
import { makeAccount, XSS_PAYLOAD } from '../../test-data/testData';

test.describe('Client-Side Security', () => {
  test('TC-105: Script payload in Full Name is stored raw but never rendered anywhere', async ({ signUpPage, signInPage, homePage, page }) => {
    await signUpPage.setup();
    await signUpPage.fillForm(XSS_PAYLOAD, 'xsstest@test.com', 'Test@1234');
    const dialogFired = assertNoDialogFires(page);
    await signUpPage.submit();
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);

    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata.find((u: any) => u.Email === 'xsstest@test.com')?.name).toBe(XSS_PAYLOAD);

    await signInPage.login('xsstest@test.com', 'Test@1234');
    await expect(page).toHaveURL(/\/index\.html$/);
    await expect(homePage.navbar.logOutButton).toBeVisible();
    // Source: navbar.js's authenticated branch (lines 4-35) never references el.name —
    // the payload has no rendering surface anywhere in the authenticated navbar.
    const bodyHtml = await page.evaluate(() => document.body.innerHTML);
    expect(bodyHtml).not.toContain(XSS_PAYLOAD);
  });

  test('TC-106: Password stored as plain, unencoded text in TWO separate client-storage locations (defect)', async ({ signUpPage, signInPage, page }) => {
    const account = makeAccount('Plaintext Test', { Email: 'plaintext@test.com', Password: 'Test@1234' });
    await signUpPage.setup();
    await signUpPage.fillForm(account.name, account.Email, account.Password);
    await signUpPage.submit();
    await expect(page).toHaveURL(/\/signin\.html$/);

    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata.find((u: any) => u.Email === account.Email)?.Password).toBe(account.Password);

    await signInPage.login(account.Email, account.Password);

    // Defect: both userdata (signup.html:64) and logginName (signin.html:64-65) hold the
    // literal plaintext password, with no hashing or encoding anywhere.
    const logginName = await page.evaluate(() => JSON.parse(window.localStorage.getItem('logginName') || '[]'));
    expect(logginName.find((u: any) => u.Email === account.Email)?.Password).toBe(account.Password);
  });

  test('TC-107: Sign-in failure message does not distinguish an unregistered email from a wrong password (compliant)', async ({ signInPage, page }) => {
    const account = makeAccount('NoLeak', { Email: 'noleak@test.com', Password: 'NoLeak@123' });
    await seedUserdata(page, [account]);

    await signInPage.setup();
    const caseA = await signInPage.login('unregistered@test.com', 'AnyPassword1');

    await signInPage.setup();
    const caseB = await signInPage.login(account.Email, 'WrongPassword1');

    expect(caseA).toBe('Incorrect Id or password');
    expect(caseB).toBe('Incorrect Id or password');
    expect(caseA).toBe(caseB);
  });

  test('TC-108: No lockout, delay, or throttle after repeated failed sign-in attempts', async ({ signInPage, page }) => {
    const account = makeAccount('NoThrottle', { Email: 'nothrottle@test.com', Password: 'NoThrottle@1' });
    await seedUserdata(page, [account]);

    for (let i = 0; i < 10; i++) {
      await signInPage.setup();
      const message = await signInPage.login(account.Email, 'WrongPassword1');
      // Per reasonable practice, repeated failures should eventually be throttled.
      // Record actual behaviour — expected to FAIL, log as a defect (low real-world
      // severity, no server tier to brute-force): every attempt processes identically.
      expect(message).toBe('Incorrect Id or password');
      await expect(page).toHaveURL(/\/signup\.html$/);
    }
  });

  test('TC-109: No stack trace, path, or version leaks to console on failure paths', async ({ signInPage, signUpPage, page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

    await signInPage.setup();
    await signInPage.login('nobody@test.com', 'WrongPassword1');

    await signUpPage.setup();
    await signUpPage.registerExpectingAlert('Console Test', 'not-an-email', 'Test@1234');

    // Both failure paths use alert(), producing no console output at all.
    expect(consoleErrors).toHaveLength(0);
  });

  test('TC-110: Client-side access gate is bypassable by direct URL and by an alternative link (defect)', async ({ mensPage, signInPage, page }) => {
    // Direct URL bypass (cross-referenced with guest-flows.spec.ts TC-064)
    await mensPage.setup();
    await expect(page).toHaveURL(/\/mens\.html$/);
    await expect(page.locator('#Right-section')).toBeVisible();

    // Alternative-link bypass via Sign In's own unguarded category link (TC-065)
    await signInPage.setup();
    await signInPage.categoryLink('MEN').click();
    await expect(page).toHaveURL(/\/mens\.html$/);
  });
});
