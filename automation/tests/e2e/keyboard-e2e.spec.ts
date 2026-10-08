/**
 * Section: Keyboard End-to-End Journeys
 * Business Rule(s): BR15(a),BR5,BR6
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source) + live keyboard-driven verification
 * Source files analysed: signin.html:38-49; signup.html:36-50
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-153–TC-154
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { triggerAndCaptureAlert } from '../../utils/waitHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Keyboard End-to-End Journeys', () => {
  test('TC-153: Complete Sign In using the keyboard alone', async ({ signInPage, page }) => {
    const account = makeAccount('Keyboard Only', { Email: 'kb.e2e.signin@test.com', Password: 'KbE2e@123' });
    await seedUserdata(page, [account]);
    await signInPage.setup();

    await signInPage.emailField.focus();
    await page.keyboard.type(account.Email);
    await page.keyboard.press('Tab');
    await page.keyboard.type(account.Password);

    const message = await triggerAndCaptureAlert(page, () => page.keyboard.press('Enter'));
    expect(message).toBe('Login successfull');
    await expect(page).toHaveURL(/\/index\.html$/);
  });

  test('TC-154: Complete Sign Up using the keyboard alone', async ({ signUpPage, page }) => {
    await signUpPage.setup();

    await signUpPage.nameField.focus();
    await page.keyboard.type('Keyboard User');
    await page.keyboard.press('Tab');
    await page.keyboard.type('kbuser@test.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Kb@12345');

    let dialogFired = false;
    page.once('dialog', (d) => { dialogFired = true; void d.accept(); });
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired).toBe(false);
  });
});
