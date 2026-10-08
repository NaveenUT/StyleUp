import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * cart.html — its own bespoke navbar (BAG/ADDRESS/PAYMENT breadcrumb), no navbar.js,
 * no #login_Status, no Cart icon anywhere on the checkout flow (confirmed by grep —
 * TC-048's own defect).
 */
export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  // Raw source: cart.html:66-116 displaycart() — each entry is a <div> appended into
  //   <span id="product">; ids repeat per row (id="dile", id="dele"), so rows are
  //   addressed by DOM position.
  lineItem(index: number): Locator {
    return this.page.locator('#product > div').nth(index);
  }
  decrementButton(index: number): Locator {
    return this.lineItem(index).getByText('-', { exact: true });
  }
  incrementButton(index: number): Locator {
    return this.lineItem(index).getByText('+', { exact: true });
  }
  // Raw source: <button id="dele">REMOVE</button>  (cart.html:105-111)
  removeButton(index: number): Locator {
    return this.lineItem(index).locator('#dele');
  }
  get lineItems(): Locator {
    return this.page.locator('#product > div');
  }
  // Raw source: <span id="Noofitems"></span> (cart.html:41) / <span id="Finalamount"></span> (cart.html:53)
  get noOfItems(): Locator {
    return this.page.locator('#Noofitems');
  }
  get finalAmount(): Locator {
    return this.page.locator('#Finalamount');
  }

  /** Clicks REMOVE and waits for cart.html's own reload() (cart.html:139-144). */
  async removeItem(index: number): Promise<void> {
    await this.removeButton(index).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
