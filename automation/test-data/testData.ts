import { UserRecord, CartRecord } from '../utils/storageHelpers';

/**
 * Every Playwright test in this suite gets a fresh, storage-isolated browser context,
 * so accounts don't need to be globally unique across the whole run — but distinct
 * emails per test keep failures easy to diagnose in a shared HTML report. Prefer these
 * factories over ad hoc inline literals when adding new tests.
 */

export function makeAccount(label: string, overrides: Partial<UserRecord> = {}): UserRecord {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '.');
  return {
    name: label,
    Email: `${slug}@test.com`,
    Password: 'Test@1234',
    ...overrides,
  };
}

export const EXISTING_ACCOUNT: UserRecord = { name: 'Jane Doe', Email: 'jane.doe@test.com', Password: 'Secure@123' };

// Raw source: mens.js:1-10 — first 2 entries of the in-memory `mensData` array, used
// wherever a test needs 2 distinct addressable products on mens.html (by index, since
// product cards have no unique per-item id — see pages/MensPage.ts).
export const MENS_PRODUCT_A = "MEN'S REEBOK RUNNING ROADMAP SHOES";
export const MENS_PRODUCT_B = "MEN'S REEBOK SWIM ARUBA FLIP SLIPPERS ";

export function makeCartRecord(overrides: Partial<CartRecord> = {}): CartRecord {
  return {
    image_url: 'https://example.test/placeholder.jpg',
    name: MENS_PRODUCT_A,
    price: 1170,
    cartprice: 1170,
    quantity: 1,
    ...overrides,
  };
}

export const TWO_ITEM_CART: CartRecord[] = [
  makeCartRecord({ name: MENS_PRODUCT_A, price: 1170, cartprice: 1170 }),
  makeCartRecord({ name: MENS_PRODUCT_B, price: 699, cartprice: 699 }),
];

// A payload with no rendering surface anywhere in scope (see client-side-security.spec.ts)
export const XSS_PAYLOAD = '<script>alert(1)</script>';
