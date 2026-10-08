import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { triggerAndCaptureAlert } from '../utils/waitHelpers';
import { SearchResultsPage } from './SearchResultsPage';

/**
 * Page: Home (index.html)
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: index.html:13-29; search-algo.js:1263-1289; navbar.js:88-90
 * Pages inspected: none required beyond source
 * Date generated: 2026-08-06
 *
 * Used as the entry point for every Search Results test case whose Precondition/Steps
 * say "search '<term>' from index.html" — the Search Results page (search.html) is
 * reached ONLY this way; there is no query-parameter URL for it (Finding 1: the term
 * travels entirely via the `searchData` localStorage key, never a URL parameter).
 */
export class HomePage extends BasePage {
  protected readonly path = 'index.html';

  // Raw source: <img onclick="homePage()" class="wth" src="..." alt="logo">  (index.html:15)
  // [SOURCE VERIFIED] file: index.html:15 | attribute: alt="logo"
  // Pre-condition: none — present unconditionally
  // Source: TC-045 — BR7
  get logo(): Locator {
    return this.page.locator('img[alt="logo"]');
  }

  // Raw source: <input type="text" name="search" id="search-bar" placeholder="Search for products, brands & more">  (index.html:25)
  // [SOURCE VERIFIED] file: index.html:25
  // Pre-condition: none
  // Source: every TC whose Precondition searches from index.html — BR1,BR4
  private get searchBar(): Locator {
    return this.page.locator('#search-bar');
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }

  // Raw source: navbar.js:20-34 authenticated branch — id="cart-items" span (same
  // navbar.js instance as SearchResultsPage's, rendered on this page too)
  // Source: TC-126 — BR3
  get cartBadge(): Locator {
    return this.page.locator('#cart-items');
  }

  // Raw source: <table id="table">...<tr><td> Women</td><td><a href="...">Blog</a></td></tr>...
  //   (index.html:65-81) — real <a> links, contrast search.html's plain-text-only footer
  // [SOURCE VERIFIED] file: index.html:65-81
  // Source: TC-047 — BR7,BR8
  get footerTable(): Locator {
    return this.page.locator('#table');
  }
  async getFooterText(): Promise<string> {
    return (await this.footerTable.innerText()).trim();
  }

  /**
   * Source: search-algo.js:1264-1289 — fires on the `change` event of #search-bar
   * (fill + blur-via-Tab is the verified way to trigger it, not Enter). On ≥1 prefix
   * match against brand/gender/category: alert(`${n} no. of products found`), writes
   * `searchData`, navigates to search.html. On 0 matches: alert("Product not Found"),
   * no navigation.
   */
  async search(term: string): Promise<string> {
    return triggerAndCaptureAlert(this.page, async () => {
      await this.searchBar.fill(term);
      await this.searchBar.press('Tab');
    });
  }

  /**
   * Convenience for test cases whose Steps literally chain "search, then interact with
   * results" — constructs the next page object internally (a page-class method, not a
   * test, so this does not violate "never `new` a page object inside a test") so the
   * spec file never has to import SearchResultsPage or instantiate it itself.
   */
  async searchAndGoToResults(term: string): Promise<{ message: string; resultsPage: SearchResultsPage }> {
    const message = await this.search(term);
    if (this.page.url().includes('search.html')) {
      // A match redirects via window.location.href (search-algo.js:1285). search.js's
      // own tile rendering (appendData) runs on THIS new document's 'load' event
      // (search.js:3-7), not domcontentloaded — waiting here, once, in the page class,
      // avoids a race every calling spec file would otherwise have to guard against
      // individually (live-diagnosed this session: tiles read as 0 on a cache-warmed
      // second navigation when this wait was missing).
      await this.page.waitForLoadState('load');
    }
    return { message, resultsPage: new SearchResultsPage(this.page) };
  }
}

/*
LOCATOR SUMMARY
Element     | Page        | Mode | Status          | Source ref     | Locator used            | Source TC
Logo        | /index.html | A    | SOURCE VERIFIED  | index.html:15  | img[alt="logo"]         | TC-045
Search bar  | /index.html | A    | SOURCE VERIFIED  | index.html:25  | #search-bar             | most TCs (via search())
*/
