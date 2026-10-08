import { Page, Dialog, Locator, expect } from '@playwright/test';

/**
 * This app uses native alert() everywhere, which blocks the renderer until dismissed —
 * a click that synchronously triggers alert() will not resolve until the dialog is
 * handled. Registering the listener with `page.once('dialog', ...)` BEFORE awaiting the
 * triggering action (rather than `await page.waitForEvent('dialog')` first) lets the
 * handler accept the dialog as soon as it fires, unblocking the click.
 */
export async function triggerAndCaptureAlert(page: Page, action: () => Promise<void>): Promise<string> {
  let message = '';
  const handler = (dialog: Dialog) => {
    message = dialog.message();
    void dialog.accept();
  };
  page.once('dialog', handler);
  try {
    await action();
  } finally {
    page.off('dialog', handler);
  }
  return message;
}

/**
 * For steps that assert NO dialog appears. The returned checker removes its own
 * listener when called, so a later triggerAndCaptureAlert()/assertNoDialogFires() call
 * in the same test does not stack a second listener on the same dialog event (which
 * would make Playwright throw "Cannot accept dialog which is already handled").
 */
export function assertNoDialogFires(page: Page): () => boolean {
  let fired = false;
  const handler = (dialog: Dialog) => {
    fired = true;
    void dialog.accept();
  };
  page.once('dialog', handler);
  return () => {
    page.off('dialog', handler);
    return fired;
  };
}

/**
 * Every page in scope embeds external CDN images (logo, invite banner, product
 * images) that are irrelevant to every test case in this suite but that can stall
 * the browser's 'load' event or leave `width:auto`-sized chrome at a transient 0×N
 * box — live-confirmed this session when window 'load' hung 30s on an unrelated
 * external image. Installed once per page by BasePage.setup() so no page class or
 * spec file has to special-case it.
 */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);
const routedPages = new WeakSet<Page>();

export async function installExternalImagePlaceholder(page: Page, ownHost: string): Promise<void> {
  if (routedPages.has(page)) return;
  routedPages.add(page);
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.resourceType() === 'image' && !request.url().includes(ownHost)) {
      return route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_PNG });
    }
    return route.continue();
  });
}

/** Waits for the DOM to settle after an action that triggers a same-page reload/navigation. */
export async function waitForReload(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
}

/**
 * `#item-container`'s tiles are rebuilt synchronously by appendData() on every
 * filter/sort/brand `change` event (search.js:8-38) — there is no async gap, but this
 * gives every listing-count assertion a single, explicit, named wait point instead of
 * an implicit race, per the "no raw waitForTimeout" rule.
 */
export async function waitForTileCount(tiles: Locator, expected: number): Promise<void> {
  await expect(tiles).toHaveCount(expected);
}
