import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { triggerAndCaptureAlert } from '../utils/waitHelpers';

export type Gender = 'Boys' | 'Girls';
export type Category = 'Tshirts' | 'Shirts' | 'Shoes' | 'Dresses' | 'Kurta Sets';
export type DiscountThreshold = '10' | '20' | '30' | '40' | '50';
export type SortDirection = '' | 'ascending' | 'descending';
export type Brand = 'US-Polo' | 'Max' | 'YK-Disney' | 'H&M' | 'Trends' | 'Nike' | 'Polo' | 'Addidas' | 'Reebok' | 'RedTape' | '';

/**
 * Page: Search Results (search.html)
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: search.html:1-172 (full), search.js:1-171 (full), navbar.js
 * Pages inspected: none required beyond source (plain static markup + own inline script,
 *   Cross-Check Matrix row 1 — checkboxes/selects are static; product tiles are
 *   `document.createElement` chains read directly from search.js's template, matrix row
 *   "Attribute built inside a JS ... document.createElement chain" → verified from the
 *   TEMPLATE per Step S3, not a rendered guess)
 * Date generated: 2026-08-06
 *
 * ⚠ New finding (this conversion, not in the Phase 1 register): search.html loads BOTH
 * search.js AND search-algo.js (search.html:170,172), and BOTH declare `let searchArr`
 * at top level. Live-confirmed this session: this throws
 * "Identifier 'searchArr' has already been declared" — a redeclaration SyntaxError that
 * aborts search-algo.js from its very first statement (confirmed live: `final` and
 * `getArray` never become defined on this page). Consequence: the navbar's own search
 * bar is completely non-functional on search.html itself (searching again from here does
 * nothing). No Phase 1 test case exercises this directly, so no new TC was added per the
 * "never expand scope" rule — recorded here and in the Discrepancy Log for visibility.
 */
export class SearchResultsPage extends BasePage {
  protected readonly path = 'search.html';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Wraps a SECOND Playwright `page` (a different tab or browser context — e.g.
   * TC-080's two-tabs-same-origin case, TC-081's two-isolated-contexts case) in its own
   * SearchResultsPage instance. This is a page-class factory method, not a `new` call
   * inside a test, so it stays compliant with the "never instantiate a page object
   * inside a test" rule while still letting Concurrency.spec.ts drive a second page
   * entirely through page-object methods.
   */
  static forPage(page: Page): SearchResultsPage {
    return new SearchResultsPage(page);
  }

  // ==========================================================================
  // Breadcrumb (TC-001, TC-002)
  // ==========================================================================

  // Raw source: <h5>Home / Search Store</h5>  (search.html:49)
  // [SOURCE VERIFIED] file: search.html:49 | no <a>, no onclick, no href anywhere in it —
  //   a single non-interactive text node for BOTH segments; there is no separate
  //   clickable region for "Home" vs "Search Store"
  // Pre-condition: none
  // Source: TC-001,002 — BR8
  private get breadcrumb(): Locator {
    return this.page.locator('h5', { hasText: 'Home / Search Store' });
  }

  async getBreadcrumbText(): Promise<string> {
    return (await this.breadcrumb.innerText()).trim();
  }

  /** Clicks within the single breadcrumb text node (no separate "Home" sub-element exists). */
  async clickBreadcrumbHomeSegment(): Promise<void> {
    await this.breadcrumb.click();
  }

  async clickBreadcrumbSearchStoreSegment(): Promise<void> {
    await this.breadcrumb.click();
  }

  // ==========================================================================
  // Total Items Count (TC-003–006, boundary TC-059–061)
  // ==========================================================================

  // Raw source: <span id="item-count"></span>  (search.html:51); set via
  //   getItemCount(arr){ document.getElementById('item-count').innerText=arr.length }  (search.js:107-109)
  // [SOURCE VERIFIED] file: search.html:51 | search.js:107-109
  // Pre-condition: none
  // Source: TC-003–006,059–061,073,076 — BR9
  get itemCountLabel(): Locator {
    return this.page.locator('#item-count');
  }

  async getTotalItemsCount(): Promise<string> {
    return (await this.itemCountLabel.innerText()).trim();
  }

  // ==========================================================================
  // Product tiles / listing (TC-038–040, and read by nearly every other section)
  // ==========================================================================

  // Raw source: appendData(arr) — document.getElementById('item-container').innerHTML='';
  //   arr.forEach(... card=document.createElement('div'); ... card.append(pic,des,brand,prices,addcart);
  //   document.getElementById('item-container').append(card) ...)  (search.js:8-38)
  // [SOURCE VERIFIED] file: search.js:8-38 | template read directly (Cross-Check Matrix:
  //   createElement chain) — no id/class on the tile <div> itself; addressed by DOM position
  // Pre-condition: window 'load' has fired (search.js:3-7) or a filter/sort/brand handler has re-rendered
  // Source: TC-038–040 and read by most other Sections — BR4,BR9
  private get tiles(): Locator {
    return this.page.locator('#item-container > div');
  }

  async getTileCount(): Promise<number> {
    return this.tiles.count();
  }

  private tileName(index: number): Locator {
    return this.tiles.nth(index).locator('h4');
  }
  private tileBrand(index: number): Locator {
    return this.tiles.nth(index).locator('p');
  }
  // Raw source: actual.innerText='Rs. '+ele.price (search.js:19-20) — first <span> in the prices <div>
  private tilePriceText(index: number): Locator {
    return this.tiles.nth(index).locator('div > span').first();
  }
  // Raw source: discount.innerText=((ele.discount*100)/ele.strikedoffprice).toFixed(0)+'% off';
  //   discount.setAttribute('class','discount_label')  (search.js:24-27)
  private tileDiscountText(index: number): Locator {
    return this.tiles.nth(index).locator('span.discount_label');
  }
  private tileAddToCartButton(index: number): Locator {
    return this.tiles.nth(index).getByRole('button', { name: 'Add to Cart' });
  }
  // Raw source: pic.setAttribute('src', ele.image_url) — no alt attribute set anywhere (Finding 12)
  private tileImage(index: number): Locator {
    return this.tiles.nth(index).locator('img');
  }

  async getTileName(index: number): Promise<string> {
    return (await this.tileName(index).innerText()).trim();
  }
  async getTileBrand(index: number): Promise<string> {
    return (await this.tileBrand(index).innerText()).trim();
  }
  async getAllTileNames(): Promise<string[]> {
    return this.tiles.locator('h4').allInnerTexts();
  }
  async getAllTileBrands(): Promise<string[]> {
    return this.tiles.locator('p').allInnerTexts();
  }
  /** Parses each tile's literal "Rs. 899" text into 899, in tile order. */
  async getAllTilePrices(): Promise<number[]> {
    const count = await this.tiles.count();
    const prices: number[] = [];
    for (let i = 0; i < count; i++) prices.push(await this.getTilePriceValue(i));
    return prices;
  }
  async getTilePriceValue(index: number): Promise<number> {
    const text = await this.tilePriceText(index).innerText();
    return Number(text.replace('Rs.', '').trim());
  }
  /** Raw rendered text (e.g. "Rs. 1499"), unparsed — for Localisation format checks. */
  async tilePriceRawText(index: number): Promise<string> {
    return (await this.tilePriceText(index).innerText()).trim();
  }
  async getTileDiscountPercent(index: number): Promise<number> {
    const text = await this.tileDiscountText(index).innerText();
    return Number(text.replace('% off', '').trim());
  }
  async getTileImageAlt(index: number): Promise<string | null> {
    return this.tileImage(index).getAttribute('alt');
  }
  async tileHasWrappingAnchor(index: number): Promise<boolean> {
    return (await this.tiles.nth(index).locator('xpath=ancestor::a').count()) > 0;
  }

  /** Source: search.js:30-34 — addcart click → addToCart(ele); alert per Finding 5/addToCart body. */
  async addToCartByIndex(index: number): Promise<string> {
    return triggerAndCaptureAlert(this.page, () => this.tileAddToCartButton(index).click());
  }

  /**
   * TC-082 (Concurrency, rapid double-click) — a persistent (not `once`) dialog
   * listener survives across both clicks, since alert() blocks the renderer between
   * them; each dialog is accepted as it appears, so dblclick() resolves only once both
   * have been handled, with no arbitrary waitForTimeout needed.
   */
  async dblClickAddToCartByIndex(index: number): Promise<{ dialogCount: number; messages: string[] }> {
    const messages: string[] = [];
    const handler = (dialog: import('@playwright/test').Dialog) => {
      messages.push(dialog.message());
      void dialog.accept();
    };
    this.page.on('dialog', handler);
    try {
      await this.tileAddToCartButton(index).dblclick();
    } finally {
      this.page.off('dialog', handler);
    }
    return { dialogCount: messages.length, messages };
  }

  // ==========================================================================
  // Filter Section — GENDER / CATEGORIES / Discount checkboxes (TC-007–020, 053-058)
  // ==========================================================================

  // Raw source: <input type="checkbox" value="Boys" /><span>Boys</span> (search.html:90-91,93-94)
  // [SOURCE VERIFIED] file: search.html:88-96 | no <label>, followed only by a plain <span> (Finding 13)
  // Pre-condition: none
  // Source: TC-007,008,019,020,055,068,072,083,108,111,112 — BR2
  private genderCheckbox(value: Gender): Locator {
    return this.page.locator(`#gender input[value="${value}"]`);
  }
  // Raw source: <input type="checkbox" value="Tshirts" />... (search.html:99-108)
  // [SOURCE VERIFIED] file: search.html:97-109
  // Source: TC-009–013,019,020,055,066–069,072,108,111,112 — BR2
  private categoryCheckbox(value: Category): Locator {
    return this.page.locator(`#categories input[value="${value}"]`);
  }
  // Raw source: <input type="checkbox" value="10" />... (search.html:112-121)
  // [SOURCE VERIFIED] file: search.html:110-122 | predicate: (discount*100)/strikedoffprice>=Number(value) (search.js:148)
  // Source: TC-014–018,053,056–058,108,112 — BR2
  private discountCheckbox(value: DiscountThreshold): Locator {
    return this.page.locator(`#discount input[value="${value}"]`);
  }

  async checkGender(value: Gender): Promise<void> {
    await this.genderCheckbox(value).check();
  }
  async uncheckGender(value: Gender): Promise<void> {
    await this.genderCheckbox(value).uncheck();
  }
  async isGenderChecked(value: Gender): Promise<boolean> {
    return this.genderCheckbox(value).isChecked();
  }
  async checkCategory(value: Category): Promise<void> {
    await this.categoryCheckbox(value).check();
  }
  async uncheckCategory(value: Category): Promise<void> {
    await this.categoryCheckbox(value).uncheck();
  }
  async isCategoryChecked(value: Category): Promise<boolean> {
    return this.categoryCheckbox(value).isChecked();
  }
  async checkDiscount(value: DiscountThreshold): Promise<void> {
    await this.discountCheckbox(value).check();
  }
  async uncheckDiscount(value: DiscountThreshold): Promise<void> {
    await this.discountCheckbox(value).uncheck();
  }

  // ==========================================================================
  // Sort by Price / Sort by Name / Sort by Brand (TC-021–037, 062-065, 073, 096)
  // ==========================================================================

  // Raw source: <select name="price" onChange="handlesortprice()" id="sort_price">
  //   <option value="">Sort by Price</option><option value="ascending">Low to High</option>
  //   <option value="descending">High to Low</option></select>  (search.html:55-59)
  // [SOURCE VERIFIED] file: search.html:55-59 | search.js:61-74 (numeric a.price-b.price comparator)
  // Pre-condition: none
  // Source: TC-021,022,062,063,066,067,073,096,109,113 — BR9
  private get sortByPriceSelect(): Locator {
    return this.page.locator('#sort_price');
  }
  // Raw source: <select name="name" onChange="handlesortname()" id="sort_name">... (search.html:62-66)
  // [SOURCE VERIFIED] file: search.html:62-66 | search.js:75-92 (case-sensitive a.name>b.name)
  // Source: TC-023–025,064,065,077,109 — BR9
  private get sortByNameSelect(): Locator {
    return this.page.locator('#sort_name');
  }
  // Raw source: <select name="brand" onChange="handlesortbrand()" id="sort_brand">
  //   <option value="">Sort by Brand</option><option value="US-Polo">US-Polo</option>...
  //   (search.html:69-81) | search.js:93-105 (filter+fallback-to-full-list, Finding 6)
  // [SOURCE VERIFIED] file: search.html:69-81 | search.js:93-105
  // Source: TC-026–037,054,069,109 — BR2
  private get sortByBrandSelect(): Locator {
    return this.page.locator('#sort_brand');
  }

  async selectSortByPrice(direction: SortDirection): Promise<void> {
    await this.sortByPriceSelect.selectOption(direction);
  }
  async selectSortByName(direction: SortDirection): Promise<void> {
    await this.sortByNameSelect.selectOption(direction);
  }
  async selectSortByBrand(brand: Brand): Promise<void> {
    await this.sortByBrandSelect.selectOption(brand);
  }
  /** WCAG 4.1.2 check (TC-113): the dropdown's accessible name is whichever <option> text is selected. */
  async getSortByPriceAccessibleName(): Promise<string> {
    return this.page.evaluate(() => {
      const el = document.getElementById('sort_price') as HTMLSelectElement;
      return el.options[el.selectedIndex]?.text ?? '';
    });
  }
  async getSortByPriceSelectedValue(): Promise<string> {
    return this.sortByPriceSelect.inputValue();
  }

  // ==========================================================================
  // Usability (TC-094, TC-095) — combined text of the filter/listing region, used
  // only to confirm the ABSENCE of a "clear filters"/"try again"-style affordance.
  // ==========================================================================
  private get filterAndListingRegion(): Locator {
    return this.page.locator('#filter-container, #main-container');
  }
  async getFilterAndListingText(): Promise<string> {
    return (await this.filterAndListingRegion.allInnerTexts()).join(' ');
  }

  // ==========================================================================
  // Footer (TC-047, TC-091, TC-113 cross-ref, TC-118)
  // ==========================================================================

  // Raw source: <tr><td> Men</td> <td>Contact Us</td></tr> ... (search.html:136-145) — ALL plain
  //   text, no <a> tags anywhere in this table on THIS page (contrast index.html's real anchors)
  // [SOURCE VERIFIED] file: search.html:130-147 | zero <a> tags inside #table
  // Pre-condition: none
  // Source: TC-047,091,113,118 — BR7,BR8,BR14
  footerCell(text: string): Locator {
    return this.page.locator('#table td', { hasText: text }).first();
  }
  get footerTable(): Locator {
    return this.page.locator('#table');
  }
  promoHeading(text: string): Locator {
    return this.page.getByRole('heading', { level: 4, name: text });
  }

  // ==========================================================================
  // Navbar (this page's own instance — search.html loads navbar.js, Finding 15)
  // ==========================================================================

  // Raw source: <img onclick="homePage()" class="wth" src="..." alt="logo" /> (search.html:15-20)
  // Source: TC-045 — BR7
  get logo(): Locator {
    return this.page.locator('img[alt="logo"]');
  }
  // Source: navbar.js:38-49 guest branch — Source: TC-046,048,049,050,051,116 — BR1,BR3
  get guestSignInButton(): Locator {
    return this.page.locator('#login_Status div', { hasText: 'Sign In' });
  }
  // Source: navbar.js:20-34 authenticated branch — id="cart-items" span
  // Source: TC-042,046,051,070,071,074,079,106,109,110,117 — BR3
  get cartBadge(): Locator {
    return this.page.locator('#cart-items');
  }
  get cartIcon(): Locator {
    return this.cartBadge.locator('..');
  }
  async isCartIconVisible(): Promise<boolean> {
    return (await this.cartIcon.count()) > 0;
  }

  // ==========================================================================
  // Console/error capture (Finding 7 / TC-050, TC-090, TC-126)
  // ==========================================================================

  /** Returns a checker; call it after the action(s) under test to read captured pageerrors. */
  collectPageErrors(): () => string[] {
    const errors: string[] = [];
    const handler = (err: Error) => errors.push(err.message);
    this.page.on('pageerror', handler);
    return () => {
      this.page.off('pageerror', handler);
      return errors;
    };
  }

  // ==========================================================================
  // Page title / heading structure (TC-102,104,120,121)
  // ==========================================================================

  async getTitle(): Promise<string> {
    return this.page.title();
  }
  get h1Elements(): Locator {
    return this.page.locator('h1');
  }
  async getHtmlSource(): Promise<string> {
    return this.page.content();
  }
  async hasMetaDescription(): Promise<boolean> {
    return (await this.page.locator('meta[name="description"]').count()) > 0;
  }
  async hasCanonicalLink(): Promise<boolean> {
    return (await this.page.locator('link[rel="canonical"]').count()) > 0;
  }
  async hasRobotsMeta(): Promise<boolean> {
    return (await this.page.locator('meta[name="robots"]').count()) > 0;
  }

  // ==========================================================================
  // Accessibility (TC-108–121) — public accessors for elements otherwise private,
  // needed for keyboard/contrast/label checks. Verification blocks already recorded
  // above at first declaration (Step S7 reuse); these are read-only exposures.
  // ==========================================================================

  get breadcrumbLocator(): Locator {
    return this.breadcrumb;
  }
  get allFilterCheckboxes(): Locator {
    return this.page.locator('#checkbox-filters input[type="checkbox"]');
  }
  genderCheckboxLocator(value: Gender): Locator {
    return this.genderCheckbox(value);
  }
  categoryCheckboxLocator(value: Category): Locator {
    return this.categoryCheckbox(value);
  }
  get sortByPriceSelectLocator(): Locator {
    return this.sortByPriceSelect;
  }
  get sortByNameSelectLocator(): Locator {
    return this.sortByNameSelect;
  }
  get sortByBrandSelectLocator(): Locator {
    return this.sortByBrandSelect;
  }
  addToCartButtonLocator(index: number): Locator {
    return this.tileAddToCartButton(index);
  }
  tileNameLocator(index: number): Locator {
    return this.tileName(index);
  }
  tileBrandLocator(index: number): Locator {
    return this.tileBrand(index);
  }
  /** The plain <span> that visually follows a checkbox — Finding 13: never a <label>. */
  filterSpanFor(checkbox: Locator): Locator {
    return checkbox.locator('xpath=following-sibling::span[1]');
  }
  async labelCount(): Promise<number> {
    return this.page.locator('label').count();
  }
}

/*
LOCATOR SUMMARY
Element                  | Page         | Mode | Status          | Source ref        | Locator used                              | Source TC
Breadcrumb               | /search.html | A    | SOURCE VERIFIED  | search.html:49    | h5:has-text("Home / Search Store")        | TC-001,002
Total items label        | /search.html | A    | SOURCE VERIFIED  | search.html:51    | #item-count                                | TC-003-006,059-061
Product tiles            | /search.html | A    | SOURCE VERIFIED  | search.js:8-38    | #item-container > div                     | most sections
GENDER checkbox          | /search.html | A    | SOURCE VERIFIED  | search.html:88-96 | #gender input[value="Boys"/"Girls"]       | TC-007,008,...
CATEGORIES checkbox      | /search.html | A    | SOURCE VERIFIED  | search.html:97-109| #categories input[value="..."]            | TC-009-013,...
Discount checkbox        | /search.html | A    | SOURCE VERIFIED  | search.html:110-122| #discount input[value="10".."50"]        | TC-014-018,...
Sort by Price select     | /search.html | A    | SOURCE VERIFIED  | search.html:55-59 | #sort_price                                | TC-021,022,...
Sort by Name select      | /search.html | A    | SOURCE VERIFIED  | search.html:62-66 | #sort_name                                 | TC-023-025,...
Sort by Brand select     | /search.html | A    | SOURCE VERIFIED  | search.html:69-81 | #sort_brand                                | TC-026-037,...
Footer table/cells       | /search.html | A    | SOURCE VERIFIED  | search.html:130-147| #table td:has-text(...)                  | TC-047,091,113,118
Logo                     | /search.html | A+B  | SOURCE+DOM VERIF.| search.html:15-20 | img[alt="logo"]                            | TC-045
Cart badge/icon          | /search.html | A+B  | SOURCE+DOM VERIF.| navbar.js:20-34   | #cart-items                                | TC-042,046,...
Guest Sign In button     | /search.html | A+B  | SOURCE+DOM VERIF.| navbar.js:38-49   | #login_Status div:has-text("Sign In")     | TC-046,048-051,116
*/
