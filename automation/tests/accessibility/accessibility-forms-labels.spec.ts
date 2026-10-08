/**
 * Section: Accessibility — Forms & Labels (WCAG 1.3.1, 4.1.2)
 * Business Rule(s): BR15(b)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source) + live accessible-name verification
 * Source files analysed: index.html:25 (no label at all); signin.html:41,43; signup.html:39,41,43
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-136–TC-138
 */
import { test, expect } from '../../fixtures/customFixtures';

test.describe('Accessibility — Forms & Labels', () => {
  test('TC-136: Search field has no programmatic label (defect)', async ({ homePage, page }) => {
    await homePage.setup();
    // Expected to FAIL: no <label>/aria-label of any kind exists for #search-bar.
    expect(await page.locator('label[for="search-bar"]').count()).toBe(0);
    const ariaLabel = await homePage.navbar.searchBar.getAttribute('aria-label');
    expect(ariaLabel).toBeNull();
    // Its only accessible-name fallback is the placeholder.
    const accessibleName = await homePage.navbar.searchBar.getAttribute('placeholder');
    expect(accessibleName).toBe('Search for products, brands & more');
  });

  test('TC-137: Sign In Email/Password labels are unassociated (defect)', async ({ signInPage, page }) => {
    await signInPage.setup();
    // Raw source: <label for="">Email</label> (signin.html:41), <label for="">Password</label> (signin.html:43)
    // [SOURCE VERIFIED] file: signin.html:41,43 | attribute: for="" (empty, breaks association)
    const labels = await page.locator('label').all();
    expect(labels).toHaveLength(2);
    for (const label of labels) {
      expect(await label.getAttribute('for')).toBe('');
    }
    // Fallback accessible name is each field's placeholder, not the visually-adjacent label.
    await expect(signInPage.emailField).toHaveAttribute('placeholder', 'Enter Email');
    await expect(signInPage.passwordField).toHaveAttribute('placeholder', 'Enter Password');
  });

  test('TC-138: Sign Up Full Name/Email/Password labels are unassociated (defect)', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    const labels = await page.locator('label').all();
    expect(labels).toHaveLength(3);
    for (const label of labels) {
      expect(await label.getAttribute('for')).toBe('');
    }
    await expect(signUpPage.nameField).toHaveAttribute('placeholder', 'Enter Your Full Name');
    await expect(signUpPage.emailField).toHaveAttribute('placeholder', 'Enter Email');
    await expect(signUpPage.passwordField).toHaveAttribute('placeholder', 'Enter Password');
  });
});
