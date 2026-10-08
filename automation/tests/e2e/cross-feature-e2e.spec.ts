/**
 * Section: Cross-Feature End-to-End Journeys
 * Business Rule(s): BR1,BR2,BR3,BR4,BR5,BR6,BR8,BR9,BR11
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source) + Mode B (live, this session — navbar branch)
 * Source files analysed: navbar.js; signin.html; signup.html; womens.js; search-algo.js;
 *   home&living.js; index.html (footer)
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-148–TC-152
 */
import { test, expect } from '../../fixtures/customFixtures';
import { triggerAndCaptureAlert, assertNoDialogFires } from '../../utils/waitHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Cross-Feature End-to-End Journeys', () => {
  test('TC-148: New account → login → gated category access, persisted-state assertion', async ({ homePage, signUpPage, signInPage, page }) => {
    const account = makeAccount('Nina Test', { Email: 'nina.test@test.com', Password: 'Nina@1234' });

    // Step 1: blocked from MEN as guest
    await homePage.setup();
    const blockedMessage = await triggerAndCaptureAlert(page, () => homePage.navbar.clickCategory('MEN'));
    expect(blockedMessage).toBe('Please Login First');
    await expect(page).toHaveURL(/\/signin\.html$/);

    // Step 2: sign up
    await signUpPage.setup();
    await signUpPage.fillForm(account.name, account.Email, account.Password);
    const signupDialogFired = assertNoDialogFires(page);
    await signUpPage.submit();
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(signupDialogFired()).toBe(false);

    // Step 3: sign in
    const loginMessage = await signInPage.login(account.Email, account.Password);
    expect(loginMessage).toBe('Login successfull');
    await expect(page).toHaveURL(/\/index\.html$/);

    // Step 4: access MEN
    const noDialog = assertNoDialogFires(page);
    await homePage.navbar.clickCategory('MEN');
    await expect(page).toHaveURL(/\/mens\.html$/);
    expect(noDialog()).toBe(false);

    // Step 5: persisted-state assertion
    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata).toEqual([account]);
    const loginStatus = await page.evaluate(() => window.localStorage.getItem('loginStatus'));
    expect(loginStatus).toBe('true');
  });

  test('TC-149: Basket lifecycle across add/remove/logout, persisted-state assertion', async ({ homePage, womensPage, cartPage, page }) => {
    const account = makeAccount('Basket Journey', { Email: 'basket.journey@test.com', Password: 'Basket@123' });
    await homePage.setup();
    await page.evaluate((acc) => {
      window.localStorage.setItem('userdata', JSON.stringify([acc]));
      window.localStorage.setItem('loginStatus', 'true');
      window.localStorage.setItem('cartData', '[]');
    }, account);
    await womensPage.setup();

    await triggerAndCaptureAlert(page, () => womensPage.addToCart(0));
    await expect(womensPage.navbar.cartBadge).toHaveText('1');
    await triggerAndCaptureAlert(page, () => womensPage.addToCart(1));
    await expect(womensPage.navbar.cartBadge).toHaveText('2');

    await cartPage.setup();
    await cartPage.removeItem(0);
    await homePage.setup();
    await expect(homePage.navbar.cartBadge).toHaveText('1');

    await homePage.navbar.logOut();
    // Persisted-state assertion: cartData survives logout with exactly 1 entry.
    const cartData = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cartData') || '[]'));
    expect(cartData).toHaveLength(1);
  });

  test('TC-150: Guest search then still-gated category', async ({ homePage, page }) => {
    await homePage.setup();
    const searchMessage = await triggerAndCaptureAlert(page, () => homePage.navbar.search('Shoes'));
    expect(searchMessage).toMatch(/^\d+ no\. of products found$/);
    await expect(page).toHaveURL(/\/search\.html$/);

    await homePage.setup();
    const gateMessage = await triggerAndCaptureAlert(page, () => homePage.navbar.clickCategory('KIDS'));
    expect(gateMessage).toBe('Please Login First');
    await expect(page).toHaveURL(/\/signin\.html$/);
  });

  test('TC-151: Empty-search defect then still-gated category', async ({ homePage, page }) => {
    await homePage.setup();
    const searchBar = homePage.navbar.searchBar;
    let firstMessage = '';
    page.once('dialog', (d) => { firstMessage = d.message(); void d.accept(); });
    await searchBar.click();
    await searchBar.type('x');
    await searchBar.press('Tab');
    expect(firstMessage).toBe('Product not Found');

    const emptySearchMessage = await triggerAndCaptureAlert(page, async () => {
      await searchBar.click();
      await searchBar.press('Backspace');
      await searchBar.press('Tab');
    });
    // Defect: empty search wrongly "succeeds" (matches the whole catalog).
    expect(emptySearchMessage).toMatch(/^\d+ no\. of products found$/);
    await expect(page).toHaveURL(/\/search\.html$/);

    await homePage.setup();
    const gateMessage = await triggerAndCaptureAlert(page, () => homePage.navbar.clickCategory('HOME & LIVING'));
    expect(gateMessage).toBe('Please Login First');
    await expect(page).toHaveURL(/\/signin\.html$/);
  });

  test('TC-152: Full guest-to-basket journey via footer + failed-then-successful sign-in + category, persisted-state assertion', async ({ homePage, signInPage, homeLivingPage, page }) => {
    const account = makeAccount('Full Journey', { Email: 'full.journey@test.com', Password: 'FullJourney@1' });
    await homePage.setup();
    await page.evaluate((acc) => window.localStorage.setItem('userdata', JSON.stringify([acc])), account);

    // Step 1: footer visit
    await homePage.footerContactUsLink.click();
    await expect(page).toHaveURL(/\/contact-us\.html$/);

    // Step 2: wrong password once — redirected to signup.html (Finding 6)
    await signInPage.setup();
    const failMessage = await signInPage.login(account.Email, 'WrongPassword1');
    expect(failMessage).toBe('Incorrect Id or password');
    await expect(page).toHaveURL(/\/signup\.html$/);

    // Step 3: navigate back to signin.html and sign in correctly
    await signInPage.setup();
    const successMessage = await signInPage.login(account.Email, account.Password);
    expect(successMessage).toBe('Login successfull');
    await expect(page).toHaveURL(/\/index\.html$/);

    // Step 4: category + add (Home & Living)
    const noDialog = assertNoDialogFires(page);
    await homePage.navbar.clickCategory('HOME & LIVING');
    await expect(page).toHaveURL(/\/Home&Living\.html$/);
    expect(noDialog()).toBe(false);
    await triggerAndCaptureAlert(page, () => homeLivingPage.addToCart(0));
    await expect(homeLivingPage.navbar.cartBadge).toHaveText('1');

    // Step 5: persisted-state assertion
    const cartData = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cartData') || '[]'));
    expect(cartData).toHaveLength(1);
  });
});
