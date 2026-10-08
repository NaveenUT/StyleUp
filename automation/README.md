# Homepage / Sign In / Sign Up — Playwright Automation (Page Object Model)

Generated per `prompt_phase2_playwright_conversion_v2_source_aware.md`, converting
every test case in `Homepage_prompt_coverage_improvement (3).md` (154 cases,
TC-001–TC-154) into a Playwright TypeScript suite that runs against the real app,
structured as a Page Object Model.

## Setup

```bash
cd automation
npm install
npx playwright install chromium   # firefox/webkit optional, see playwright.config.ts
cp .env.example .env               # only if BASE_URL needs to differ from the default
```

The app itself is served statically from the repo root — `playwright.config.ts`'s
`webServer` starts it automatically (`python -m http.server 5501`) if nothing is
already listening on the configured port.

## Running

```bash
npx playwright test                     # all projects (chromium/firefox/webkit/msedge)
npx playwright test --project=chromium  # fastest path
npx playwright test tests/signin/
npx playwright show-report              # after a run, opens the HTML report
```

Recommended for a clean local run: `npx playwright test --project=chromium --workers=1`
(see the environmental note in `DISCREPANCY_LOG.md` on why parallel workers can flake
against the single-threaded dev server).

## Expected result

**151 passing, 3 intentionally failing.** The 3 failures are not script bugs — each
encodes the register's Phase 1 Expected Result faithfully and fails because the live
application's actual behaviour contradicts it. See `DISCREPANCY_LOG.md` for exactly
which three and why; each is also flagged inline with a `⚠ SOURCE DISCREPANCY` /
`⚠ LIVE-BEHAVIOUR DISCREPANCY` comment at its assertion.

## Project structure

```
automation/
  SOURCE_CODE_INVENTORY.md        Mode A inventory (routing, storage schema, file map)
  VERIFICATION_MODE_REGISTER.md   one row per distinct element, Mode A/B, accessor used
  DISCREPANCY_LOG.md              the 3 intentional failures, explained
  playwright.config.ts
  tsconfig.json
  .env / .env.example              BASE_URL and friends

  pages/                           Page Object Model
    BasePage.ts                    abstract base — setup() navigates to its `path`
    NavbarComponent.ts             the shared dynamic navbar (navbar.js), composed
                                    into HomePage/MensPage/WomensPage/HomeLivingPage,
                                    or used standalone for pages with no other UI
    HomePage.ts                    index.html — navbar + footer
    SignInPage.ts                  signin.html
    SignUpPage.ts                  signup.html
    CartPage.ts                    cart.html
    MensPage.ts                    mens.html — navbar + product grid
    WomensPage.ts                  womens.html — navbar + product grid (different
                                    container id/button text than MensPage — real
                                    site inconsistency, not a copy-paste slip here)
    HomeLivingPage.ts               Home&Living.html — navbar + product grid (a third,
                                    different container id/button pattern again)

  fixtures/
    customFixtures.ts              extends Playwright's test with one fixture per
                                    Page Object above, plus a standalone `navbar`
                                    fixture; every spec file imports `test`/`expect`
                                    from here instead of '@playwright/test'

  utils/
    config.ts                      BASE_URL (via dotenv) + shared timeouts
    navigationHelpers.ts           gotoPath() — waits for domcontentloaded, stubs
                                    external hero/logo images with a local placeholder
    waitHelpers.ts                 triggerAndCaptureAlert()/assertNoDialogFires() —
                                    this app uses native alert() everywhere
    storageHelpers.ts              localStorage precondition seeding (addInitScript-
                                    based `seed*()` + one-shot `seedNow()`)
    accessibilityHelpers.ts        contrastRatio()/isLargeText() for the WCAG 1.4.3 cases

  test-data/
    testData.ts                    makeAccount()/makeCartRecord() factories, shared
                                    constants (EXISTING_ACCOUNT, MENS_PRODUCT_A/B,
                                    TWO_ITEM_CART, XSS_PAYLOAD)

  tests/                           one folder per feature area, mirroring the
                                    register's own Module column
    homepage/         top-menu, logo, footer, guest-flows, authenticated-flows
    search/            search, boundary-search
    signin/           signin
    signup/           signup, boundary-signup-password/email/fullname
    cart/             cart-basket
    cross-cutting/    equivalence-classes, decision-tables, state-transitions,
                      data-integrity, concurrency, recovery, client-side-security,
                      compliance, analytics, usability, compatibility, localisation,
                      seo, interface-contract
    accessibility/    accessibility-keyboard/forms-labels/images/contrast/
                      error-identification/page-structure
    e2e/              cross-feature-e2e, keyboard-e2e
```

## Design notes worth knowing before editing this suite

- **Page Objects expose locators as getters/methods, not raw strings.** A spec file
  never writes `page.locator('#mail')` — it writes `signInPage.emailField`. The
  `[SOURCE VERIFIED]`/`[DOM VERIFIED]` provenance comment lives once, directly above
  that getter's definition in `pages/*.ts`, and `VERIFICATION_MODE_REGISTER.md` indexes
  all of them without duplicating the comments 34 times across spec files.
- **`BasePage.setup(path?)` navigates to the page's own fixed `path` by default**,
  matching the "BasePage → setup() → Navigates to BASE_URL" pattern. A few checks need
  the SAME conceptual thing (e.g. the dynamic navbar) verified on a page with no
  dedicated Page Object (about-us.html, contact-us.html, blog.html, terms-of-use.html)
  — those use the standalone `navbar` fixture plus `gotoPath()` directly instead of
  inventing a near-empty class for four pages that add nothing beyond the shared navbar.
- **`seedUserdata`/`seedLoginStatus`/`seedCartData`/`clearAllStorage`
  (`utils/storageHelpers.ts`) use `page.addInitScript()`**, which re-fires on *every*
  subsequent navigation within that page. That's correct when a test just needs a
  precondition to hold steady across ordinary navigations — but several test cases
  (logout, cart-item removal, a hard storage clear, a malformed-JSON reload) have Steps
  that themselves reload the page and expect to observe the *result* of that reload. An
  addInitScript re-seed there would silently overwrite the very transition under test.
  Those cases use `seedNow()` (one-shot `page.evaluate`) instead — see the comments on
  `tests/homepage/logo.spec.ts` TC-013/014 and `tests/cart/cart-basket.spec.ts` TC-044
  for the first three places this was diagnosed live.
- **`utils/navigationHelpers.ts`'s `gotoPath()` (used by every `BasePage.setup()`)
  stubs every external image request** (the app embeds several hero banners and the
  Logo itself from external CDNs) with a local 1×1 PNG. Confirmed live: the Logo's
  `.wth` CSS class sizes via `width:auto` off the image's *intrinsic* dimensions, so a
  slow/unreachable external host can render it at a genuine 0-width box until the image
  loads — an external-network-latency flake, not an app defect, and not worth
  re-diagnosing in every spec file.
- **Alert handling**: this app uses native `alert()` everywhere, which blocks the page
  until dismissed. `utils/waitHelpers.ts`'s `triggerAndCaptureAlert()` /
  `assertNoDialogFires()` register the `page.once('dialog', ...)` listener *before* the
  triggering action and always deregister it afterward — registering listeners that
  never fire (e.g. via `page.waitForEvent('dialog')` awaited before the click) causes
  real deadlocks and, if stacked, an "already handled" throw. Always use these helpers
  (or the Page Object methods that wrap them, like `SignInPage.login()`) rather than ad
  hoc dialog handling.
- **TC-009/TC-151's "empty search" native `change`-event semantics**: a real browser
  only fires `change` when the value at blur differs from the value at focus-*in* time.
  A single focus→type→Backspace→blur cycle back to `""` does **not** fire `change` at
  all (live-confirmed via a throwaway probe). The register's "type a char, delete it,
  commit" step is reproduced faithfully as two separate commit cycles instead. See the
  comment on `tests/search/search.spec.ts` TC-009.

## Coverage

154/154 Phase 1 test cases converted. Folder→Section mapping matches the register's own
Module column (e.g. "Sign In" → `tests/signin/signin.spec.ts`, "Boundary — Sign Up
Password" → `tests/signup/boundary-signup-password.spec.ts`).
