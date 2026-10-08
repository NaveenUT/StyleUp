/**
 * Section: Accessibility — Error Identification & Status Announcement (WCAG 3.3.1)
 * Business Rule(s): BR15(e)
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signin.html:69-70; signup.html:66-74
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-143–TC-144
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Accessibility — Error Identification & Status Announcement', () => {
  test('TC-143: Sign In error is perceivable but not field-specific', async ({ signInPage, page }) => {
    const account = makeAccount('A11y Error', { Email: 'a11y.error@test.com', Password: 'A11yError@1' });
    await seedUserdata(page, [account]);
    await signInPage.setup();
    const message = await signInPage.login(account.Email, 'WrongPassword1');
    // Native alert() is inherently perceivable (blocks the page, read by screen readers
    // as a modal), but the single message does not name which specific field was wrong.
    expect(message).toBe('Incorrect Id or password');
  });

  test('TC-144: Sign Up errors are perceivable and field-specific (compliant)', async ({ signUpPage }) => {
    await signUpPage.setup();
    let message = await signUpPage.registerExpectingAlert('', 'a@b.com', 'Test@1234');
    expect(message).toBe('Enter correct name');

    message = await signUpPage.registerExpectingAlert('Valid', 'invalid', 'Test@1234');
    expect(message).toBe('Enter correct Email');

    message = await signUpPage.registerExpectingAlert('Valid', 'valid@test.com', 'short');
    expect(message).toBe('Weak Password:Enter atleast 8 character');
  });
});
