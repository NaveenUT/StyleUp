import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { NavbarComponent } from './NavbarComponent';

/**
 * Home&Living.html — yet another container id/button pattern: container id="container",
 * Add-to-Cart button has no id, innerText "Add to Cart" (lowercase t, matches
 * mens.html's casing but not womens.html's).
 *
 * Path note: navbar.js:77 and every category link across the site target the literal
 * string "Home&Living.html" (capital H); the actual on-disk file is "home&living.html"
 * (lowercase). This only resolves because the local filesystem is case-insensitive —
 * asserted here as the capital-cased form since that's what the app actually requests.
 */
export class HomeLivingPage extends BasePage {
  protected readonly path = '/Home&Living.html';
  readonly navbar: NavbarComponent;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page);
  }

  productCard(index: number): Locator {
    return this.page.locator('#container > div').nth(index);
  }
  addToCartButton(index: number): Locator {
    return this.productCard(index).getByRole('button', { name: 'Add to Cart' });
  }

  async addToCart(index: number): Promise<void> {
    await this.addToCartButton(index).click();
  }
}
