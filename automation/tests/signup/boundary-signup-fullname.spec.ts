/**
 * Section: Boundary — Sign Up Full Name
 * Business Rule(s): BR6
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:66-68 — obj.name.length<=0
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-077
 */
import { test, expect } from '../../fixtures/customFixtures';
import { assertNoDialogFires } from '../../utils/waitHelpers';

test.describe('Boundary — Sign Up Full Name', () => {
  test('TC-077: Single-space Full Name incorrectly satisfies the non-empty gate (defect)', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    await signUpPage.fillForm(' ', 'bnd077@test.com', 'Test@1234');
    const dialogFired = assertNoDialogFires(page);
    await signUpPage.submit();
    // Defect: signup.html:66 — " ".length is 1, not <=0, so no "Enter correct name" fires;
    // the account is created with a blank-looking name.
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);
    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata.some((u: any) => u.Email === 'bnd077@test.com' && u.name === ' ')).toBe(true);
  });
});
