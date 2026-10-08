import { Page } from '@playwright/test';
import { gotoPath } from '../utils/navigationHelpers';

/**
 * Shared base for every Page Object. Each subclass declares its own fixed `path`;
 * `setup()` navigates there (or to an explicit override, for the handful of checks
 * that need to load the SAME conceptual page — e.g. the dynamic navbar — at a
 * different URL, such as verifying the Logo behaves identically on mens.html).
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected abstract readonly path: string;

  async setup(path: string = this.path): Promise<void> {
    await gotoPath(this.page, path);
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  get currentUrl(): string {
    return this.page.url();
  }
}
