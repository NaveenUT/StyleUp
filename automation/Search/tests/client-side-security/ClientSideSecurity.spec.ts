/**
 * Section: Client-Side Security
 * Test Case IDs covered: TC-088, TC-089, TC-090
 * Business Rule(s): BR11
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:14-15 (des.innerText=ele.name)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData, seedCartData } from '../../utils/storageHelpers';
import { boundaryProducts, outOfRangeCartEntry } from '../../test-data/testData';

test.describe('Client-Side Security', () => {
  test('TC-088: Product name is safely rendered via innerText, not vulnerable to injection (compliant) @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [boundaryProducts.scriptPayloadName]);
    await searchResultsPage.reload();

    await test.step('Trigger a re-render (apply any sort)', () => searchResultsPage.selectSortByName('ascending'));

    // des.innerText = ele.name (search.js:15) sets text content, not HTML — the payload
    // renders as literal visible text, not executed markup.
    const renderedName = await test.step('Inspect the rendered tile', () => searchResultsPage.getTileName(0));
    expect(renderedName).toBe(boundaryProducts.scriptPayloadName.name);
    const html = await searchResultsPage.getHtmlSource();
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  test('TC-089: A hand-edited cartData entry is accepted without validation on the Cart page (defect, cross-referenced) @styleup @regression', async ({ page, cartPage }) => {
    await seedCartData(page, [outOfRangeCartEntry]);
    await test.step('Navigate to cart.html and observe', () => cartPage.setup());

    // Per reasonable expectation, an out-of-range value should be rejected or clamped.
    // Record actual behavior — expected to FAIL, log as a defect: cart.html accepts and
    // displays the hand-edited entry with no validation of any kind.
    expect(await cartPage.getLineItemCount()).toBe(1);
  });

  test('TC-090: Guest console error is reproducible and does not leak sensitive detail beyond the stack trace itself @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [boundaryProducts.normalName]);
    const getErrors = searchResultsPage.collectPageErrors();

    await test.step('Trigger the Finding-7 error (page load as guest)', () => searchResultsPage.setup());

    const errors = getErrors();
    expect(errors.length).toBeGreaterThan(0);
    // A generic TypeError with a file/line reference to search.js — no credential or
    // storage content included in the error text itself. (This page also throws a
    // second, separate SyntaxError from the searchArr redeclaration — see
    // SearchResultsPage.ts's header — so Finding 7's error is located by content, not
    // by assuming it's first.)
    const finding7Error = errors.find((e) => e.includes('Cannot set properties of null'));
    expect(finding7Error).toBeDefined();
    expect(finding7Error).not.toMatch(/@test\.com|Password|loginStatus/i);
  });
});
