import { Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { triggerAndCaptureAlert } from '../utils/waitHelpers';

/**
 * Page: Sign In (signin.html)
 * Verification mode(s) used: Mode A (source)
 * Source files analysed: signin.html:38-79
 * Pages inspected: none required beyond source (static form markup + own inline script)
 * Date generated: 2026-08-06
 *
 * Used only where a Search Results test case's own Steps exercise sign-in as a real
 * step (e.g. Cross-Feature journeys TC-122/TC-126, which sign in mid-journey). For
 * every other "Authenticated" Precondition, the account/session is seeded directly
 * via SearchResultsPage's storage helpers — never through this page — per the
 * protocol's "never seed for a test case whose own Steps exercise login" rule read
 * the other way round: don't drive the UI for a Precondition that isn't the tested step.
 */
export class LoginPage extends BasePage {
  protected readonly path = 'signin.html';

  // Raw source: <input id="mail" type="text" placeholder="Enter Email">  (signin.html:42)
  // [SOURCE VERIFIED] file: signin.html:42 | attribute: id="mail"
  // Pre-condition: none
  // Source: TC-122,126 — BR1,BR3
  private get emailField(): Locator {
    return this.page.locator('#mail');
  }

  // Raw source: <input id="pass" type="text" placeholder="Enter Password">  (signin.html:44)
  // [SOURCE VERIFIED] file: signin.html:44 | attribute: id="pass" | note: type="text", not type="password"
  // Source: TC-122,126 — BR1,BR3
  private get passwordField(): Locator {
    return this.page.locator('#pass');
  }

  // Raw source: <input type="submit" value="Sign In">  (signin.html:48)
  // [SOURCE VERIFIED] file: signin.html:48 | attribute: value="Sign In"
  // Source: TC-122,126 — BR1,BR3
  private get submitButton(): Locator {
    return this.page.getByRole('button', { name: 'Sign In' });
  }

  /**
   * Source: signin.html:57-77 — myfunction() matches Email==el.Email && Password==el.Password
   * across `userdata`; on match: alert("Login successfull"), loginStatus=true, redirect to
   * index.html. On no match: alert("Incorrect Id or password"), redirect to signup.html.
   */
  async login(email: string, password: string): Promise<string> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    return triggerAndCaptureAlert(this.page, () => this.submitButton.click());
  }
}

/*
LOCATOR SUMMARY
Element        | Page         | Mode | Status          | Source ref      | Locator used                          | Source TC
Email field    | /signin.html | A    | SOURCE VERIFIED  | signin.html:42  | #mail                                  | TC-122,126
Password field | /signin.html | A    | SOURCE VERIFIED  | signin.html:44  | #pass                                  | TC-122,126
Submit button  | /signin.html | A    | SOURCE VERIFIED  | signin.html:48  | getByRole('button',{name:'Sign In'})  | TC-122,126
*/
