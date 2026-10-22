/**
 * Section: Logo
 * Business Rule(s): BR1, BR7
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source) + Mode B (live, this session — see pages/NavbarComponent.ts)
 * Source files analysed: navbar.js:1-51,88-90; index.html:15; about-us.html; mens.html:17
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-011–TC-015
 */
import { test, expect } from '../../fixtures/customFixtures';
import { clearAllStorage, seedLoginStatus, seedUserdata, seedNow } from '../../utils/storageHelpers';
import { gotoPath } from '../../utils/navigationHelpers';
import { makeAccount } from '../../test-data/testData';

// pages/NavbarComponent.ts's underlying gotoPath() intercepts external image requests
// (incl. the Logo's i.postimg.cc src) with a local placeholder, so `.wth`'s width:auto
// resolves to a stable loaded box immediately — no external-network dependency here.

test.describe('Logo', () => {
  test('TC-011: Logo click returns home', async ({ navbar, page }) => {
    await clearAllStorage(page);
    await gotoPath(page, '/about-us.html');
    await navbar.clickLogo();
    // Source: navbar.js:88-90 — homePage() sets window.location.href = 'index.html'
    await expect(page).toHaveURL(/\/index\.html$/);
  });

  test('TC-012: Logo renders/functions identically across pages and login states', async ({ navbar, page }) => {
    const paths = ['/index.html', '/about-us.html', '/mens.html'];

    await clearAllStorage(page);
    for (const path of paths) {
      await gotoPath(page, path);
      await expect(navbar.logo).toBeVisible();
      await navbar.clickLogo();
      await expect(page).toHaveURL(/\/index\.html$/);
    }

    await seedUserdata(page, [makeAccount('Jane Doe', { Email: 'jane.doe@test.com', Password: 'Secure@123' })]);
    await seedLoginStatus(page, true);
    for (const path of paths) {
      await gotoPath(page, path);
      await expect(navbar.logo).toBeVisible();
      await navbar.clickLogo();
      await expect(page).toHaveURL(/\/index\.html$/);
    }
  });

  test('TC-013: Logo survives logout', async ({ homePage, navbar, page }) => {
    // No clearAllStorage() here: it seeds via addInitScript, which would re-fire on
    // this test's own reload and wipe out the one-shot seed below. Each Playwright test
    // already starts with a fresh, storage-empty browser context.
    await homePage.setup();
    // seedNow (one-shot page.evaluate, not addInitScript): this test's own Steps reload
    // the page via logout(), and a persistent addInitScript would re-seed
    // loginStatus=true on that reload, masking the very transition under test.
    await seedNow(page, { userdata: [makeAccount('Jane Doe', { Email: 'jane.doe@test.com', Password: 'Secure@123' })], loginStatus: true });
    await homePage.reload();
    await expect(navbar.logOutButton).toBeVisible();

    // Source: navbar.js:16-18,52-55 — Log Out div → logout() → loginStatus=false, reload()
    await navbar.logOut();
    await expect(navbar.guestSignInButton).toBeVisible();

    await navbar.clickLogo();
    await expect(page).toHaveURL(/\/index\.html$/);
  });

  test('TC-014: Logo survives a hard cache/localStorage clear', async ({ homePage, navbar, page }) => {
    await homePage.setup();
    // Same one-shot-seed rationale as TC-013 — this test's own Steps clear storage and
    // reload, which a persistent addInitScript-based seed would silently undo.
    await seedNow(page, { userdata: [makeAccount('Jane Doe', { Email: 'jane.doe@test.com', Password: 'Secure@123' })], loginStatus: true });
    await homePage.reload();
    await expect(navbar.logOutButton).toBeVisible();

    await page.evaluate(() => window.localStorage.clear());
    await homePage.reload();

    // Source: navbar.js:1,36-51 — login_status re-read as false → guest branch rendered
    await expect(navbar.guestSignInButton).toBeVisible();
    await expect(navbar.guestSignUpButton).toBeVisible();

    await navbar.clickLogo();
    await expect(page).toHaveURL(/\/index\.html$/);
  });

  test('TC-015: Logo across 3 automatable browser engines (Chrome/Edge≈Chromium, Firefox, Safari≈WebKit)', async ({ homePage, navbar, page, browserName }) => {
    // The register's 5 named environments (Chrome/Edge/Firefox/Safari/incognito) map onto
    // this project matrix: chromium≈Chrome/Edge, firefox, webkit≈Safari (see playwright.config.ts
    // comment — WebKit is the closest automatable stand-in for Safari, not Safari itself).
    // "Incognito" is inherent to every test here: Playwright gives each test a fresh,
    // storage-isolated browser context by default.
    await clearAllStorage(page);
    await homePage.setup();
    await expect(navbar.logo).toBeVisible();
    await navbar.clickLogo();
    await expect(page).toHaveURL(/\/index\.html$/);
    test.info().annotations.push({ type: 'engine', description: browserName });
  });
});
