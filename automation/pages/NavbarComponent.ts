import { Page, Locator } from '@playwright/test';

type CategoryName = 'MEN' | 'WOMEN' | 'KIDS' | 'HOME & LIVING';

/**
 * The dynamic navbar rendered by navbar.js — appears on index.html, mens.html,
 * womens.html, kids.html, Home&Living.html, about-us.html, contact-us.html, blog.html,
 * and terms-of-use.html (confirmed via grep: all carry #login_Status + <script
 * src="navbar.js">). Composed into HomePage/MensPage/WomensPage/HomeLivingPage, and
 * usable standalone (`new NavbarComponent(page)`) for the pages that have no other
 * interactive surface worth a dedicated Page Object.
 */
export class NavbarComponent {
  constructor(private readonly page: Page) {}

  // Raw source: <img onclick="homePage()" class="wth" src="..." alt="logo" ...>
  // [SOURCE VERIFIED] index.html:15 now reads alt="logoStyleup" (renamed from "logo"); every
  // other navbar.js page (about-us.html:15, mens.html:17, blog.html:15, etc.) still has
  // alt="logo" unchanged. getByRole name-matching is a case-insensitive substring match, so
  // { name: 'logo' } matches both "logo" and "logoStyleup" and stays correct if the other
  // pages are ever renamed the same way. Confirmed via grep: no other image's alt on any of
  // these pages contains "logo", so the match stays unique per page.
  // Pre-condition: none — present unconditionally on every navbar.js page
  get logo(): Locator {
    return this.page.getByRole('img', { name: 'logo' });
  }

  // Raw source: <div>MEN</div><div>WOMEN</div><div>KIDS</div><div>HOME & LIVING</div> (index.html:19-22)
  // [SOURCE VERIFIED] file: index.html:18-23 | static text-content <div> siblings
  categoryLink(name: CategoryName): Locator {
    return this.page.locator('#products_page > div', { hasText: name }).first();
  }

  // Raw source: <input type="text" name="search" id="search-bar" placeholder="...">  (index.html:25)
  // [SOURCE VERIFIED] file: index.html:25 (identical id on every navbar.js page)
  get searchBar(): Locator {
    return this.page.locator('#search-bar');
  }

  // Raw source: navbar.js:38-49 → login_Status.append(signIn, signUp)
  // [SOURCE VERIFIED] file: navbar.js:38-49 | [DOM VERIFIED] index.html, loginStatus=false
  get guestSignInButton(): Locator {
    return this.page.locator('#login_Status div', { hasText: 'Sign In' });
  }
  get guestSignUpButton(): Locator {
    return this.page.locator('#login_Status div', { hasText: 'Sign Up' });
  }

  // Raw source: navbar.js:16-18 → logOff.innerText = 'Log Out'
  // [SOURCE VERIFIED] file: navbar.js:16-18 | [DOM VERIFIED] index.html, loginStatus=true
  get logOutButton(): Locator {
    return this.page.locator('#login_Status div', { hasText: 'Log Out' });
  }

  // Raw source: navbar.js:20-34 → cartItems.setAttribute('id','cart-items')
  // [SOURCE VERIFIED] file: navbar.js:20-34 | [DOM VERIFIED] index.html, loginStatus=true
  get cartBadge(): Locator {
    return this.page.locator('#cart-items');
  }
  get cartIcon(): Locator {
    return this.cartBadge.locator('..');
  }

  async clickLogo(): Promise<void> {
    await this.logo.click();
  }

  async clickCategory(name: CategoryName): Promise<void> {
    await this.categoryLink(name).click();
  }

  /** Fills and commits a search term via the exact `change`-event trigger search-algo.js listens for. */
  async search(text: string): Promise<void> {
    await this.searchBar.fill(text);
    await this.searchBar.press('Tab');
  }

  async clickSignIn(): Promise<void> {
    await this.guestSignInButton.click();
  }

  async clickSignUp(): Promise<void> {
    await this.guestSignUpButton.click();
  }

  async logOut(): Promise<void> {
    await this.logOutButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
