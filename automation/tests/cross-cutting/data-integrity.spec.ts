/**
 * Section: Data Integrity
 * Business Rule(s): BR3, BR8
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:61-65,76-77; signin.html:56,64-65; mens.js:170-197
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-093–TC-096
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { triggerAndCaptureAlert, assertNoDialogFires } from '../../utils/waitHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Data Integrity', () => {
  test('TC-093: Registered record holds every field exactly as typed', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    await signUpPage.fillForm('Data Integrity Test', 'dit@test.com', 'DitPass@1');
    const dialogFired = assertNoDialogFires(page);
    await signUpPage.submit();
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);

    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata).toEqual([{ name: 'Data Integrity Test', Email: 'dit@test.com', Password: 'DitPass@1' }]);
  });

  test('TC-094: Cart count stays arithmetically consistent with underlying items', async ({ mensPage, page }) => {
    const account = makeAccount('DI Cart', { Email: 'di.cart@test.com', Password: 'DiCart@123' });
    await seedUserdata(page, [account]);
    await mensPage.setup();
    await page.evaluate(() => window.localStorage.setItem('loginStatus', 'true'));
    await mensPage.setup();

    for (let i = 0; i < 3; i++) {
      await triggerAndCaptureAlert(page, () => mensPage.addToCart(i));
      const cartData = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cartData') || '[]'));
      const totalQuantity = cartData.reduce((sum: number, item: any) => sum + item.quantity, 0);
      await expect(mensPage.navbar.cartBadge).toHaveText(String(totalQuantity));
      expect(cartData).toHaveLength(i + 1);
    }
  });

  test('TC-095: logginName accumulates a full, unbounded, plaintext-bearing record on every login (defect)', async ({ signInPage, homePage, page }) => {
    const account = makeAccount('DI Login', { Email: 'di.login@test.com', Password: 'DiLogin@1' });
    await seedUserdata(page, [account]);
    await homePage.setup();
    let logginName = await page.evaluate(() => JSON.parse(window.localStorage.getItem('logginName') || '[]'));
    expect(logginName).toHaveLength(0);

    for (let i = 0; i < 3; i++) {
      await signInPage.setup();
      await signInPage.login(account.Email, account.Password);
      await expect(page).toHaveURL(/\/index\.html$/);
      // Source: navbar.js:52-55 — Log Out is present since loginStatus is now true; use it to log out
      await homePage.navbar.logOut();
    }

    // Defect: signin.html:64-65 — logginName gains one full plaintext-password-bearing
    // record per successful login, with no dedup and no cap.
    logginName = await page.evaluate(() => JSON.parse(window.localStorage.getItem('logginName') || '[]'));
    expect(logginName).toHaveLength(3);
    for (const record of logginName) expect(record).toEqual(account);
  });

  test('TC-096: userdata is not truncated or reordered across multiple registrations', async ({ signUpPage, page }) => {
    const accounts = [
      makeAccount('Seq A', { Email: 'seq.a@test.com', Password: 'SeqA@1234' }),
      makeAccount('Seq B', { Email: 'seq.b@test.com', Password: 'SeqB@1234' }),
      makeAccount('Seq C', { Email: 'seq.c@test.com', Password: 'SeqC@1234' }),
    ];
    for (const acc of accounts) {
      await signUpPage.setup();
      await signUpPage.fillForm(acc.name, acc.Email, acc.Password);
      await signUpPage.submit();
      await expect(page).toHaveURL(/\/signin\.html$/);
    }
    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata).toEqual(accounts);
  });
});
