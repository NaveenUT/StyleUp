/**
 * Section: Search
 * Business Rule(s): BR4, BR8
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source), live-verified this session for the
 *   TC-009 native `change`-event commit semantics (see comment on TC-009 below).
 * Source files analysed: search-algo.js:1263-1289, index.html:25
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-003–TC-010
 */
import { test, expect } from '../../fixtures/customFixtures';
import { triggerAndCaptureAlert } from '../../utils/waitHelpers';
import { clearAllStorage } from '../../utils/storageHelpers';

test.describe('Search', () => {
  test.beforeEach(async ({ homePage, page }) => {
    await clearAllStorage(page);
    await homePage.setup();
  });

  test('TC-003: Valid, complete term returns results', async ({ homePage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('Shoes'));
    // Source: search-algo.js:1282 — alert(`${filteredlist.length} no. of products found`)
    expect(message).toMatch(/^\d+ no\. of products found$/);
    // Source: search-algo.js:1285 — window.location.href="search.html"
    await expect(page).toHaveURL(/\/search\.html$/);
  });

  test('TC-004: Half/partial term incorrectly accepted (defect)', async ({ homePage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('Sho'));
    // Defect: prefix-length match (search-algo.js:1273-1275) treats "Sho" as matching the
    // "Sho" prefix of category "Shoes" — contradicts BR4's "exact term" expectation.
    expect(message).toMatch(/^\d+ no\. of products found$/);
    await expect(page).toHaveURL(/\/search\.html$/);
  });

  test('TC-005: Alphanumeric text correctly rejected', async ({ homePage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('Shoe99'));
    expect(message).toBe('Product not Found');
    await expect(page).toHaveURL(/\/index\.html$/);
  });

  test('TC-006: Purely numeric text correctly rejected', async ({ homePage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('12345'));
    expect(message).toBe('Product not Found');
  });

  test('TC-007: Spaces-only text correctly rejected', async ({ homePage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('   '));
    expect(message).toBe('Product not Found');
  });

  test('TC-008: Internal-spaces text correctly rejected', async ({ homePage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('Sho es'));
    expect(message).toBe('Product not Found');
  });

  test('TC-009: Empty submission incorrectly accepted (defect)', async ({ homePage, page }) => {
    // ⚠ Native-behaviour note (live-verified this session, not assumed): the browser's
    // `change` event fires only when the value at blur differs from the value at focus-IN
    // time. A single focus→type-'x'→Backspace→blur cycle ends back at "" (same as focus-in
    // value ""), so no `change` fires at all — confirmed live via a throwaway probe test.
    // The register's Step ("Type a char, delete it, commit") is reproduced faithfully as
    // TWO separate commit cycles instead: commit 'x' first (its own focus→blur), THEN a
    // second focus→Backspace→blur cycle whose start value is 'x' and end value is "" — this
    // second cycle's value genuinely changed, so `change` DOES fire with the empty string.
    const searchBar = homePage.navbar.searchBar;
    let firstMessage = '';
    page.once('dialog', (dialog) => { firstMessage = dialog.message(); void dialog.accept(); });
    await searchBar.click();
    await searchBar.type('x');
    await searchBar.press('Tab');
    expect(firstMessage).toBe('Product not Found');

    const message = await triggerAndCaptureAlert(page, async () => {
      await searchBar.click();
      await searchBar.press('Backspace');
      await searchBar.press('Tab');
    });
    // Defect: search-algo.js:1273-1275 — an empty str.substring(0,0) is "" for every product,
    // so every item in `final` matches and the alert reports the full catalog "found".
    expect(message).toMatch(/^\d+ no\. of products found$/);
    await expect(page).toHaveURL(/\/search\.html$/);
  });

  test('TC-010: Placeholder text when empty', async ({ homePage }) => {
    // Raw source: <input type="text" name="search" id="search-bar" placeholder="Search for products, brands & more">
    // [SOURCE VERIFIED] file: index.html:25 | attribute: placeholder="Search for products, brands & more"
    // Pre-condition: none
    await expect(homePage.navbar.searchBar).toHaveAttribute('placeholder', 'Search for products, brands & more');
  });
});
