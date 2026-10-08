import { Page, Locator } from '@playwright/test';
import { config } from '../utils/config';
import { installExternalImagePlaceholder } from '../utils/waitHelpers';

/**
 * Base class shared by every page object in this project. Owns navigation to
 * BASE_URL — no page class re-implements this. Every page class extends BasePage
 * and sets its own `path` (relative to BASE_URL); `setup()` is the single entry
 * point every fixture calls after constructing a page object.
 */
export class BasePage {
  protected readonly path: string = '';

  constructor(protected readonly page: Page) {}

  async setup(): Promise<void> {
    await installExternalImagePlaceholder(this.page, new URL(config.baseUrl).host);
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }

  get currentUrl(): string {
    return this.page.url();
  }

  /** Generic "the page didn't crash to a blank/error state" check, shared by every page. */
  get body(): Locator {
    return this.page.locator('body');
  }
}
