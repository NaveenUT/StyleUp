/**
 * Section: SEO & Discoverability
 * Business Rule(s): BR14
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: index.html:7; signin.html:7; signup.html:7; navbar.js:59-84
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-124–TC-127
 */
import { test, expect } from '../../fixtures/customFixtures';
import { gotoPath } from '../../utils/navigationHelpers';

test.describe('SEO & Discoverability', () => {
  test('TC-124: Page titles are not descriptive or distinct across Sign In/Sign Up (defect)', async ({ homePage, signInPage, signUpPage, page }) => {
    await homePage.setup();
    expect(await page.title()).toBe('Styleup');

    await signInPage.setup();
    const signinTitle = await page.title();
    expect(signinTitle).toBe('Document');

    await signUpPage.setup();
    const signupTitle = await page.title();
    // Defect: both are the identical, non-descriptive default "Document" title.
    expect(signupTitle).toBe('Document');
    expect(signupTitle).toBe(signinTitle);
  });

  test('TC-125: No meta description, canonical, or robots directive on any of the 3 pages (zero-case/defect)', async ({ page }) => {
    const { gotoPath } = await import('../../utils/navigationHelpers');
    for (const path of ['/index.html', '/signin.html', '/signup.html']) {
      await gotoPath(page, path);
      expect(await page.locator('meta[name="description"]').count()).toBe(0);
      expect(await page.locator('link[rel="canonical"]').count()).toBe(0);
      expect(await page.locator('meta[name="robots"]').count()).toBe(0);
    }
  });

  test('TC-126: No <h1> exists on any of the 3 pages; heading hierarchy starts at <h2> on Sign In/Sign Up (defect)', async ({ homePage, signInPage, signUpPage, page }) => {
    await homePage.setup();
    expect(await page.locator('h1').count()).toBe(0);

    await signInPage.setup();
    expect(await page.locator('h1').count()).toBe(0);
    await expect(page.locator('h2')).toHaveCount(1);
    await expect(page.locator('h2')).toHaveText('Sign In');

    await signUpPage.setup();
    expect(await page.locator('h1').count()).toBe(0);
    await expect(page.locator('h2')).toHaveCount(1);
    await expect(page.locator('h2')).toHaveText('Sign Up');
  });

  test('TC-127: Category navigation is real, crawlable anchors on Sign In/Sign Up, but script-driven on the dynamic navbar pages (defect)', async ({ signInPage, homePage }) => {
    await signInPage.setup();
    // Compliant: signin.html:22 — real <a href="mens.html"> anchors, crawlable
    const signinMenHref = await signInPage.categoryLink('MEN').getAttribute('href');
    expect(signinMenHref).toBe('mens.html');

    await homePage.setup();
    // Defect: navbar.js:59-62/18-22 — index.html's equivalent items are plain <div>
    // elements with a `click` listener attached via addEventListener, no href of any kind.
    const menDiv = homePage.navbar.categoryLink('MEN');
    expect(await menDiv.evaluate((el) => el.tagName)).toBe('DIV');
    expect(await menDiv.getAttribute('href')).toBeNull();
  });
});
