import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SignInPage } from '../pages/SignInPage';
import { SignUpPage } from '../pages/SignUpPage';
import { CartPage } from '../pages/CartPage';
import { MensPage } from '../pages/MensPage';
import { WomensPage } from '../pages/WomensPage';
import { HomeLivingPage } from '../pages/HomeLivingPage';
import { NavbarComponent } from '../pages/NavbarComponent';

/**
 * Every spec file imports `test`/`expect` from here instead of '@playwright/test'.
 * Fixtures only construct the Page Object — navigation stays an explicit
 * `await homePage.setup()` call inside the test, since several test cases need to
 * seed localStorage BEFORE the first navigation (see utils/storageHelpers.ts).
 */
type PageFixtures = {
  homePage: HomePage;
  signInPage: SignInPage;
  signUpPage: SignUpPage;
  cartPage: CartPage;
  mensPage: MensPage;
  womensPage: WomensPage;
  homeLivingPage: HomeLivingPage;
  /** For incidental pages with no dedicated Page Object (about-us, contact-us, blog, terms-of-use). */
  navbar: NavbarComponent;
};

export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },
  signUpPage: async ({ page }, use) => {
    await use(new SignUpPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  mensPage: async ({ page }, use) => {
    await use(new MensPage(page));
  },
  womensPage: async ({ page }, use) => {
    await use(new WomensPage(page));
  },
  homeLivingPage: async ({ page }, use) => {
    await use(new HomeLivingPage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new NavbarComponent(page));
  },
});

export { expect };
