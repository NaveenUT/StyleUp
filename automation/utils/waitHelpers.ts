import { Page, Dialog } from '@playwright/test';

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
 * listener when called — if a `once` handler that never fired were left registered, a
 * LATER triggerAndCaptureAlert()/assertNoDialogFires() call in the same test would stack
 * a second listener on the same dialog event, and Playwright throws "Cannot accept
 * dialog which is already handled" when both listeners try to accept it.
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

/** Waits for the DOM to settle after a same-page action that triggers a reload/navigation. */
export async function waitForReload(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
}
