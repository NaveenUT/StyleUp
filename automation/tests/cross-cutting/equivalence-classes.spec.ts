/**
 * Section: Equivalence Classes
 * Business Rule(s): BR5, BR6
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:56-79; signin.html:52-78
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-068–TC-070
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { triggerAndCaptureAlert, assertNoDialogFires } from '../../utils/waitHelpers';
import { EXISTING_ACCOUNT } from '../../test-data/testData';
import { SignUpPage } from '../../pages/SignUpPage';

async function registerViaSignup(signUpPage: SignUpPage, name: string, email: string, password: string) {
  await signUpPage.setup();
  await signUpPage.fillForm(name, email, password);
  return signUpPage.submit();
}

test.describe('Equivalence Classes', () => {
  test('TC-068: Sign Up Email field partitions', async ({ signUpPage, page }) => {
    // Class 1 (valid): "a@b.com"
    let dialogFired = assertNoDialogFires(page);
    await registerViaSignup(signUpPage, 'Class One', 'class1@equivtest.com', 'Test@1234');
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);

    // Class 2 (invalid, no ".com"): "a@b.org" — Source: signup.html:69 substring check fails
    const message = await triggerAndCaptureAlert(page, () => registerViaSignup(signUpPage, 'Class Two', 'class2@equivtest.org', 'Test@1234'));
    expect(message).toBe('Enter correct Email');

    // Class 3 (invalid "missing @", but passes the code's actual .com-suffix-only check)
    dialogFired = assertNoDialogFires(page);
    await registerViaSignup(signUpPage, 'Class Three', 'class3equivtest.com', 'Test@1234');
    await expect(page).toHaveURL(/\/signin\.html$/);
    // Defect: signup.html:69 has no "@" check at all — this is its own valid-per-code class,
    // not a rejected one, standing as a discrepancy against reasonable email-validity expectation.
    expect(dialogFired()).toBe(false);
    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata.some((u: any) => u.Email === 'class3equivtest.com')).toBe(true);
  });

  test('TC-069: Sign Up Password field partitions', async ({ signUpPage, page }) => {
    // Class 1 (invalid, <8): "Ab1@12"
    let message = await triggerAndCaptureAlert(page, () => registerViaSignup(signUpPage, 'Pwd Class One', 'pwdclass1@equivtest.com', 'Ab1@12'));
    expect(message).toBe('Weak Password:Enter atleast 8 character');

    // Class 2 (valid, >=8, ordinary): "Ab1@1234"
    let dialogFired = assertNoDialogFires(page);
    await registerViaSignup(signUpPage, 'Pwd Class Two', 'pwdclass2@equivtest.com', 'Ab1@1234');
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired()).toBe(false);

    // Class 3 (valid-per-code, >=8, all whitespace): "        " (8 spaces)
    dialogFired = assertNoDialogFires(page);
    await registerViaSignup(signUpPage, 'Pwd Class Three', 'pwdclass3@equivtest.com', '        ');
    await expect(page).toHaveURL(/\/signin\.html$/);
    // Defect: signup.html:72 is a bare `.length<8` with no character-class check.
    expect(dialogFired()).toBe(false);
  });

  test('TC-070: Sign In match/no-match partitions', async ({ signInPage, page }) => {
    await seedUserdata(page, [EXISTING_ACCOUNT]);

    // Class 1 (both fields match one record)
    await signInPage.setup();
    let message = await signInPage.login(EXISTING_ACCOUNT.Email, EXISTING_ACCOUNT.Password);
    expect(message).toBe('Login successfull');
    await expect(page).toHaveURL(/\/index\.html$/);

    // Class 2 (Email matches a record, Password does not)
    await signInPage.setup();
    message = await signInPage.login(EXISTING_ACCOUNT.Email, 'WrongPassword1');
    expect(message).toBe('Incorrect Id or password');
    await expect(page).toHaveURL(/\/signup\.html$/);

    // Class 3 (Email matches no record at all)
    await signInPage.setup();
    message = await signInPage.login('nobody@test.com', EXISTING_ACCOUNT.Password);
    // Source: signin.html:63 — a single joint `Email==el.Email && Password==el.Password`
    // condition means Class 2 and Class 3 are indistinguishable outcomes, not two.
    expect(message).toBe('Incorrect Id or password');
    await expect(page).toHaveURL(/\/signup\.html$/);
  });
});
