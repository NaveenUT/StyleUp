import { Page } from '@playwright/test';
import { Product, Account, CartRecord } from '../test-data/testData';

/**
 * Client-storage seed/read helpers. Placement note: the mandated structure lists
 * `utils/config.ts` and `utils/waitHelpers.ts` explicitly; this file is an additional,
 * minimal file inside the ALREADY-mandated `utils/` folder (not a new top-level folder)
 * for the one concern neither of those two owns — seeding/reading the storage schema
 * that PRECONDITIONS depend on. See SOURCE_CODE_INVENTORY.md for the schema citations.
 *
 * Precondition-seeding rule (from the conversion protocol): permitted for PRECONDITIONS
 * only — never to satisfy a Step or an Expected Result, and never for a test case whose
 * own Steps exercise the sign-in/registration flow.
 */

// Schema source: search-algo.js:1284 / search.js:1 — localStorage 'searchData', JSON array of product objects
export async function seedSearchData(page: Page, products: Product[]): Promise<void> {
  await page.addInitScript((data) => {
    window.localStorage.setItem('searchData', JSON.stringify(data));
  }, products);
}

// Schema source: signup.html:77 (writer) / signin.html:53 (reader) — {name, Email, Password}[]
export async function seedUserdata(page: Page, accounts: Account[]): Promise<void> {
  await page.addInitScript((data) => {
    window.localStorage.setItem('userdata', JSON.stringify(data));
  }, accounts);
}

// Schema source: signin.html:75 — bare boolean, coerced to the string "true"/"false"
export async function seedLoginStatus(page: Page, value: boolean): Promise<void> {
  await page.addInitScript((v) => {
    window.localStorage.setItem('loginStatus', String(v));
  }, value);
}

// Schema source: mens.js/cart.html — JSON array of {image_url,name,price,cartprice,quantity}
export async function seedCartData(page: Page, items: CartRecord[]): Promise<void> {
  await page.addInitScript((data) => {
    window.localStorage.setItem('cartData', JSON.stringify(data));
  }, items);
}

export async function clearAllStorage(page: Page): Promise<void> {
  await page.addInitScript(() => window.localStorage.clear());
}

export interface SeedNowValues {
  searchData?: Product[];
  loginStatus?: boolean;
  userdata?: Account[];
  cartData?: CartRecord[];
}

/**
 * One-shot precondition seed via page.evaluate (NOT addInitScript) — required whenever
 * a test's own Steps reload/navigate in a way that must be inspected afterward (cart
 * removal, hard storage clear). An addInitScript-based seed re-fires on every
 * subsequent navigation within the SAME page and silently reverts exactly the
 * transition such a test is trying to observe. Requires the page to have already
 * navigated once (localStorage needs an origin).
 */
export async function seedNow(page: Page, values: SeedNowValues): Promise<void> {
  await page.evaluate((v) => {
    if (v.searchData !== undefined) window.localStorage.setItem('searchData', JSON.stringify(v.searchData));
    if (v.loginStatus !== undefined) window.localStorage.setItem('loginStatus', String(v.loginStatus));
    if (v.userdata !== undefined) window.localStorage.setItem('userdata', JSON.stringify(v.userdata));
    if (v.cartData !== undefined) window.localStorage.setItem('cartData', JSON.stringify(v.cartData));
  }, values);
}

export async function readCartData(page: Page): Promise<CartRecord[]> {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem('cartData') || '[]'));
}

export async function readLoginStatus(page: Page): Promise<string | null> {
  return page.evaluate(() => window.localStorage.getItem('loginStatus'));
}

export async function removeStorageKey(page: Page, key: string): Promise<void> {
  await page.evaluate((k) => window.localStorage.removeItem(k), key);
}

export async function setStorageRaw(page: Page, key: string, value: string): Promise<void> {
  await page.evaluate(({ k, v }) => window.localStorage.setItem(k, v), { k: key, v: value });
}
