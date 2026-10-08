/**
 * Section: Boundary — Search Input
 * Business Rule(s): BR4
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: search-algo.js:1270-1289
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-078–TC-080
 */
import { test, expect } from '../../fixtures/customFixtures';
import { triggerAndCaptureAlert } from '../../utils/waitHelpers';

test.describe('Boundary — Search Input', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.setup();
  });

  test('TC-078: Valid term with one extra character does not return results', async ({ homePage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('Shoess'));
    // Source: search-algo.js:1273-1275 — prefix match uses str.length; "Shoess" (6 chars)
    // vs. category "Shoes" (5 chars) substring(0,6) can never equal a 6-char string.
    expect(message).toBe('Product not Found');
  });

  test('TC-079: Valid term with a trailing space does not return results', async ({ homePage, page }) => {
    const message = await triggerAndCaptureAlert(page, () => homePage.navbar.search('Shoes '));
    expect(message).toBe('Product not Found');
  });

  test('TC-080: Lowercase variant incorrectly treated as an exact match (discrepancy)', async ({ homePage, page }) => {
    const upper = await triggerAndCaptureAlert(page, () => homePage.navbar.search('Shoes'));
    await homePage.setup();
    const lower = await triggerAndCaptureAlert(page, () => homePage.navbar.search('shoes'));
    // Discrepancy: search-algo.js:1273-1275 uses .toUpperCase() on both sides, so the
    // match is case-insensitive — contradicting BR4's "exact" wording. Both alerts report
    // an identical match count.
    expect(lower).toBe(upper);
  });
});
