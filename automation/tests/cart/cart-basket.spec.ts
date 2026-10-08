/**
 * Section: Cart/Basket
 * Business Rule(s): BR3, BR7
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source) + Mode B (live, this session — navbar.js
 *   cart branch, see pages/NavbarComponent.ts)
 * Source files analysed: navbar.js:20-34; index.js:102-109; mens.js:114-197; cart.html:60-156;
 *   signin.html, signup.html (static navbar — no #login_Status/navbar.js, confirmed by grep)
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-042–TC-050
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata, seedLoginStatus, seedNow } from '../../utils/storageHelpers';
import { gotoPath } from '../../utils/navigationHelpers';
import { triggerAndCaptureAlert } from '../../utils/waitHelpers';
import { makeAccount, TWO_ITEM_CART } from '../../test-data/testData';

const ACCOUNT = makeAccount('Cart Tester', { Email: 'cart.tester@test.com', Password: 'Cart@1234' });

test.describe('Cart/Basket', () => {
  test('TC-042: Basket shows 0 after fresh login', async ({ signInPage, homePage, page }) => {
    await seedUserdata(page, [ACCOUNT]);
    await signInPage.setup();
    await signInPage.login(ACCOUNT.Email, ACCOUNT.Password);
    await expect(page).toHaveURL(/\/index\.html$/);
    // Source: index.js:102-109 cartItems() — sums cartData's quantity fields into #cart-items
    await expect(homePage.navbar.cartBadge).toHaveText('0');
  });

  test('TC-043: Basket increments across 2 sequential adds', async ({ mensPage, page }) => {
    await seedUserdata(page, [ACCOUNT]);
    await seedLoginStatus(page, true);
    await mensPage.setup();

    let message = await triggerAndCaptureAlert(page, () => mensPage.addToCart(0));
    // Source: mens.js:184 — alert(`Product ${ele.name} Added to Cart Succesfuly`)
    expect(message).toContain('Added to Cart Succesfuly');
    await expect(mensPage.navbar.cartBadge).toHaveText('1');

    message = await triggerAndCaptureAlert(page, () => mensPage.addToCart(1));
    expect(message).toContain('Added to Cart Succesfuly');
    await expect(mensPage.navbar.cartBadge).toHaveText('2');
  });

  test('TC-044: Basket decreases on removal', async ({ homePage, cartPage, page }) => {
    await homePage.setup();
    // One-shot seed (not addInitScript): removal reloads cart.html, and a persistent
    // addInitScript would re-seed the original 2-item array right back on that reload.
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT], cartData: TWO_ITEM_CART });
    await cartPage.setup();
    await expect(cartPage.lineItems).toHaveCount(2);

    await cartPage.removeItem(0);
    // Source: cart.html:139-144 removeitem() — arr.splice + setItem('cartData') + reload()
    await expect(cartPage.lineItems).toHaveCount(1);
    const cartData = await page.evaluate(() => JSON.parse(window.localStorage.getItem('cartData') || '[]'));
    expect(cartData).toHaveLength(1);
  });

  test('TC-045: Basket persists across pages while logged in', async ({ homePage, mensPage, page }) => {
    await homePage.setup();
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT], cartData: [TWO_ITEM_CART[0]] });
    for (const path of ['/index.html', '/about-us.html', '/mens.html']) {
      await gotoPath(page, path);
      await expect(mensPage.navbar.cartBadge).toHaveText('1');
    }
  });

  test('TC-046: Basket disappears on logout', async ({ homePage, page }) => {
    await homePage.setup();
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT], cartData: [TWO_ITEM_CART[0]] });
    await homePage.reload();
    await expect(homePage.navbar.cartBadge).toHaveText('1');

    await homePage.navbar.logOut();
    await expect(homePage.navbar.cartIcon).toHaveCount(0);
  });

  test('TC-047: Static cart image on Sign In/Sign Up (defect)', async ({ page }) => {
    for (const path of ['/signin.html', '/signup.html']) {
      await gotoPath(page, path);
      // Raw source: <img src="https://www.kindpng.com/picc/m/161-1613834_online-shopping-cart-green-shopping-cart-logo-hd.png">
      // [SOURCE VERIFIED] file: signin.html:34 (identical at signup.html:32) | no id/class, plain static <img>
      const loggedOutSrc = await page.locator('#right img').getAttribute('src');
      expect(await page.locator('#login_Status').count()).toBe(0);

      await page.evaluate((items) => {
        window.localStorage.setItem('loginStatus', 'true');
        window.localStorage.setItem('cartData', JSON.stringify(items));
      }, [TWO_ITEM_CART[0]]);
      await page.reload({ waitUntil: 'domcontentloaded' });
      const loggedInSrc = await page.locator('#right img').getAttribute('src');

      // Defect: signin.html/signup.html never read loginStatus (Finding 7) — the cart
      // image is identical regardless of auth/cart state, and no #cart-items badge exists.
      expect(loggedInSrc).toBe(loggedOutSrc);
      expect(await page.locator('#cart-items').count()).toBe(0);
    }
  });

  test('TC-048: No Cart icon on any checkout page (defect)', async ({ homePage, page }) => {
    await homePage.setup();
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT], cartData: TWO_ITEM_CART });
    for (const path of ['/cart.html', '/address.html', '/payment.html', '/otp.html']) {
      await gotoPath(page, path);
      // Defect: confirmed by grep — none of these 4 pages loads navbar.js or renders
      // #login_Status at all (structural absence, not a conditional one).
      expect(await page.locator('#cart-items').count()).toBe(0);
    }
  });

  test('TC-049: Basket reverts after hard cache clear', async ({ homePage, page }) => {
    await homePage.setup();
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT], cartData: [TWO_ITEM_CART[0]] });
    await homePage.reload();
    await expect(homePage.navbar.cartBadge).toHaveText('1');

    await page.evaluate(() => window.localStorage.clear());
    await homePage.reload();
    // Source: navbar.js:1,36-51 — login_status false → guest branch, no cart div at all
    await expect(homePage.navbar.cartIcon).toHaveCount(0);
  });

  test('TC-050: Basket across 3 automatable browser engines', async ({ homePage, page, browserName }) => {
    await homePage.setup();
    await seedNow(page, { loginStatus: true, userdata: [ACCOUNT], cartData: [TWO_ITEM_CART[0]] });
    await homePage.setup();
    await expect(homePage.navbar.cartBadge).toHaveText('1');
    test.info().annotations.push({ type: 'engine', description: browserName });
  });
});
