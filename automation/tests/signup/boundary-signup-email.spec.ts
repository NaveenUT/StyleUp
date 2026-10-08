/**
 * Section: Boundary — Sign Up Email
 * Business Rule(s): BR6
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:69-71 — obj.Email.substring(obj.Email.length-4)!=".com"
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-075–TC-076
 */
import { test, expect } from '../../fixtures/customFixtures';
import { assertNoDialogFires } from '../../utils/waitHelpers';

test.describe('Boundary — Sign Up Email', () => {
  test('TC-075: Minimal valid email "a@b.com" accepted', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    await signUpPage.fillForm('Min Email', 'a@b.com', 'Test@1234');
    const dialogFired = assertNoDialogFires(page);
    await signUpPage.submit();
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);
  });

  test('TC-076: Email ending in uppercase ".COM" incorrectly rejected (discrepancy)', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('Case Test', 'pat@test.COM', 'Test@1234');
    // Discrepancy: signup.html:69's `.substring(...)!=".com"` is a case-sensitive string
    // comparison — a technically valid, real-world-common uppercase TLD is rejected
    // against a reasonable BR6 expectation of case-insensitive validation.
    expect(message).toBe('Enter correct Email');
  });
});
