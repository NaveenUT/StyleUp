import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { NavbarComponent } from './NavbarComponent';

/**
 * index.html. The footer table ("Online Shopping" / "Useful Links") is confirmed via
 * grep to exist on only 5 of the 16 real pages (index, womens, kids, home&living,
 * search) — encapsulated here since index.html is this suite's primary footer subject.
 */
export class HomePage extends BasePage {
  protected readonly path = '/index.html';
  readonly navbar: NavbarComponent;

  constructor(page: Page) {
    super(page);
    this.navbar = new NavbarComponent(page);
  }

  // Raw source: <tr><td onclick="window.location.href='mens.html' " > Men</td>...</tr>  (index.html:71)
  // [SOURCE VERIFIED] file: index.html:71 | text "Men" (capital M only — matches BR2's static-item defect)
  get footerMenCell(): Locator {
    return this.page.locator('#table td', { hasText: 'Men' }).first();
  }

  // Raw source: <a href="http://127.0.0.1:5501/contact-us.html">Contact Us</a>  (index.html:71)
  get footerContactUsLink(): Locator {
    return this.page.getByRole('link', { name: 'Contact Us' });
  }
  // Raw source: <a href="http://127.0.0.1:5501/blog.html">Blog</a>  (index.html:72)
  get footerBlogLink(): Locator {
    return this.page.getByRole('link', { name: 'Blog' });
  }
  // Raw source: <a href="http://127.0.0.1:5501/about-us.html">About Us</a>  (index.html:73)
  get footerAboutUsLink(): Locator {
    return this.page.getByRole('link', { name: 'About Us' });
  }
  // Raw source: <a href="http://127.0.0.1:5501/terms-of-use.html">Terms of use</a>  (index.html:74)
  get footerTermsOfUseLink(): Locator {
    return this.page.getByRole('link', { name: 'Terms of use' });
  }
  // Raw source: <td>Women</td>, <td>Kids</td>, ... <td>Privacy Policy</td>  (index.html:72-80)
  // [SOURCE VERIFIED] none of these carries an href, onclick, or listener of any kind
  footerStaticCell(text: string): Locator {
    return this.page.locator('#table td', { hasText: text }).first();
  }
  get footerTable(): Locator {
    return this.page.locator('#table');
  }

  // Raw source: <h4>...</h4> promotional headings (index.html:86,88,98)
  promotionalHeading(text: string): Locator {
    return this.page.getByRole('heading', { level: 4, name: text });
  }

  async clickFooterMenCell(): Promise<void> {
    await this.footerMenCell.click();
  }
}
