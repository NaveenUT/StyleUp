/**
 * Section: Accessibility — Page Titles & Structure (WCAG 2.4.2, 1.3.1)
 * Business Rule(s): BR15(f)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: index.html:7; signin.html:7,40; signup.html:7,38
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-145–TC-147
 */
import { test, expect } from '../../fixtures/customFixtures';

test.describe('Accessibility — Page Titles & Structure', () => {
  test('TC-145: Homepage title and heading structure', async ({ homePage, page }) => {
    await homePage.setup();
    expect(await page.title()).toBe('Styleup');
    // Defect: no <h1> exists anywhere on the page.
    expect(await page.locator('h1').count()).toBe(0);
  });

  test('TC-146: Sign In title and heading structure (defect)', async ({ signInPage, page }) => {
    await signInPage.setup();
    // Expected to FAIL: unmodified default title.
    expect(await page.title()).toBe('Document');
    expect(await page.locator('h1').count()).toBe(0);
    await expect(page.locator('h2')).toHaveText('Sign In');
  });

  test('TC-147: Sign Up title and heading structure (defect)', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    // Expected to FAIL: identical unmodified default title to Sign In.
    expect(await page.title()).toBe('Document');
    expect(await page.locator('h1').count()).toBe(0);
    await expect(page.locator('h2')).toHaveText('Sign Up');
  });
});
