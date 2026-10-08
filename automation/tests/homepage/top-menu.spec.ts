/**
 * Section: Top menu
 * Business Rule(s): BR2
 * Target website: BASE_URL (Styleup, local static server)
 * Verification mode(s) used: Mode A (source), cross-checked live in-session (Mode B) for
 *   the JS-injected navbar branch — see pages/NavbarComponent.ts header blocks.
 * Source files analysed: navbar.js, index.html
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-001, TC-002
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedLoginStatus, seedUserdata } from '../../utils/storageHelpers';
import { triggerAndCaptureAlert, assertNoDialogFires } from '../../utils/waitHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Top menu', () => {
  test('TC-001: Guest blocked from all 4 gated sections', async ({ homePage, page }) => {
    await homePage.setup();

    for (const name of ['MEN', 'WOMEN', 'KIDS', 'HOME & LIVING'] as const) {
      const message = await triggerAndCaptureAlert(page, () => homePage.navbar.clickCategory(name));
      // Source: navbar.js:80 — alert('Please Login First')
      expect(message).toBe('Please Login First');
      // Source: navbar.js:82 — window.location.href = 'signin.html'
      await expect(page).toHaveURL(/\/signin\.html$/);
      await homePage.setup();
    }
  });

  test('TC-002: Authenticated user opens all 4 gated sections with no alert', async ({ homePage, page }) => {
    const account = makeAccount('Top Menu Tester');
    await seedUserdata(page, [account]);
    await seedLoginStatus(page, true);
    await homePage.setup();

    const routes: Record<string, RegExp> = {
      MEN: /\/mens\.html$/,
      WOMEN: /\/womens\.html$/,
      KIDS: /\/kids\.html$/,
      'HOME & LIVING': /\/Home&Living\.html$/,
    };
    for (const [name, urlPattern] of Object.entries(routes)) {
      const dialogFired = assertNoDialogFires(page);
      await homePage.navbar.clickCategory(name as any);
      await expect(page).toHaveURL(urlPattern);
      expect(dialogFired()).toBe(false);
      // loginStatus persists in localStorage across same-origin navigation, so no reseed needed.
      await homePage.navbar.clickLogo();
      await expect(page).toHaveURL(/\/index\.html$/);
    }
  });
});
