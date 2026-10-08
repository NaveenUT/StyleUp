/**
 * Section: Footer
 * Business Rule(s): BR1, BR2, BR7
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: index.html:63-101 (footer table + promotional text)
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-051–TC-061
 */
import { test, expect } from '../../fixtures/customFixtures';
import { gotoPath } from '../../utils/navigationHelpers';

// ⚠ SOURCE DISCREPANCY (page-count)
// Phase 1 (TC-058/TC-059) expects: 8 pages have the footer table, 8 pages lack it.
// Source shows: grepping every .html file for the footer's own distinguishing content
// ("Useful Links"/"Online Shopping", i.e. the <table id="table"> block itself, not the
// promotional-text section, which about-us.html/blog.html/terms-of-use.html DO have
// without the table — confirmed live, an earlier looser grep matching "tableware" in
// about-us.html's body text is what produced a false 8) shows only 5 of the 16 real
// pages render the footer table: index, womens, kids, home&living, search. The other
// 11 (about-us, blog, contact-us, mens, terms-of-use, cart, address, payment, otp,
// signin, signup) do not.
//
// ⚠ SOURCE DISCREPANCY (content) — new finding, not in either prior register
// Phase 1 (TC-058) expects: footer identical across every page that has it.
// Source/live DOM shows: index.html's footer is the only one that is genuinely
// interactive — womens.html:78-87 (identical pattern in kids.html, home&living.html,
// search.html) renders the SAME table shape as plain, non-interactive text: "Men" has
// no onclick (contrast index.html:71's login-bypassing onclick, TC-056), "Contact Us"/
// "About Us"/"Terms of use" are bare <td> text with no <a href> at all (contrast
// index.html:71,73,74's real anchors), and row 2's Useful-Links cell reads "Terms &
// Conditions" on these 4 pages vs. "Blog" on index.html (womens.html:79 vs index.html:72).
// Both assertions below follow Phase 1 (expect identical / expect present-and-working)
// and are EXPECTED TO FAIL against current source — raised for triage before merge,
// not weakened, per the protocol's Discrepancy Handling rule.
const PAGES_WITH_FOOTER = ['/index.html', '/womens.html', '/kids.html', '/home&living.html', '/search.html'];
const PAGES_WITHOUT_FOOTER = [
  '/about-us.html', '/blog.html', '/contact-us.html', '/mens.html', '/terms-of-use.html',
  '/cart.html', '/address.html', '/payment.html', '/otp.html', '/signin.html', '/signup.html',
];

test.describe('Footer', () => {
  test('TC-051: Contact Us footer link', async ({ homePage, page }) => {
    await homePage.setup();
    await homePage.footerContactUsLink.click();
    await expect(page).toHaveURL(/\/contact-us\.html$/);
  });

  test('TC-052: Blog footer link', async ({ homePage, page }) => {
    await homePage.setup();
    await homePage.footerBlogLink.click();
    await expect(page).toHaveURL(/\/blog\.html$/);
  });

  test('TC-053: About Us footer link', async ({ homePage, page }) => {
    await homePage.setup();
    await homePage.footerAboutUsLink.click();
    await expect(page).toHaveURL(/\/about-us\.html$/);
  });

  test('TC-054: Terms of use footer link', async ({ homePage, page }) => {
    await homePage.setup();
    await homePage.footerTermsOfUseLink.click();
    await expect(page).toHaveURL(/\/terms-of-use\.html$/);
  });

  test('TC-055: Static footer items don\'t navigate', async ({ homePage, page }) => {
    await homePage.setup();
    // Source: index.html:72-80 — none of these <td> cells carries an href, onclick, or listener
    for (const text of ['Women', 'Kids', 'Home', 'Living', 'Beauty', 'Gift cards', 'Tracking Order', 'Shipping', 'Returns', 'Cancellation', 'SiteMap', 'Privacy Policy']) {
      await homePage.footerStaticCell(text).click();
      await expect(page).toHaveURL(/\/index\.html$/);
    }
  });

  test('TC-056: Footer "Men" bypasses login (defect)', async ({ homePage, page }) => {
    await homePage.setup();
    // Defect: index.html:71 — onclick="window.location.href='mens.html'" with no
    // verifyLogin() gate, unlike the top-menu MEN item which routes through it.
    await homePage.clickFooterMenCell();
    await expect(page).toHaveURL(/\/mens\.html$/);
  });

  test('TC-057: 3 promotional lines present', async ({ homePage }) => {
    await homePage.setup();
    // Raw source: <h4>ONLINE SHOPPING MADE EASY AT STYLEUP</h4> (index.html:86)
    //             <h4>BEST ONLINE SHOPPING SITE IN INDIA FOR FASHION</h4> (index.html:88)
    //             <h4>SHOP ONLINE AT STYLEUP WITH COMPLETE CONVENIENCE</h4> (index.html:98)
    // [SOURCE VERIFIED] file: index.html:86,88,98
    await expect(homePage.promotionalHeading('ONLINE SHOPPING MADE EASY AT STYLEUP')).toBeVisible();
    await expect(homePage.promotionalHeading('BEST ONLINE SHOPPING SITE IN INDIA FOR FASHION')).toBeVisible();
    await expect(homePage.promotionalHeading('SHOP ONLINE AT STYLEUP WITH COMPLETE CONVENIENCE')).toBeVisible();
  });

  test('TC-058: Footer identical across the 8 pages that have it, both login states', async ({ page }) => {
    const texts: string[] = [];
    for (const path of PAGES_WITH_FOOTER) {
      await gotoPath(page, path);
      texts.push((await page.locator('#table').innerText()).trim());
    }
    for (const t of texts) expect(t).toBe(texts[0]);

    // Authenticated pass (the footer table's own markup does not branch on loginStatus)
    await gotoPath(page, '/index.html');
    await page.evaluate(() => window.localStorage.setItem('loginStatus', 'true'));
    const authTexts: string[] = [];
    for (const path of PAGES_WITH_FOOTER) {
      await gotoPath(page, path);
      authTexts.push((await page.locator('#table').innerText()).trim());
    }
    for (const t of authTexts) expect(t).toBe(texts[0]);
  });

  test('TC-059: Footer missing from 11 pages (defect; see ⚠ SOURCE DISCREPANCY above)', async ({ page }) => {
    for (const path of PAGES_WITHOUT_FOOTER) {
      await gotoPath(page, path);
      // Defect: confirmed live — zero matches for the footer's <table id="table"> on each
      expect(await page.locator('#table').count()).toBe(0);
    }
  });

  test('TC-060: Footer survives hard cache clear', async ({ homePage, page }) => {
    await homePage.setup();
    const before = (await homePage.footerTable.innerText()).trim();
    await page.evaluate(() => window.localStorage.clear());
    await homePage.reload();
    const after = (await homePage.footerTable.innerText()).trim();
    expect(after).toBe(before);
  });

  test('TC-061: Footer across 3 automatable browser engines', async ({ homePage, browserName }) => {
    await homePage.setup();
    await expect(homePage.footerTable).toBeVisible();
    await expect(homePage.footerContactUsLink).toBeVisible();
    test.info().annotations.push({ type: 'engine', description: browserName });
  });
});
