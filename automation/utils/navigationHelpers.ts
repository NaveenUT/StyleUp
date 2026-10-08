import { Page } from '@playwright/test';
import { config } from './config';

/**
 * Every page in scope embeds several external hero-banner/logo images (myntassets,
 * ajio, i.postimg.cc CDN hosts) that are irrelevant to every test case in this suite
 * but that the app's own CSS sizes via `width:auto` off the image's intrinsic
 * dimensions — meaning a slow/unreachable external host can render the Logo (and other
 * chrome) at a genuine 0×N box until the image loads, live-confirmed by probing
 * `naturalWidth`/`complete` on a stalled load. Two mitigations, both applied uniformly
 * through `gotoPath()` so no page object or spec file has to special-case it:
 *   1. Wait only for 'domcontentloaded', not 'load' (external images can stall 'load').
 *   2. Intercept requests for image resources NOT served by the app's own origin and
 *      fulfil them with a tiny local placeholder, so `.wth`'s `width:auto; height:30px`
 *      resolves to a stable, loaded 30×30 box immediately — independent of external
 *      network reachability from the test environment.
 */
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

const routedPages = new WeakSet<Page>();

async function installExternalImagePlaceholder(page: Page): Promise<void> {
  if (routedPages.has(page)) return;
  routedPages.add(page);
  await page.route('**/*', async (route) => {
    const request = route.request();
    if (request.resourceType() === 'image' && !request.url().includes(new URL(config.baseUrl).host)) {
      return route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_PNG });
    }
    return route.continue();
  });
}

/**
 * Navigates to a path relative to BASE_URL. Used directly by BasePage.setup() for the
 * page objects below, and directly by spec files that only need to visit an incidental
 * page (about-us.html, contact-us.html, blog.html, terms-of-use.html, address.html,
 * payment.html, otp.html, kids.html, search.html) with no dedicated Page Object —
 * not every page needs a full class, only the ones with real interactive surface
 * under test.
 */
export async function gotoPath(page: Page, path: string): Promise<void> {
  await installExternalImagePlaceholder(page);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}
