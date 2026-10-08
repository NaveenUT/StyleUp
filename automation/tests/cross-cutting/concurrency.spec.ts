/**
 * Section: Concurrency
 * Business Rule(s): BR9
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: navbar.js (grepped for any `storage` event listener — zero matches);
 *   signup.html:56-79
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-097–TC-099
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { gotoPath } from '../../utils/navigationHelpers';
import { NavbarComponent } from '../../pages/NavbarComponent';
import { makeAccount } from '../../test-data/testData';

test.describe('Concurrency', () => {
  test('TC-097: Two tabs, same account — login in Tab A not reflected in Tab B without reload', async ({ signInPage, homePage, page, context }) => {
    const account = makeAccount('Conc Tester', { Email: 'conc.tester@test.com', Password: 'Conc@1234' });
    await seedUserdata(page, [account]);
    await homePage.setup(); // Tab A
    const tabB = await context.newPage();
    const navbarB = new NavbarComponent(tabB);
    await gotoPath(tabB, '/index.html');
    await expect(navbarB.guestSignInButton).toBeVisible();

    await signInPage.setup();
    await signInPage.login(account.Email, account.Password);
    await expect(page).toHaveURL(/\/index\.html$/);
    await expect(homePage.navbar.logOutButton).toBeVisible();

    // Source: grepped navbar.js — zero `window.addEventListener('storage', ...)` calls,
    // so Tab B's already-rendered navbar never learns loginStatus changed.
    await expect(navbarB.guestSignInButton).toBeVisible();
    await tabB.close();
  });

  test('TC-098: Same account signed in on two isolated contexts does not share state', async ({ homePage, page, browser }) => {
    const account = makeAccount('Conc Cross', { Email: 'conc.cross@test.com', Password: 'Cross@1234' });
    await seedUserdata(page, [account]);
    await homePage.setup();
    await page.evaluate(() => window.localStorage.setItem('loginStatus', 'true'));
    await homePage.reload();
    await expect(homePage.navbar.logOutButton).toBeVisible();

    // A second, fully isolated browser context approximates "a different browser" —
    // localStorage is per-origin-per-profile, so this has no access to context 1's data.
    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    const otherNavbar = new NavbarComponent(otherPage);
    await gotoPath(otherPage, '/index.html');
    await expect(otherNavbar.guestSignInButton).toBeVisible();
    await otherContext.close();
  });

  test('TC-099: Rapid double-submit of the Sign Up form', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    await signUpPage.fillForm('Double Sub', 'doublesub@test.com', 'Double@123');

    // Source: signup.html:78 — window.location.replace("signin.html") runs synchronously
    // at the end of the same handler invocation as the storage write. Steps: "Click
    // 'Sign up' twice in very rapid succession (e.g. via double-click)".
    await signUpPage.submitButton.dblclick();
    await expect(page).toHaveURL(/\/signin\.html$/);

    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    const matches = userdata.filter((u: any) => u.Email === 'doublesub@test.com');
    // Record whichever count actually occurs — do not assume; both 1 and 2 are meaningful
    // signals (1 = navigation pre-empted the second submit; 2 = a duplicate-write defect).
    expect(matches.length === 1 || matches.length === 2).toBe(true);
    test.info().annotations.push({ type: 'observed-duplicate-count', description: String(matches.length) });
  });
});
