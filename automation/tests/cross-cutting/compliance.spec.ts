/**
 * Section: Compliance
 * Business Rule(s): BR13
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: index.html:80; signin.html:46,49; signup.html:46,49; terms-of-use.html
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-111–TC-113
 */
import { test, expect } from '../../fixtures/customFixtures';

test.describe('Compliance', () => {
  test('TC-111: Privacy Policy footer item does not resolve to a real document (defect)', async ({ homePage, page }) => {
    await homePage.setup();
    // Source: index.html:80 — <td>Privacy Policy</td> carries no href/onclick/listener
    await homePage.footerStaticCell('Privacy Policy').click();
    await expect(page).toHaveURL(/\/index\.html$/);
  });

  test('TC-112: Terms of use/Terms of Services resolve to real content (compliant)', async ({ signInPage, signUpPage, homePage, page }) => {
    await signInPage.setup();
    await signInPage.termsLink.click();
    await expect(page).toHaveURL(/\/terms-of-use\.html$/);
    const body1 = (await page.locator('body').innerText()).trim();
    expect(body1.length).toBeGreaterThan(200);

    await signUpPage.setup();
    await signUpPage.termsLink.click();
    await expect(page).toHaveURL(/\/terms-of-use\.html$/);

    await homePage.setup();
    await homePage.footerTermsOfUseLink.click();
    await expect(page).toHaveURL(/\/terms-of-use\.html$/);
  });

  test('TC-113: No consent is obtained before writing to client storage (zero-case/defect)', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    await page.evaluate(() => window.localStorage.clear());

    let dialogFired = false;
    page.once('dialog', (d) => { dialogFired = true; void d.accept(); });
    await signUpPage.fillForm('Consent Test', 'consent@test.com', 'Consent@123');
    await signUpPage.submit();
    await expect(page).toHaveURL(/\/signin\.html$/);

    // No consent banner/modal/prompt appears at any point; localStorage.setItem fires
    // immediately inside myfunction() (signup.html:77) with no gating step whatsoever.
    expect(dialogFired).toBe(false);
    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata.length).toBeGreaterThan(0);
  });
});
