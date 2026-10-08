import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { triggerAndCaptureAlert } from '../utils/waitHelpers';

type CategoryName = 'MEN' | 'WOMEN' | 'KIDS' | 'HOME LIVING';

/** signup.html — static navbar (NOT navbar.js), own inline script. */
export class SignUpPage extends BasePage {
  protected readonly path = '/signup.html';

  // Raw source: <a href="index.html"><img src="..."></a>  (signup.html:15-17) — same no-alt pattern as Sign In
  get logoLink(): Locator {
    return this.page.locator('#left a[href="index.html"]');
  }
  // Raw source: <input id="fullName" type="text" placeholder="Enter Your FullName">  (signup.html:40)
  // id changed again ("fullName_write" -> "fullName"); label's for="" still isn't
  // wired to the input, so placeholder remains the most resilient anchor available.
  get nameField(): Locator {
    return this.page.getByPlaceholder('Enter Your FullName');
  }
  // Raw source: <input id="mail_ID" type="text" placeholder="Email">  (signup.html:42)
  // id changed again ("mail_ID_write" -> "mail_ID"); placeholder ("Email") unchanged, still the anchor
  get emailField(): Locator {
    return this.page.getByPlaceholder('Email');
  }
  // Raw source: <input id="password" type="text" placeholder="Enter Password">  (signup.html:44)
  // id changed again ("password_write" -> "password"); placeholder unchanged
  // ("Enter Password"); note: type="text", NOT type="password" — confirmed
  get passwordField(): Locator {
    return this.page.getByPlaceholder('Enter Password');
  }
  // Raw source: <input type="submit" value="Sign up">  (signup.html:48) — lowercase "up"
  get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign up' });
  }
  // Raw source: <a href="signin.html">Sign in</a>  (signup.html:49)
  get signInLink(): Locator {
    return this.page.getByRole('link', { name: 'Sign in' });
  }
  // Raw source: <a href="http://127.0.0.1:5501/terms-of-use.html"> Terms of Services</a>  (signup.html:46)
  get termsLink(): Locator {
    return this.page.getByRole('link', { name: 'Terms of Services' });
  }
  categoryLink(name: CategoryName): Locator {
    return this.page.locator('#left a').getByText(name, { exact: true });
  }

  async fillName(value: string): Promise<void> {
    await this.nameField.fill(value);
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

  /** Fills all 3 fields and submits. Does NOT wait for an alert — Steps 4/12/8 in the
   * register mostly cover the invalid paths (alert fires) and the valid path (no
   * alert, straight redirect); callers pick the right wait accordingly. */
  async fillForm(name: string, email: string, password: string): Promise<void> {
    await this.fillName(name);
    await this.fillEmail(email);
    await this.fillPassword(password);
  }

  /** Fills, submits, and returns the resulting alert() message (for the invalid-input paths). */
  async registerExpectingAlert(name: string, email: string, password: string): Promise<string> {
    await this.fillForm(name, email, password);
    return triggerAndCaptureAlert(this.page, () => this.submit());
  }
}
