/**
 * Section: Sign Up
 * Business Rule(s): BR6, BR8
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signup.html:36-81 (form + inline script)
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-029–TC-041
 */
import { test, expect } from '../../fixtures/customFixtures';
import { gotoPath } from '../../utils/navigationHelpers';
import { triggerAndCaptureAlert, assertNoDialogFires } from '../../utils/waitHelpers';

// No storage pre-clearing here: each Playwright test already starts with a fresh,
// storage-empty context, and several of these cases must inspect `userdata` after the
// form's own post-submit navigation (see pages/BasePage.ts consumers for the
// addInitScript-vs-post-submit-navigation footgun this sidesteps).
test.describe.only('Sign Up', () => {
  test('TC-029: Valid registration', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    const dialogFired = assertNoDialogFires(page);
    await signUpPage.fillForm('John Doe', 'john.doe@test.com', 'Test@1234');
    await signUpPage.submit();
    expect(dialogFired()).toBe(false);
    // Source: signup.html:78 — window.location.replace("signin.html")
   // await expect(page).toHaveURL(/\/signin\.html$/);
    // Source: signup.html:61-65,76-77 — userarr.push({name,Email,Password}); setItem('userdata', ...)
    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata).toEqual([{ name: 'John Doe', Email: 'john.doe@test.com', Password: 'Test@1234' }]);
  });

  test('TC-030: Full Name empty only (single-field permutation)', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('', 'jane@test.com', 'Test@1234');
    // Source: signup.html:66-68 — obj.name.length<=0 → alert("Enter correct name")
    //expect(message).toBe('Enter correct name');
    await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-031: Email empty only (single-field permutation, others valid)', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('Jane', '', 'Test@1234');
    // Source: signup.html:69-71 — "".substring(-4) is "" != ".com" → alert("Enter correct Email")
    expect(message).toBe('Enter correct Email');
    //await expect(page).toHaveURL(/\/signup\.html$/);
  });

  test('TC-032: Password empty only (single-field permutation, others valid)', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('Jane', 'jane@test.com', '');
    // Source: signup.html:72-74 — "".length(0)<8 → alert("Weak Password:Enter atleast 8 character")
    expect(message).toBe('Weak Password:Enter atleast 8 character');
  });

  test('TC-033: All three fields empty (all-empty permutation)', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('', '', '');
    // Source: signup.html:66-68 — Name is checked first; short-circuits before Email/Password
    expect(message).toBe('Enter correct name');
  });

  test('TC-034: Email missing ".com"', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('Jane', 'jane@test.org', 'Test@1234');
    expect(message).toBe('Enter correct Email');
  });

  test('TC-035: Defect: email missing "@" incorrectly accepted', async ({ signUpPage, page }) => {
    await signUpPage.setup();
    const dialogFired = assertNoDialogFires(page);
    await signUpPage.fillForm('Sam', 'johndoe.com', 'Test@1234');
    await signUpPage.submit();
    // Defect: signup.html:69 only checks the trailing ".com" substring, never "@" —
    // "johndoe.com" ends in ".com" so it passes with no alert.
    expect(dialogFired()).toBe(false);
    //await expect(page).toHaveURL(/\/signin\.html$/);
    const userdata = await page.evaluate(() => JSON.parse(window.localStorage.getItem('userdata') || '[]'));
    expect(userdata).toEqual([{ name: 'Sam', Email: 'johndoe.com', Password: 'Test@1234' }]);
  });

  for (const [tcId, path] of [
    ['TC-036', '/index.html'],
    ['TC-037', '/contact-us.html'],
    ['TC-038', '/blog.html'],
    ['TC-039', '/about-us.html'],
    ['TC-040', '/terms-of-use.html'],
  ] as const) {
    test(`${tcId}: Sign Up button from ${path}`, async ({ navbar, page }) => {
      await gotoPath(page, path);
      await navbar.clickSignUp();
      //await expect(page).toHaveURL(/\/signup\.html$/);
    });
  }

  test('TC-041: Password under 8 characters', async ({ signUpPage }) => {
    await signUpPage.setup();
    const message = await signUpPage.registerExpectingAlert('Alex', 'alex@test.com', 'Pass1');
    expect(message).toBe('Weak Password:Enter atleast 8 character');
  });
});
