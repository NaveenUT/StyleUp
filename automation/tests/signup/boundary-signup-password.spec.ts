/**
 * Section: Boundary — Sign Up Password
 * Business Rule(s): BR6
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:72-74 — obj.Password.length<8
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-071–TC-074
 */
import { test, expect } from '../../fixtures/customFixtures';
import { triggerAndCaptureAlert, assertNoDialogFires } from '../../utils/waitHelpers';
import { SignUpPage } from '../../pages/SignUpPage';

async function register(signUpPage: SignUpPage, email: string, password: string) {
  await signUpPage.setup();
  await signUpPage.fillForm('Boundary Tester', email, password);
  return signUpPage.submit();
}

test.describe('Boundary — Sign Up Password', () => {
  test('TC-071: 7-character password rejected', async ({ signUpPage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => register(signUpPage, 'bnd071@test.com', 'Abcd@12'));
    expect(message).toBe('Weak Password:Enter atleast 8 character');
  });

  test('TC-072: Exactly-8-character password accepted', async ({ signUpPage, page }) => {
    const dialogFired = assertNoDialogFires(page);
    await register(signUpPage, 'bnd072@test.com', 'Abcd@123');
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);
  });

  test('TC-073: 9-character password accepted', async ({ signUpPage, page }) => {
    const dialogFired = assertNoDialogFires(page);
    await register(signUpPage, 'bnd073@test.com', 'Abcd@1234');
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);
  });

  test('TC-074: 8-space password incorrectly accepted (defect)', async ({ signUpPage, page }) => {
    const dialogFired = assertNoDialogFires(page);
    await register(signUpPage, 'bnd074@test.com', '        ');
    // Defect: signup.html:72 — a bare `.length<8` check has no character-class validation,
    // so an 8-character whitespace-only string satisfies it exactly like real content.
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);
  });
});
