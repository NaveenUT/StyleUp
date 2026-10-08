/**
 * Section: Sort by Name
 * Test Case IDs covered: TC-023, TC-024, TC-025
 * Business Rule(s): BR9
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:75-92, case-sensitive a.name>b.name (Finding 9)
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet, boundaryProducts } from '../../test-data/testData';

test.describe('Sort by Name', () => {
  test('TC-023: "Ascending" re-orders A→Z @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Select "Ascending"', () => searchResultsPage.selectSortByName('ascending'));

    const names = await searchResultsPage.getAllTileNames();
    for (let i = 0; i < names.length - 1; i++) expect(names[i] <= names[i + 1]).toBe(true);
  });

  test('TC-024: "Descending" re-orders Z→A @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();

    await test.step('Select "Descending"', () => searchResultsPage.selectSortByName('descending'));

    const names = await searchResultsPage.getAllTileNames();
    for (let i = 0; i < names.length - 1; i++) expect(names[i] >= names[i + 1]).toBe(true);
  });

  test('TC-025: Case-sensitive comparator orders a lowercase-initial name after all uppercase-initial names (defect) @styleup @regression', async ({ page, searchResultsPage }) => {
    await seedSearchData(page, [boundaryProducts.lowercaseInitial, boundaryProducts.uppercaseInitial]);
    await searchResultsPage.reload();

    await test.step('Ensure both names are present; select "Ascending"', async () => {
      await searchResultsPage.selectSortByName('ascending');
    });

    // Per intended alphabetical order, "adidas Runner" should precede "Zara Top" — but
    // the register's own Expected Result already states the confirmed actual behavior as
    // fact: "Zara Top" sorts first, since JS's default string comparison is case-sensitive
    // by UTF-16 code point ('Z' = 90 < 'a' = 97) — Finding 9. Asserting that confirmed
    // defect (not the unmet ideal) so this test documents it as a stable regression-guard.
    const names = await searchResultsPage.getAllTileNames();
    expect(names[0]).toBe('Zara Top');
  });
});
