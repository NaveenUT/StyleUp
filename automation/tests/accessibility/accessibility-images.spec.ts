/**
 * Section: Accessibility — Images & Alt Text (WCAG 1.1.1)
 * Business Rule(s): BR15(c)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: index.html:15; signin.html:18; signup.html:16
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-139
 */
import { test, expect } from '../../fixtures/customFixtures';

test.describe('Accessibility — Images & Alt Text', () => {
  test('TC-139: Logo alt-text consistency across the 3 in-scope pages (partial FAIL)', async ({ homePage, signInPage, signUpPage, page }) => {
    await homePage.setup();
    // Source: index.html:15 — alt="logo"
    await expect(homePage.navbar.logo).toHaveCount(1);

    await signInPage.setup();
    // Defect: signin.html:18 — the Logo <img> has no alt attribute at all.
    const signinAlt = await signInPage.logoLink.locator('img').getAttribute('alt');
    expect(signinAlt).toBeNull();

    await signUpPage.setup();
    const signupAlt = await signUpPage.logoLink.locator('img').getAttribute('alt');
    expect(signupAlt).toBeNull();
  });
});
