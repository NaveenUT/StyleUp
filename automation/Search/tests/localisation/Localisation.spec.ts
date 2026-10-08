/**
 * Section: Localisation
 * Test Case IDs covered: TC-099, TC-100, TC-101
 * Business Rule(s): Unmapped (no stating rule for Localisation, per the register's own text)
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — search.js:19-20, literal "Rs. "+price string
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { boundaryProducts } from '../../test-data/testData';

test.describe('Localisation', () => {
  test('TC-099: Currency symbol and format are hardcoded, non-locale-aware @styleup @regression @smoke', async ({ page, searchResultsPage }) => {
    const product = { ...boundaryProducts.normalName, price: 1499 };
    await seedSearchData(page, [product]);
    await searchResultsPage.reload();

    const priceText = await searchResultsPage.tilePriceRawText(0);
    // Reads as the literal hardcoded string "Rs. " + price — no Intl.NumberFormat/
    // toLocaleString, no thousands separator, symbol fixed regardless of locale.
    expect(priceText).toBe('Rs. 1499');
  });

  test('TC-100: Price sort operates on the numeric value, not the formatted currency string (compliant) @styleup @regression', async ({ page, searchResultsPage }) => {
    const threeDigit = { ...boundaryProducts.normalName, name: 'Three Digit Item', price: 899 };
    const fourDigit = { ...boundaryProducts.leadingDigitName, name: 'Four Digit Item', price: 1499 };
    await seedSearchData(page, [fourDigit, threeDigit]);
    await searchResultsPage.reload();

    await test.step('Apply "Low to High"', () => searchResultsPage.selectSortByPrice('ascending'));

    const prices = await searchResultsPage.getAllTilePrices();
    expect(prices).toEqual([899, 1499]); // correct NUMERIC order, not string order ("1499" < "899" as strings)
  });

  test('TC-101: No thousands separator is applied to a 4+ digit price @styleup @regression', async ({ page, searchResultsPage }) => {
    const product = { ...boundaryProducts.normalName, price: 1499 };
    await seedSearchData(page, [product]);
    await searchResultsPage.reload();

    const priceText = await searchResultsPage.tilePriceRawText(0);
    expect(priceText).toBe('Rs. 1499');
    expect(priceText).not.toContain(',');
  });
});
