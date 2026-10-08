/**
 * Section: Compatibility
 * Business Rule(s): BR7
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signin.html; signup.html; search-algo.js:1287
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-119–TC-121
 * Engine mapping (see playwright.config.ts): chromium≈Chrome/Edge, firefox, webkit≈Safari.
 * "Incognito" is inherent — every Playwright test starts with a fresh, isolated context.
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata } from '../../utils/storageHelpers';
import { triggerAndCaptureAlert } from '../../utils/waitHelpers';
import { makeAccount } from '../../test-data/testData';

test.describe('Compatibility', () => {
  test('TC-119: Sign In submit path across automatable browser engines', async ({ signInPage, page, browserName }) => {
    const account = makeAccount('Compat SignIn', { Email: `compat.signin.${browserName}@test.com`, Password: 'Compat@123' });
    await seedUserdata(page, [account]);
    await signInPage.setup();
    const message = await signInPage.login(account.Email, account.Password);
    expect(message).toBe('Login successfull');
    await expect(page).toHaveURL(/\/index\.html$/);
    test.info().annotations.push({ type: 'engine', description: browserName });
  });

  test('TC-120: Sign Up submit path across automatable browser engines', async ({ signUpPage, page, browserName }) => {
    await signUpPage.setup();
    await signUpPage.fillForm('Compat SignUp', `compat.signup.${browserName}@test.com`, 'Compat@123');
    let dialogFired = false;
    page.once('dialog', (d) => { dialogFired = true; void d.accept(); });
    await signUpPage.submit();
    await expect(page).toHaveURL(/\/signin\.html$/);
    expect(dialogFired).toBe(false);
    test.info().annotations.push({ type: 'engine', description: browserName });
  });

  test('TC-121: Native alert() dialogs render consistently across environments', async ({ homePage, page, browserName }) => {
    await homePage.setup();
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('   '));
    // Source: search-algo.js:1287 — a native alert() blocks page interaction identically
    // regardless of browser engine (browser-native behaviour, not app-controlled).
    expect(message).toBe('Product not Found');
    test.info().annotations.push({ type: 'engine', description: browserName });
  });
});
