/**
 * Section: Accessibility — Page Title & Structure (WCAG 2.4.2, 1.3.1)
 * Test Case IDs covered: TC-120, TC-121
 * Business Rule(s): BR16(f)
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — cross-referenced with SEO section
 */
import { test, expect } from '../../fixtures/customFixtures';
import { searchTerms } from '../../test-data/testData';

test.describe('Accessibility — Page Title & Structure', () => {
  test('TC-120: Page title is non-descriptive and identical regardless of search term (defect, cross-referenced with SEO) @styleup @regression @smoke', async ({ homePage }) => {
    const { resultsPage: r1 } = await test.step('Read <title> for search "Shoes"', () => homePage.searchAndGoToResults(searchTerms.shoes));
    const title1 = await r1.getTitle();

    await homePage.setup();
    const { resultsPage: r2 } = await test.step('Read <title> for a different search', () => homePage.searchAndGoToResults('Nike'));
    const title2 = await r2.getTitle();

    // Both read the same static "styleup For Kids" — fails WCAG 2.4.2's "descriptive" requirement.
    expect(title1).toBe('styleup For Kids');
    expect(title2).toBe(title1);
  });

  test('TC-121: No <h1> exists in the live heading hierarchy (defect) @styleup @regression', async ({ homePage }) => {
    const { resultsPage } = await homePage.searchAndGoToResults(searchTerms.shoes);
    expect(await resultsPage.h1Elements.count()).toBe(0);
  });
});
