/**
 * Section: Filter Section
 * Test Case IDs covered: TC-007–TC-020
 * Business Rule(s): BR2
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source)
 *
 * Ground truth: search.js never renders a tile's gender/category (only name, brand,
 * price, discount are shown — search.js:8-38), so "every rendered tile's underlying
 * gender/category is X" is verified here by comparing the rendered NAME set against the
 * known name→gender/category/discount mapping of the seeded `defaultResultSet` fixture
 * (test-data/testData.ts), rather than reading a DOM attribute that does not exist.
 */
import { test, expect } from '../../fixtures/customFixtures';
import { seedSearchData } from '../../utils/storageHelpers';
import { defaultResultSet } from '../../test-data/testData';

const BOYS = ['Alpha Tee', 'Iota Dress', 'Gamma Shoe', 'Eta Shirt', 'Epsilon Kurta'];
const GIRLS = ['Theta Shoe', 'Kappa Kurta', 'Beta Shirt', 'Zeta Tee', 'Delta Dress'];
const TSHIRTS = ['Alpha Tee', 'Zeta Tee'];
const SHIRTS = ['Beta Shirt', 'Eta Shirt'];
const SHOES = ['Theta Shoe', 'Gamma Shoe'];
const DRESSES = ['Iota Dress', 'Delta Dress'];
const KURTA_SETS = ['Kappa Kurta', 'Epsilon Kurta'];
const ALL_NAMES = defaultResultSet.map((p) => p.name);
const GE_10 = ['Theta Shoe', 'Kappa Kurta', 'Beta Shirt', 'Iota Dress', 'Zeta Tee', 'Gamma Shoe', 'Eta Shirt', 'Delta Dress', 'Epsilon Kurta'];
const GE_20 = ['Theta Shoe', 'Kappa Kurta', 'Iota Dress', 'Zeta Tee', 'Gamma Shoe', 'Delta Dress', 'Epsilon Kurta'];
const GE_30 = ['Kappa Kurta', 'Iota Dress', 'Zeta Tee', 'Delta Dress', 'Epsilon Kurta'];
const GE_40 = ['Kappa Kurta', 'Zeta Tee', 'Epsilon Kurta'];
const GE_50 = ['Zeta Tee'];

async function names(sp: { getAllTileNames(): Promise<string[]> }): Promise<Set<string>> {
  return new Set(await sp.getAllTileNames());
}

test.describe('Filter Section', () => {
  test.beforeEach(async ({ page, searchResultsPage }) => {
    await seedSearchData(page, defaultResultSet);
    await searchResultsPage.reload();
  });

  test('TC-007: GENDER "Boys" checkbox filters correctly @styleup @regression @smoke', async ({ searchResultsPage }) => {
    await test.step('Check "Boys"', () => searchResultsPage.checkGender('Boys'));
    await test.step('Inspect every rendered tile', async () => {
      expect(await names(searchResultsPage)).toEqual(new Set(BOYS));
    });
  });

  test('TC-008: GENDER "Girls" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check "Girls"', () => searchResultsPage.checkGender('Girls'));
    expect(await names(searchResultsPage)).toEqual(new Set(GIRLS));
  });

  test('TC-009: CATEGORIES "Tshirts" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check "Tshirts"', () => searchResultsPage.checkCategory('Tshirts'));
    expect(await names(searchResultsPage)).toEqual(new Set(TSHIRTS));
  });

  test('TC-010: CATEGORIES "Shirts" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check "Shirts"', () => searchResultsPage.checkCategory('Shirts'));
    expect(await names(searchResultsPage)).toEqual(new Set(SHIRTS));
  });

  test('TC-011: CATEGORIES "Shoes" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check "Shoes"', () => searchResultsPage.checkCategory('Shoes'));
    expect(await names(searchResultsPage)).toEqual(new Set(SHOES));
  });

  test('TC-012: CATEGORIES "Dresses" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check "Dresses"', () => searchResultsPage.checkCategory('Dresses'));
    expect(await names(searchResultsPage)).toEqual(new Set(DRESSES));
  });

  test('TC-013: CATEGORIES "Kurta Sets" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check "Kurta Sets"', () => searchResultsPage.checkCategory('Kurta Sets'));
    expect(await names(searchResultsPage)).toEqual(new Set(KURTA_SETS));
  });

  test('TC-014: Discount ">10% off" checkbox filters correctly (inclusive threshold) @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check ">10% off"', () => searchResultsPage.checkDiscount('10'));
    expect(await names(searchResultsPage)).toEqual(new Set(GE_10));
  });

  test('TC-015: Discount ">20% off" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check ">20% off"', () => searchResultsPage.checkDiscount('20'));
    expect(await names(searchResultsPage)).toEqual(new Set(GE_20));
  });

  test('TC-016: Discount ">30% off" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check ">30% off"', () => searchResultsPage.checkDiscount('30'));
    expect(await names(searchResultsPage)).toEqual(new Set(GE_30));
  });

  test('TC-017: Discount ">40% off" checkbox filters correctly @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check ">40% off"', () => searchResultsPage.checkDiscount('40'));
    expect(await names(searchResultsPage)).toEqual(new Set(GE_40));
  });

  test('TC-018: Discount ">50% off" is a subset of ">10% off" (cumulative-threshold behavior) @styleup @regression', async ({ searchResultsPage }) => {
    const fiftySet = await test.step('Check ">50% off"; note the resulting product set', async () => {
      await searchResultsPage.checkDiscount('50');
      return names(searchResultsPage);
    });
    const tenSet = await test.step('Uncheck it, check ">10% off" instead', async () => {
      await searchResultsPage.uncheckDiscount('50');
      await searchResultsPage.checkDiscount('10');
      return names(searchResultsPage);
    });
    for (const n of fiftySet) expect(tenSet.has(n)).toBe(true);
    expect(fiftySet).toEqual(new Set(GE_50));
  });

  test('TC-019: Unchecking a checkbox restores the full list regardless of other checked boxes (defect) @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check "Boys"', () => searchResultsPage.checkGender('Boys'));
    await test.step('Check "Tshirts" (discards Boys\' filter)', () => searchResultsPage.checkCategory('Tshirts'));
    await test.step('Uncheck "Tshirts"', () => searchResultsPage.uncheckCategory('Tshirts'));

    // Defect: the full unfiltered searchArr is shown, ignoring that "Boys" is still
    // visually checked — it does not fall back to re-applying Boys' filter (Finding 4).
    expect(await names(searchResultsPage)).toEqual(new Set(ALL_NAMES));
    expect(await searchResultsPage.isGenderChecked('Boys')).toBe(true);
  });

  test('TC-020: Cross-group checkbox combination — visual state contradicts applied filter (Table B, row 3) @styleup @regression', async ({ searchResultsPage }) => {
    await test.step('Check "Girls"; confirm Girls-filtered tiles render', async () => {
      await searchResultsPage.checkGender('Girls');
      expect(await names(searchResultsPage)).toEqual(new Set(GIRLS));
    });
    await test.step('Check "Dresses" without unchecking "Girls"', () => searchResultsPage.checkCategory('Dresses'));

    // Both checkboxes show checked, but only Dresses-filtered tiles render.
    expect(await searchResultsPage.isGenderChecked('Girls')).toBe(true);
    expect(await searchResultsPage.isCategoryChecked('Dresses')).toBe(true);
    expect(await names(searchResultsPage)).toEqual(new Set(DRESSES));
  });
});
