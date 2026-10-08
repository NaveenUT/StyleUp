/**
 * Section: SEO & Discoverability
 * Test Case IDs covered: TC-102, TC-103, TC-104, TC-105
 * Business Rule(s): BR15
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet, searchTerms } from '../../test-data/testData';

test.describe('SEO & Discoverability', () => {
  test('TC-102: Page title is static and non-descriptive of the actual search performed (defect) @styleup @regression @smoke', async ({ homePage }) => {
    const { resultsPage: r1 } = await test.step('Search "Shoes"; read <title>', () => homePage.searchAndGoToResults(searchTerms.shoes));
    const title1 = await r1.getTitle();

    await homePage.setup();
    const { resultsPage: r2 } = await test.step('Search "Nike"; read <title>', () => homePage.searchAndGoToResults('Nike'));
    const title2 = await r2.getTitle();

    expect(title1).toBe('styleup For Kids');
    expect(title2).toBe('styleup For Kids');
    expect(title1).toBe(title2);
  });

  test('TC-103: No meta description, canonical, or robots directive exists @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    expect(await searchResultsPage.hasMetaDescription()).toBe(false);
    expect(await searchResultsPage.hasCanonicalLink()).toBe(false);
    expect(await searchResultsPage.hasRobotsMeta()).toBe(false);
  });

  test('TC-104: No <h1> exists; a prior one was removed (finding) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    expect(await searchResultsPage.h1Elements.count()).toBe(0);
    // The commented-out heading confirms one existed and was removed. Comments are
    // stripped from the live DOM's outerHTML, so this is read from the raw response body.
    const rawHtml = await (await page.request.get('search.html')).text();
    expect(rawHtml).toContain('<!-- <div id="heading"><h1>Kids Products</h1></div> -->');
  });

  test('TC-105: Product tiles are not crawlable anchors (defect) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.reload();

    expect(await searchResultsPage.tileHasWrappingAnchor(0)).toBe(false);
  });
});
