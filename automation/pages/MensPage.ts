import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { NavbarComponent } from './NavbarComponent';

/**
 * mens.html — representative gated category page. Product cards use container
 * id="Right-section" and a button id="addtocart" reading "Add to Cart" (mens.js:118-165).
 * Confirmed by direct read of womens.js/home&living.js that these two details
 * (container id, button text/casing) are NOT consistent across category pages —
 * see WomensPage/HomeLivingPage for the different pattern each uses.
 */
export class MensPage extends BasePage {
  protected readonly path = '/mens.html';
  readonly navbar: NavbarComponent;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page);
  }

  productCard(index: number): Locator {
    return this.page.locator('#Right-section > div').nth(index);
  }
  addToCartButton(index: number): Locator {
    return this.productCard(index).locator('#addtocart');
  }

  async addToCart(index: number): Promise<void> {
    await this.addToCartButton(index).click();
  }
}
