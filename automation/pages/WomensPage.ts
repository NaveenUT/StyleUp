import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { NavbarComponent } from './NavbarComponent';

/**
 * womens.html — DIFFERENT container id/button pattern than mens.html (site-wide
 * implementation inconsistency, confirmed by direct read of both files): container
 * id="products" (not "Right-section"), and the Add-to-Cart button has no id at all,
 * innerText "Add To Cart" (capital T, distinct from mens.html's "Add to Cart").
 */
export class WomensPage extends BasePage {
  protected readonly path = '/womens.html';
  readonly navbar: NavbarComponent;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page);
  }

  productCard(index: number): Locator {
    return this.page.locator('#products > div').nth(index);
  }
  addToCartButton(index: number): Locator {
    return this.productCard(index).getByRole('button', { name: 'Add To Cart' });
  }

  async addToCart(index: number): Promise<void> {
    await this.addToCartButton(index).click();
  }
}
