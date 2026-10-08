/**
 * Section: Authenticated User Flows
 * Business Rule(s): BR1, BR2, BR9
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: navbar.js:1,16-18,52-55,63-84
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-066–TC-067
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata, seedLoginStatus, seedNow } from '../../utils/storageHelpers';
import { assertNoDialogFires } from '../../utils/waitHelpers';
import { makeAccount } from '../../test-data/testData';

const ACCOUNT = makeAccount('Auth Flow Tester', { Email: 'auth.flow@test.com', Password: 'Auth@1234' });

test.describe('Authenticated User Flows', () => {
  test('TC-066: Session persists across multiple gated navigations', async ({ homePage, page }) => {
    await seedUserdata(page, [ACCOUNT]);
    await seedLoginStatus(page, true);
    await homePage.setup();

    for (const [name, urlPattern] of [
      ['MEN', /\/mens\.html$/],
      ['WOMEN', /\/womens\.html$/],
      ['KIDS', /\/kids\.html$/],
    ] as const) {
      const dialogFired = assertNoDialogFires(page);
      await homePage.navbar.clickCategory(name);
      await expect(page).toHaveURL(urlPattern);
      expect(dialogFired()).toBe(false);
      await homePage.setup();
    }
  });

  test('TC-067: Logout returns to guest home state', async ({ homePage, page }) => {
    await homePage.setup();
    await seedNow(page, { userdata: [ACCOUNT], loginStatus: true });
    await homePage.reload();
    await expect(homePage.navbar.logOutButton).toBeVisible();

    // Source: navbar.js:52-55 — logout() sets loginStatus=false, reload()
    await homePage.navbar.logOut();
    const loginStatus = await page.evaluate(() => window.localStorage.getItem('loginStatus'));
    expect(loginStatus).toBe('false');
    await expect(homePage.navbar.guestSignInButton).toBeVisible();
  });
});
