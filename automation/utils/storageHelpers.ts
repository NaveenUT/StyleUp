import { Page } from '@playwright/test';

/**
 * Deterministic PRECONDITION seeding, using the exact storage keys/shapes read from
 * source (see SOURCE_CODE_INVENTORY.md → Storage schema). Per the Phase 2 conversion
 * protocol's "Precondition Setup From Source" section:
 *   - Permitted for PRECONDITIONS only — never to satisfy a Step or an Expected Result.
 *   - Never used for a test case whose own Steps exercise sign-in/sign-up — those run
 *     through the real UI in every such spec file.
 */

export interface UserRecord {
  name: string;
  Email: string;
  Password: string;
}

export interface CartRecord {
  image_url: string;
  name: string;
  price: number;
  cartprice: number;
  quantity: number;
}

// Schema source: signup.html:61-65 (writer) / signin.html:53,62-63 (reader) — {name, Email, Password}
export async function seedUserdata(page: Page, users: UserRecord[]): Promise<void> {
  await page.addInitScript((data) => {
    window.localStorage.setItem('userdata', JSON.stringify(data));
  }, users);
}

// Schema source: signin.html:75 — localStorage.setItem("loginStatus", true) (bare boolean, coerced to "true")
export async function seedLoginStatus(page: Page, value: boolean): Promise<void> {
  await page.addInitScript((v) => {
    window.localStorage.setItem('loginStatus', String(v));
  }, value);
}

// Schema source: cart.html:61,124,128,135,142 — JSON array of item records with a `quantity` field
export async function seedCartData(page: Page, items: CartRecord[]): Promise<void> {
  await page.addInitScript((data) => {
    window.localStorage.setItem('cartData', JSON.stringify(data));
  }, items);
}

// Schema source: signin.html:56,64-65 — JSON array of full {name, Email, Password} records
export async function seedLogginName(page: Page, records: UserRecord[]): Promise<void> {
  await page.addInitScript((data) => {
    window.localStorage.setItem('logginName', JSON.stringify(data));
  }, records);
}

export async function clearAllStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
}

export interface SeedNowValues {
  loginStatus?: boolean;
  userdata?: UserRecord[];
  cartData?: CartRecord[];
  logginName?: UserRecord[];
}

/**
 * One-shot precondition seed via page.evaluate (NOT addInitScript) — for any test whose
 * own Steps reload/navigate in a way that must be inspected afterward (logout, cart
 * removal, hard storage clear, etc.). An addInitScript-based seed re-fires on every
 * subsequent navigation within the SAME page and silently reverts exactly the
 * transition such a test is trying to observe (first live-diagnosed against
 * TC-013/TC-014 and TC-016 during the original build of this suite).
 * Requires the page to have already navigated once (localStorage needs an origin).
 */
export async function seedNow(page: Page, values: SeedNowValues): Promise<void> {
  await page.evaluate((v) => {
    if (v.loginStatus !== undefined) window.localStorage.setItem('loginStatus', String(v.loginStatus));
    if (v.userdata !== undefined) window.localStorage.setItem('userdata', JSON.stringify(v.userdata));
    if (v.cartData !== undefined) window.localStorage.setItem('cartData', JSON.stringify(v.cartData));
    if (v.logginName !== undefined) window.localStorage.setItem('logginName', JSON.stringify(v.logginName));
  }, values);
}
