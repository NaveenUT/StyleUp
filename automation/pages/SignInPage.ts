import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { triggerAndCaptureAlert } from '../utils/waitHelpers';

type CategoryName = 'MEN' | 'WOMEN' | 'KIDS' | 'HOME LIVING';

/**
 * signin.html — static navbar (NOT navbar.js), own inline script. Distinct markup from
 * the dynamic-navbar pages: its Logo is a plain <a> with no `alt`, and its 4 category
 * links are real, unguarded <a href> anchors (Critical Finding 1 / TC-065).
 */
export class SignInPage extends BasePage {
  protected readonly path = '/signin.html';

  // Raw source: <a href="index.html"><img src="..."></a>  (signin.html:17-19)
  // [SOURCE VERIFIED] file: signin.html:17-19 | no alt attribute — distinct from the
  //   dynamic navbar's img[alt="logo"]
  get logoLink(): Locator {
    return this.page.locator('#left a[href="index.html"]');
  }

  // Raw source: <input id="mailID" type="text" placeholder="Enter Email">  (signin.html:42)
  // id changed from "mail" -> "mailID"; healed onto the stable placeholder instead of the new id.
  get emailField(): Locator {
    return this.page.getByPlaceholder('Enter Email');
  }
  // Raw source: <input id="passwordkey" type="text" placeholder="Enter Password">  (signin.html:44)
  // note: type="text", NOT type="password" — confirmed. id changed from "pass" -> "passwordkey".
  get passwordField(): Locator {
    return this.page.getByPlaceholder('Enter Password');
  }
  // Raw source: <input type="submit" value="Sign In">  (signin.html:48)
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }
  // Raw source: <a href="http://127.0.0.1:5501/terms-of-use.html"> Terms of Services</a>  (signin.html:46)
  get termsLink(): Locator {
    return this.page.getByRole('link', { name: 'Terms of Services' });
  }
  // Raw source: <a href="signup.html">Sign up</a>  (signin.html:49)
  get signUpLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign up' });
  }
  // Raw source: <div> <a href="mens.html">MEN</a></div> (signin.html:22-25) — real, unguarded anchors
  categoryLink(name: CategoryName): Locator {
    return this.page.locator('#left a').getByText(name, { exact: true });
  }

  async fillEmail(value: string): Promise<void> {
    await this.emailField.fill(value);
  }
  async fillPassword(value: string): Promise<void> {
    await this.passwordField.fill(value);
  }
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Fills both fields, submits, and returns the resulting alert() message. */
  async login(email: string, password: string): Promise<string> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    return triggerAndCaptureAlert(this.page, () => this.submit());
  }
}
