/**
 * Section: Accessibility — Contrast (WCAG 1.4.3)
 * Business Rule(s): BR15(d)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode B (live) — every ratio below is computed from actual
 *   getComputedStyle() values read in-browser, not estimated from source
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-140–TC-142
 */
import { test, expect } from '../../fixtures/customFixtures';
import { Locator } from '@playwright/test';
import { contrastRatio, isLargeText } from '../../utils/accessibilityHelpers';

const WCAG_NORMAL_TEXT_MIN = 4.5;
const WCAG_LARGE_TEXT_MIN = 3.0;

async function assertMeetsWcagAA(locatorGetter: () => Locator, expectPass: boolean, label: string) {
  const locator = locatorGetter();
  const ratio = await contrastRatio(locator);
  const { fontSizePx, fontWeight } = await locator.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { fontSizePx: parseFloat(cs.fontSize), fontWeight: cs.fontWeight };
  });
  const threshold = isLargeText(fontSizePx, fontWeight) ? WCAG_LARGE_TEXT_MIN : WCAG_NORMAL_TEXT_MIN;
  const passes = ratio >= threshold;
  expect(passes, `${label}: measured ${ratio.toFixed(2)}:1 against a ${threshold}:1 threshold`).toBe(expectPass);
}

test.describe('Accessibility — Contrast', () => {
  test('TC-140: Homepage text contrast', async ({ homePage, page }) => {
    await homePage.setup();
    // Live-measured: black-on-white default styling for the top menu, Sign In/Up text,
    // and footer heading — comfortably compliant (~20-21:1).
    await assertMeetsWcagAA(() => homePage.navbar.categoryLink('MEN'), true, 'Top Menu MEN');
    await assertMeetsWcagAA(() => homePage.navbar.guestSignInButton, true, 'Sign In text');
    await assertMeetsWcagAA(() => page.locator('h4').first(), true, 'Footer heading');

    const placeholderColor = await homePage.navbar.searchBar.evaluate((el) => getComputedStyle(el, '::placeholder').color);
    expect(placeholderColor).toBe('rgb(117, 117, 117)');
  });

  test('TC-141: Sign In page text contrast', async ({ signInPage, page }) => {
    await signInPage.setup();
    // Live-measured (signin.css): label { color:#ff3f6c } on white → ~3.40:1 — FAILS 4.5:1
    await assertMeetsWcagAA(() => page.locator('label').first(), false, 'Sign In label');
    // Submit button: white text on #ff3f6c — same colour pair, same ~3.40:1 ratio — FAILS
    await assertMeetsWcagAA(() => signInPage.submitButton, false, 'Sign In submit button');
    // "Sign up" link: color:#ff3f6c on white — same ~3.40:1 ratio — FAILS
    await assertMeetsWcagAA(() => signInPage.signUpLink, false, 'Sign In "Sign up" link');
    // Placeholder text (browser-default grey) — PASSES
    const placeholderColor = await signInPage.emailField.evaluate((el) => getComputedStyle(el, '::placeholder').color);
    expect(placeholderColor).toBe('rgb(117, 117, 117)');
  });

  test('TC-142: Sign Up page text contrast', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    await assertMeetsWcagAA(() => page.locator('label').first(), false, 'Sign Up label');
    await assertMeetsWcagAA(() => signUpPage.submitButton, false, 'Sign Up submit button');
    await assertMeetsWcagAA(() => signUpPage.signInLink, false, 'Sign Up "Sign in" link');
    const placeholderColor = await signUpPage.emailField.evaluate((el) => getComputedStyle(el, '::placeholder').color);
    expect(placeholderColor).toBe('rgb(117, 117, 117)');
  });
});
