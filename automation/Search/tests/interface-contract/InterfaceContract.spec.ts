/**
 * Section: Interface Contract (Search Parameter & Client Storage Schema)
 * Test Case IDs covered: TC-106, TC-107
 * Business Rule(s): BR13
 * Target website: http://localhost:5501/search.html
 * Date generated: 2026-08-06
 * Verification mode(s) used: Mode A (source) — grep steps executed live via HTTP fetch
 *   of the raw served files, not merely read once and hardcoded as a comment
 */
import type { APIRequestContext } from '@playwright/test';
import { test, expect } from '../../fixtures/customFixtures';
import { seedUserdata, seedLoginStatus, seedSearchData, readCartData } from '../../utils/storageHelpers';
import { defaultResultSet, existingAccount } from '../../test-data/testData';
import { config } from '../../utils/config';

async function fetchSource(request: APIRequestContext, file: string): Promise<string> {
  const res = await request.get(new URL(file, config.baseUrl).toString());
  return res.text();
}

test.describe('Interface Contract (Search Parameter & Client Storage Schema)', () => {
  test('TC-106: searchData — writer/reader agreement @styleup @regression @smoke', async ({ request }) => {
    const writer = await fetchSource(request, 'search-algo.js');
    const reader = await fetchSource(request, 'search.js');

    expect(writer).toContain("localStorage.setItem('searchData'");
    expect(reader).toContain('localStorage.getItem("searchData")');
    // No URL parameter is used at all (Finding 1) — confirmed by grep for location.search/URLSearchParams.
    expect(writer).not.toContain('location.search');
    expect(writer).not.toContain('URLSearchParams');
  });

  test('TC-107: cartData entries written here match the shape cart.html expects @styleup @regression', async ({ page, searchResultsPage, cartPage }) => {
    await seedUserdata(page, [existingAccount]);
    await seedLoginStatus(page, true);
    await seedSearchData(page, [defaultResultSet[0]]);
    await searchResultsPage.setup();

    await searchResultsPage.addToCartByIndex(0);
    const cartData = await readCartData(page);
    expect(cartData[0]).toHaveProperty('name');
    expect(cartData[0]).toHaveProperty('price');
    expect(cartData[0]).toHaveProperty('quantity');
    expect(cartData[0]).toHaveProperty('cartprice');

    await cartPage.setup();
    expect(await cartPage.getLineItemCount()).toBe(1);
  });
});
