import { config } from '../utils/config';

/**
 * Test input data — nothing here is a locator or a page action; every value a spec
 * file needs (search terms, seeded product fixtures, accounts, cart edge cases) lives
 * here, referenced by name, never inlined in a spec file per the framework's own rule.
 */

export const searchTerms = {
  boys: 'Boys',
  girls: 'Girls',
  shoes: 'Shoes',
  nonMatching: 'Zzzznomatchxyz',
};

export interface Product {
  name: string;
  brand: string;
  gender: string;
  category: string;
  price: number;
  strikedoffprice: number;
  discount: number;
  image_url: string;
}

/**
 * A small, deterministic product set used ONLY for the boundary/recovery/security test
 * cases whose own Test Data column licenses seeding/simulating via DevTools (TC-025,
 * TC-056–058, TC-062, TC-064, TC-065, TC-088) — every other test case searches the REAL
 * catalog live through HomePage.search(), per the register's own Steps ("From
 * index.html, search '<term>'"), not this fixture.
 */
export const boundaryProducts: Record<string, Product> = {
  // Exactly at the 20% discount threshold: (200*100)/1000 = 20
  atTwentyPercent: {
    name: 'Boundary Shirt At20', brand: 'Nike', gender: 'Boys', category: 'Shirts',
    price: 800, strikedoffprice: 1000, discount: 200,
    image_url: 'https://example.test/at20.jpg',
  },
  // Just below: (190*100)/1000 = 19
  belowTwentyPercent: {
    name: 'Boundary Shirt Below20', brand: 'Nike', gender: 'Boys', category: 'Shirts',
    price: 810, strikedoffprice: 1000, discount: 190,
    image_url: 'https://example.test/below20.jpg',
  },
  // Just above: (210*100)/1000 = 21
  aboveTwentyPercent: {
    name: 'Boundary Shirt Above20', brand: 'Nike', gender: 'Boys', category: 'Shirts',
    price: 790, strikedoffprice: 1000, discount: 210,
    image_url: 'https://example.test/above20.jpg',
  },
  // Case-sensitive name-sort pair (TC-025)
  lowercaseInitial: {
    name: 'adidas Runner', brand: 'Addidas', gender: 'Boys', category: 'Shoes',
    price: 1200, strikedoffprice: 1500, discount: 300,
    image_url: 'https://example.test/lowercase.jpg',
  },
  uppercaseInitial: {
    name: 'Zara Top', brand: 'Max', gender: 'Girls', category: 'Tshirts',
    price: 700, strikedoffprice: 900, discount: 200,
    image_url: 'https://example.test/uppercase.jpg',
  },
  // Identical-price pair (TC-062 sort stability)
  samePriceA: {
    name: 'Same Price Item A', brand: 'Polo', gender: 'Boys', category: 'Tshirts',
    price: 600, strikedoffprice: 800, discount: 200,
    image_url: 'https://example.test/samepricea.jpg',
  },
  samePriceB: {
    name: 'Same Price Item B', brand: 'Reebok', gender: 'Boys', category: 'Shoes',
    price: 600, strikedoffprice: 850, discount: 250,
    image_url: 'https://example.test/samepriceb.jpg',
  },
  // Leading-whitespace name (TC-064)
  leadingSpaceName: {
    name: ' Zebra Print Top', brand: 'Trends', gender: 'Girls', category: 'Tshirts',
    price: 500, strikedoffprice: 700, discount: 200,
    image_url: 'https://example.test/leadingspace.jpg',
  },
  // Leading-digit name (TC-065)
  leadingDigitName: {
    name: '3-Pack Socks', brand: 'RedTape', gender: 'Boys', category: 'Shirts',
    price: 300, strikedoffprice: 400, discount: 100,
    image_url: 'https://example.test/leadingdigit.jpg',
  },
  // A normal letter-initial name for TC-064/065 to sort against
  normalName: {
    name: 'Regular Kids Shirt', brand: 'H&M', gender: 'Boys', category: 'Shirts',
    price: 450, strikedoffprice: 600, discount: 150,
    image_url: 'https://example.test/normal.jpg',
  },
  // Script-tag-like name (TC-088, compliant-rendering check)
  scriptPayloadName: {
    name: '<script>alert(1)</script>', brand: 'YK-Disney', gender: 'Girls', category: 'Dresses',
    price: 400, strikedoffprice: 500, discount: 100,
    image_url: 'https://example.test/payload.jpg',
  },
};

export function productList(...keys: (keyof typeof boundaryProducts)[]): Product[] {
  return keys.map((k) => ({ ...boundaryProducts[k] }));
}

/**
 * Deterministic default result set used for Filter/Sort/Brand/Product-Listing/Add-to-Cart
 * sections, seeded directly into `searchData` as the PRECONDITION "on search.html after
 * searching <term>" describes a STATE (populated searchData + being on search.html), which
 * may legitimately be established either by driving a real search or by seeding its result
 * — permitted per the protocol's Precondition-setup rule. All 10 brands appear exactly
 * once each (clean Sort-by-Brand assertions); genders/categories are each covered twice;
 * discount thresholds are deliberately non-uniform (5,15,25,35,45,55,12,22,32,42 %) for
 * unambiguous boundary checks at the 10/20/30/40/50% checkboxes; insertion order matches
 * neither price order nor name order, so a sort actually has to do something observable.
 */
export const defaultResultSet: Product[] = [
  { name: 'Theta Shoe', brand: 'Addidas', gender: 'Girls', category: 'Shoes', price: 400, strikedoffprice: 1000, discount: 220, image_url: 'https://example.test/theta.jpg' },
  { name: 'Alpha Tee', brand: 'US-Polo', gender: 'Boys', category: 'Tshirts', price: 900, strikedoffprice: 1000, discount: 50, image_url: 'https://example.test/alpha.jpg' },
  { name: 'Kappa Kurta', brand: 'RedTape', gender: 'Girls', category: 'Kurta Sets', price: 500, strikedoffprice: 1000, discount: 420, image_url: 'https://example.test/kappa.jpg' },
  { name: 'Beta Shirt', brand: 'Max', gender: 'Girls', category: 'Shirts', price: 300, strikedoffprice: 1000, discount: 150, image_url: 'https://example.test/beta.jpg' },
  { name: 'Iota Dress', brand: 'Reebok', gender: 'Boys', category: 'Dresses', price: 600, strikedoffprice: 1000, discount: 320, image_url: 'https://example.test/iota.jpg' },
  { name: 'Zeta Tee', brand: 'Nike', gender: 'Girls', category: 'Tshirts', price: 100, strikedoffprice: 1000, discount: 550, image_url: 'https://example.test/zeta.jpg' },
  { name: 'Gamma Shoe', brand: 'YK-Disney', gender: 'Boys', category: 'Shoes', price: 700, strikedoffprice: 1000, discount: 250, image_url: 'https://example.test/gamma.jpg' },
  { name: 'Eta Shirt', brand: 'Polo', gender: 'Boys', category: 'Shirts', price: 800, strikedoffprice: 1000, discount: 120, image_url: 'https://example.test/eta.jpg' },
  { name: 'Delta Dress', brand: 'H&M', gender: 'Girls', category: 'Dresses', price: 200, strikedoffprice: 1000, discount: 350, image_url: 'https://example.test/delta.jpg' },
  { name: 'Epsilon Kurta', brand: 'Trends', gender: 'Boys', category: 'Kurta Sets', price: 1000, strikedoffprice: 1000, discount: 450, image_url: 'https://example.test/epsilon.jpg' },
];

export interface Account {
  name: string;
  Email: string;
  Password: string;
}

/** Backed by APP_USERNAME/APP_PASSWORD in .env — never hardcoded here. */
export const existingAccount: Account = {
  name: 'Search Suite Tester',
  Email: config.appUsername,
  Password: config.appPassword,
};

export interface CartRecord {
  image_url: string;
  name: string;
  price: number;
  cartprice: number;
  quantity: number;
}

/** TC-089 — a hand-edited, out-of-range cart entry (negative price, absurd quantity). */
export const outOfRangeCartEntry: CartRecord = {
  image_url: 'https://example.test/outofrange.jpg',
  name: 'Out Of Range Product',
  price: -500,
  cartprice: -500 * 999,
  quantity: 999,
};
