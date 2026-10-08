/**
 * Section: Accessibility — Keyboard Navigation & Focus (WCAG 2.1.1, 2.4.3, 2.4.7)
 * Business Rule(s): BR15(a)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source) + live keyboard-driven verification
 * Source files analysed: index.html:14-28 (plain <div>/<img>, no tabindex); signin.html:38-49;
 *   signup.html:36-50
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-133–TC-135
 */
import { test, expect } from '../../fixtures/customFixtures';
import { makeAccount } from '../../test-data/testData';

test.describe('Accessibility — Keyboard Navigation & Focus', () => {
  test('TC-133: Homepage keyboard operability (defect)', async ({ homePage, page }) => {
    await homePage.setup();
    const focusedTags: string[] = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}#${el.id || ''}.${(el as HTMLElement).className || ''}` : 'BODY';
      });
      focusedTags.push(tag);
    }
    // Record actual behaviour — expected to FAIL, log as a defect: the Logo, category
    // items, and Sign In/Sign Up are plain <div>/<img> with no tabindex, so none of them
    // ever receive Tab focus; only the Search input (#search-bar) is keyboard-operable.
    const onlySearchFocused = focusedTags.every((t) => t === 'INPUT#search-bar.' || t === 'BODY');
    expect(onlySearchFocused).toBe(false);
    expect(focusedTags).toContain('INPUT#search-bar.');
  });

  test('TC-134: Sign In page fully keyboard-completable', async ({ signInPage, page }) => {
    const account = makeAccount('Kbd SignIn', { Email: 'kbd.signin@test.com', Password: 'KbdSignIn@1' });
    await signInPage.setup();
    await page.evaluate((acc) => {
      window.localStorage.setItem('userdata', JSON.stringify([acc]));
    }, account);
    await signInPage.reload();
    await signInPage.emailField.focus();
    await expect(signInPage.emailField).toBeFocused();
    await page.keyboard.type(account.Email);
    await page.keyboard.press('Tab');
    await expect(signInPage.passwordField).toBeFocused();
    await page.keyboard.type(account.Password);
    // DOM order (signin.html:46-48): Password → Terms of Services link → Submit —
    // the Terms link sits between them, so it is the next Tab stop, not the button.
    await page.keyboard.press('Tab');
    await expect(signInPage.termsLink).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(signInPage.submitButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/index\.html$/);
  });

  test('TC-135: Sign Up page fully keyboard-completable', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    await signUpPage.nameField.focus();
    await expect(signUpPage.nameField).toBeFocused();
    await page.keyboard.type('Kbd SignUp');
    await page.keyboard.press('Tab');
    await expect(signUpPage.emailField).toBeFocused();
    await page.keyboard.type('kbd.signup@test.com');
    await page.keyboard.press('Tab');
    await expect(signUpPage.passwordField).toBeFocused();
    await page.keyboard.type('KbdSignUp@1');
    // DOM order (signup.html:46-48): Password → Terms of Services link → Submit.
    await page.keyboard.press('Tab');
    await expect(signUpPage.termsLink).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(signUpPage.submitButton).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/signin\.html$/);
  });
});
