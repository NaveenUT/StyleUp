/**
 * Section: Localisation
 * Business Rule(s): Unmapped (no stating rule for Localisation, per the register's own text)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: index.html:2; signin.html:2; signup.html:2 (lang attribute);
 *   every .js/.html file (grepped for Intl./toLocaleString/i18n/locale — zero matches)
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-122–TC-123
 */
import { test, expect } from '../../fixtures/customFixtures';
import { gotoPath } from '../../utils/navigationHelpers';

test.describe('Localisation', () => {
  test('TC-122: No locale-aware formatting exists; all text is hardcoded English (zero-case)', async ({ homePage, signInPage, signUpPage, page }) => {
    await homePage.setup();
    // Grep across every .js/.html file for Intl./toLocaleString/i18n/locale returns zero
    // matches (SOURCE_CODE_INVENTORY.md "Not found" section). Confirming the substance:
    // every user-visible string is a hardcoded English literal in the source.
    await expect(page.locator('#products_page')).toContainText('MEN');
    await expect(page.locator('#products_page')).toContainText('WOMEN');

    await signInPage.setup();
    await expect(page.locator('h2')).toHaveText('Sign In');
    await signUpPage.setup();
    await expect(page.locator('h2')).toHaveText('Sign Up');
  });

  test('TC-123: lang attribute is present and correct (compliant, partial finding)', async ({ page }) => {
    for (const path of ['/index.html', '/signin.html', '/signup.html']) {
      await gotoPath(page, path);
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe('en');
    }
  });
});
