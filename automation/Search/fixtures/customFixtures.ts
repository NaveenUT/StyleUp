import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { CartPage } from '../pages/CartPage';

/**
 * Extended Playwright fixtures — one per page class, each instantiating the page
 * object and executing setup(). Spec files import `test`/`expect` from HERE, never
 * from '@playwright/test' directly, and never instantiate a page class themselves.
 *
 * | Fixture           | Purpose                                    |
 * |--------------------|--------------------------------------------|
 * | loginPage          | Creates LoginPage and executes setup()     |
 * | homePage            | Creates HomePage and executes setup()      |
 * | searchResultsPage   | Creates SearchResultsPage and executes setup() |
 * | cartPage            | Creates CartPage and executes setup()      |
 */
type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  searchResultsPage: SearchResultsPage;
  cartPage: CartPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.setup();
    await use(loginPage);
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.setup();
    await use(homePage);
  },
  searchResultsPage: async ({ page }, use) => {
    const searchResultsPage = new SearchResultsPage(page);
    await searchResultsPage.setup();
    await use(searchResultsPage);
  },
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await cartPage.setup();
    await use(cartPage);
  },
});

export { expect };
