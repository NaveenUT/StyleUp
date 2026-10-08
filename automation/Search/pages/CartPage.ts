import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page: Cart (cart.html)
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: cart.html:34-156
 * Pages inspected: none required beyond source
 * Date generated: 2026-08-06
 *
 * Used only by TC-074 (remove an item added from Search Results, confirm the icon here
 * reverts to 0 back on search.html) and TC-089 (hand-edited out-of-range cartData entry).
 */
export class CartPage extends BasePage {
  protected readonly path = 'cart.html';

  // Raw source: cart.html:66-116 displaycart() — each entry is a <div> in <span id="product">,
  //   with a <button id="dele">REMOVE</button> (cart.html:105-111); ids repeat per row,
  //   so rows are addressed by DOM position.
  // [SOURCE VERIFIED] file: cart.html:66-116
  // Pre-condition: cart.html loaded with a non-empty cartData
  // Source: TC-074,089 — BR9
  private lineItem(index: number): Locator {
    return this.page.locator('#product > div').nth(index);
  }
  private removeButton(index: number): Locator {
    return this.lineItem(index).locator('#dele');
  }

  get lineItemCount(): Locator {
    return this.page.locator('#product > div');
  }

  /** Source: cart.html:139-144 removeitem() — arr.splice + setItem('cartData') + reload(). */
  async removeItem(index: number): Promise<void> {
    await this.removeButton(index).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getLineItemCount(): Promise<number> {
    return this.lineItemCount.count();
  }
}

/*
LOCATOR SUMMARY
Element        | Page       | Mode | Status         | Source ref       | Locator used            | Source TC
Cart line item | /cart.html | A    | SOURCE VERIFIED | cart.html:66-116 | #product > div (by idx) | TC-074,089
Remove button  | /cart.html | A    | SOURCE VERIFIED | cart.html:105-111| #dele (scoped to row)   | TC-074
*/
