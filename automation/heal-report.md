# Heal Report

## 2026-08-20 — signup.spec.ts email field locator

**Root cause:** `signup.html:42` renamed the email input's `id` from `mail` to `mail_ID`.
Plain static HTML/JS (no bundler, no CSS Modules/styled-components), so the source
`id` attribute is exactly what renders — no live-DOM check was needed.

**Page object:** `pages/SignUpPage.ts` — `emailField` getter

- Old locator: `this.page.locator('#mail')`
- New locator: `this.page.getByPlaceholder('Enter Email')`
- Why not `getByRole`/`getByLabel`: the field has a `<label for="">Email</label>` whose
  `for` is empty and never wired to the input's `id`, so there's no accessible name to
  match against with `getByRole('textbox', { name: ... })` or `getByLabel`. The
  `placeholder="Enter Email"` attribute is unchanged and unique on the page, making it
  the most resilient available anchor (preference order: role → label/placeholder/text →
  testid → CSS; no `data-testid` exists here).
- Suggestion for devs: add `data-testid="signup-email"` (and properly wire the
  `<label for>` to the input `id`) to prevent this class of breakage recurring.

**Confidence:** high — the failing locator (`#mail`), the changed source line
(`signup.html:42`), and the element's purpose (email input inside the signup form,
same placeholder text `"Enter Email"` referenced in the page object's own comment)
all line up unambiguously.

**Tests fixed (all failed via the same shared `SignUpPage.fillEmail`/`fillForm` call,
all were "waiting for locator('#mail')" timeouts — selector-resolution failures, not
assertion/logic failures):**
- signup/signup.spec.ts › TC-029: Valid registration
- signup/signup.spec.ts › TC-030: Full Name empty only (single-field permutation)
- signup/signup.spec.ts › TC-031: Email empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-032: Password empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-033: All three fields empty (all-empty permutation)
- signup/signup.spec.ts › TC-034: Email missing ".com"
- signup/signup.spec.ts › TC-035: Defect: email missing "@" incorrectly accepted
- signup/signup.spec.ts › TC-041: Password under 8 characters

**Not touched:** `nameField` (`#name`), `passwordField` (`#pass`), `submitButton`,
`signInLink`, `termsLink`, `logoLink` — all still match current source unchanged.
TC-035 is a documented app defect (missing "@" validation); its assertions were left
untouched per playbook — only its locator dependency was broken and is now fixed.

**Verification:** not run in this session — `npx playwright test` requires an
approval this environment did not grant. Fix is based on direct source read of
`signup.html:42` (id rename confirmed) plus the page object's own pre-existing
source-line comments, per playbook's "read/analyse the source (primary)" method.
Recommend a human/CI run of `tests/signup/signup.spec.ts` to confirm before merging.

---

## 2026-08-20 (re-heal) — signup.spec.ts email field locator regressed to `#email`

**Note:** at the time of this run the checked-in `pages/SignUpPage.ts` locator was
actually `this.page.locator('#email')` (not `#mail` as the entry above records) —
`test-results/results.json` confirms every failure as
`waiting for locator('#email')`. `#email` never existed in `signup.html` at all
(source input `id` is `mail_ID`, source register above), so this was a plain
selector-resolution failure (not an assertion/behavioural failure) — in scope to heal.

**Page object:** `pages/SignUpPage.ts` — `emailField` getter

- Old locator: `this.page.locator('#email')`
- New locator: `this.page.getByPlaceholder('Enter Email')`
- Evidence: `signup.html:42` — `<input id="mail_ID" type="text" placeholder="Enter Email">`.
  App is plain static HTML/JS served via `python -m http.server` (no bundler/CSS
  Modules/hashing), so source attributes are exactly what renders — no live-DOM
  check via Playwright MCP was necessary (playbook step 3 doesn't apply here).
- Why not `getByRole`/`getByLabel`: `<label for="">Email</label>` has an empty,
  unwired `for` attribute (signup.html:41), so there's no accessible name to match
  via `getByRole('textbox', { name })` or `getByLabel('Email')`. `placeholder="Enter
  Email"` is stable and unique on the page (the only other input's placeholder is
  the navbar search box), making it the best available option per the preference
  order (role → label/placeholder/text → testid → CSS). No `data-testid` exists.
- Suggestion for devs: add `data-testid="signup-email"` and wire `<label for="mail_ID">`
  to the input so future refactors don't silently break both accessibility and tests.

**Confidence:** high.

**Tests fixed (same shared `SignUpPage.fillEmail`/`fillForm` dependency; all were
"waiting for locator('#email')" timeouts per `test-results/results.json`):**
- signup/signup.spec.ts › TC-029: Valid registration
- signup/signup.spec.ts › TC-030: Full Name empty only (single-field permutation)
- signup/signup.spec.ts › TC-031: Email empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-032: Password empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-033: All three fields empty (all-empty permutation)
- signup/signup.spec.ts › TC-034: Email missing ".com"
- signup/signup.spec.ts › TC-035: Defect: email missing "@" incorrectly accepted
- signup/signup.spec.ts › TC-041: Password under 8 characters

**Not touched:** `nameField` (`#name`), `passwordField` (`#pass`), `submitButton`,
`signInLink`, `termsLink`, `logoLink`, `categoryLink` — all already match current
source. TC-035's assertions encode a known app defect (missing "@" validation) and
were left untouched; only its broken locator dependency was fixed. TC-036–TC-040
were already passing and untouched.

**Verification:** static verification only — traced `test-results/results.json`
error locations against `pages/SignUpPage.ts:51` and the current `signup.html:42`
markup; confirmed `#email` matches zero elements and `getByPlaceholder('Enter
Email')` matches exactly one. Live `npx playwright test` run was not executed this
session (command required interactive approval not granted). Edits are left
uncommitted for human review before merge, per playbook.

---

## 2026-08-21 — signup.spec.ts `nameField`/`passwordField` id renames + email placeholder space

**Root cause:** `test-results/results.json` shows all 8 failures as the same
`waiting for locator('#name')` timeout at `SignUpPage.ts:48` (`fillName`), inside
`fillForm`/`registerExpectingAlert` — a selector-resolution failure, in scope to
heal. Reading current `signup.html` (lines 39-44) against the page object's own
source-line comments turned up **three** stale locators in the same fill chain
(fixing only the first would just move the timeout to the second):

| Field | Old locator | Old source id/placeholder | Current source (signup.html) |
|---|---|---|---|
| `nameField` | `#name` | `id="name"` | `id="fullname"` (line 40) |
| `emailField` | `getByPlaceholder('Enter Email')` | — | `placeholder="EnterEmail"`, no space (line 42) — the page object's own comment already documented this rename but the getter had never been updated to match |
| `passwordField` | `#pass` | `id="pass"` | `id="password"` (line 44) |

**Page object:** `pages/SignUpPage.ts` — `nameField`, `emailField`, `passwordField` getters

- `nameField`: `this.page.locator('#name')` → `this.page.locator('#fullname')`
- `emailField`: `this.page.getByPlaceholder('Enter Email')` → `this.page.getByPlaceholder('EnterEmail')`
- `passwordField`: `this.page.locator('#pass')` → `this.page.locator('#password')`
- Why CSS id selectors and not `getByRole`/`getByLabel`: all three inputs sit under
  `<label for="">...</label>` with an empty, unwired `for` (signup.html:39,41,43), so
  there's no accessible name to match via role/label. `emailField` already uses
  `getByPlaceholder` (its only available anchor since the id `mail_ID` didn't change);
  `nameField`/`passwordField` have no unique placeholder-independent alternative better
  than id — CSS id selector is the pragmatic last resort per the preference order.
- App is plain static HTML/JS via `python -m http.server` — no bundler/CSS Modules/
  hashing — so source ids/placeholders are exactly what renders; no live-DOM check
  via Playwright MCP was needed.
- Suggestion for devs: add `data-testid` attributes to all three signup inputs
  (`signup-fullname`, `signup-email`, `signup-password`) and wire the `<label for>`
  attributes to their inputs — three renames in as many heal cycles on this same
  form is a sign the current id-based coupling is fragile.

**Confidence:** high — all three mismatches are direct, unambiguous string diffs
between the page object's own source-line comments/getters and the current
`signup.html` markup.

**Tests fixed (same shared `fillForm`/`registerExpectingAlert` → `fillName` timeout):**
- signup/signup.spec.ts › TC-029: Valid registration
- signup/signup.spec.ts › TC-030: Full Name empty only (single-field permutation)
- signup/signup.spec.ts › TC-031: Email empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-032: Password empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-033: All three fields empty (all-empty permutation)
- signup/signup.spec.ts › TC-034: Email missing ".com"
- signup/signup.spec.ts › TC-035: Defect: email missing "@" incorrectly accepted
- signup/signup.spec.ts › TC-041: Password under 8 characters

**Not touched:** `submitButton`, `signInLink`, `termsLink`, `logoLink`,
`categoryLink` — all still match current source unchanged. No assertions, test
logic, waits, test data, or app source were modified.

### ⚠ Candidate real bug found while tracing the fix — flagged, NOT fixed

`signup.html`'s inline `<script>` (lines 61-65) still reads the submitted values by
form-control name lookup:
```js
let obj={
    name:formtag.name.value,
    Email:formtag.mail_ID.value,
    Password:formtag.pass.value
}
```
- `formtag.pass` no longer resolves to anything — the input's `id` is now
  `"password"`, not `"pass"` — so `formtag.pass` is `undefined` and
  `formtag.pass.value` throws a `TypeError` synchronously, before any `alert(...)`
  or `window.location.replace(...)` in the function ever runs.
- Separately, `formtag.name` is shadowed by `HTMLFormElement`'s own reflected
  `name` IDL attribute (the form tag itself has no `name=""` attribute, so this
  evaluates to `""`, not the fullname input's value) regardless of the input's id —
  this looks like a pre-existing defect independent of this round's rename.
- If confirmed live, this would break `myfunction()` for every submission attempt —
  no alert fires and no redirect/`localStorage` write happens — which would fail
  TC-029/TC-035 on the `toHaveURL`/`userdata` assertions and hang TC-030–034/041
  waiting for an alert that never fires. **This is app behaviour, not a locator
  problem — per playbook, out of scope to fix and not touched.**
- This could not be confirmed with a live run this session (`npx playwright test`
  required interactive approval that wasn't granted in this environment).
  **Recommend a human/CI run of `tests/signup/signup.spec.ts` immediately after
  merging this locator fix** to check whether these 8 tests now pass or fail on
  assertions/timeouts for this reason — if they do, the fix belongs in
  `signup.html`'s inline script (`formtag.pass` → `formtag.password`), not in the
  test suite.

**Verification:** static only, per the same environment constraint as the prior
entries above — `npx playwright test` / `npx playwright --version` both required
interactive approval not granted this session. Edits left uncommitted for human

## 2026-08-21 — signin.spec.ts email/password field locators

**Root cause:** `signin.html:42,44` renamed the email input's `id` from `mail` to
`mailID`, and the password input's `id` from `pass` to `passwordkey`. Plain static
HTML/JS (no bundler, no CSS Modules/styled-components), so the source `id`
attribute is exactly what renders — no live-DOM check was needed.

**Page object:** `pages/SignInPage.ts` — `emailField` and `passwordField` getters

- Old locators: `this.page.locator('#mail')` / `this.page.locator('#pass')`
- New locators: `this.page.getByPlaceholder('Enter Email')` /
  `this.page.getByPlaceholder('Enter Password')`
- Why not `getByRole`/`getByLabel`: both fields have `<label for="">...</label>`
  whose `for` is empty and never wired to the input's `id`, so there's no
  accessible name to match with `getByRole('textbox', { name: ... })` or
  `getByLabel`. The `placeholder="Enter Email"` / `placeholder="Enter Password"`
  attributes are unchanged and unique on the page, making them the most resilient
  available anchor (preference order: role → label/placeholder/text → testid →
  CSS; no `data-testid` exists here).
- Suggestion for devs: add `data-testid="signin-email"` /
  `data-testid="signin-password"` (and properly wire the `<label for>` attributes
  to their inputs' `id`s) to prevent this class of breakage recurring.

**Confidence:** high — the failing locator (`#mail`, timing out identically across
all 6 tests), the changed source lines (`signin.html:42,44`), and the elements'
purpose (email/password inputs inside the sign-in form, same placeholder text
referenced in the page object's own prior comments) all line up unambiguously.

**Tests fixed (all failed via the same shared `SignInPage.login` → `fillEmail`
call, all were "waiting for locator('#mail')" timeouts — selector-resolution
failures, not assertion/logic failures):**
- signin/signin.spec.ts › TC-016: Valid credentials sign in successfully
- signin/signin.spec.ts › TC-017: Unregistered email, well-formed password
- signin/signin.spec.ts › TC-018: Registered email, wrong password
- signin/signin.spec.ts › TC-019: Email field empty (single-field permutation)
- signin/signin.spec.ts › TC-020: Password field empty (single-field permutation)
- signin/signin.spec.ts › TC-021: Both fields empty (all-empty permutation)

**Not touched:** `submitButton`, `signUpLink`, `termsLink`, `logoLink`,
`categoryLink` — all still match current source unchanged. No assertions, test
logic, waits, test data, or app source were modified.

### ⚠ Candidate real bug found while tracing the fix — flagged, NOT fixed

`signin.html`'s inline `<script>` (lines 57-78) still reads the submitted values
by form-control name lookup:
```js
let Email=formtag.mail.value;
let Password=formtag.pass.value;
```
- Neither `formtag.mail` nor `formtag.pass` resolves anymore — the inputs' `id`s
  are now `"mailID"` and `"passwordkey"`, and neither input has a `name`
  attribute (confirmed via grep — the only `name=` in the file is the unrelated
  `<meta name="viewport">` tag). Per the HTML spec's form named-property-access
  algorithm, this makes `formtag.mail` and `formtag.pass` both `undefined`, so
  `.value` throws a `TypeError` synchronously inside `myfunction()`, before the
  `if/else` branch, any `alert(...)`, or `localStorage`/`window.location` write
  ever runs.
- This is the same class of defect already flagged against `signup.html` above
  (id renamed without updating the script's name-based lookup, and without adding
  a matching `name=""` attribute).
- If confirmed live, this would break sign-in for every submission attempt — no
  alert ever fires — which would hang TC-016/017/018/019/020/021 on
  `triggerAndCaptureAlert` waiting for a dialog that never appears (a *different*
  failure mode than the locator timeout being healed here: an app-behaviour
  failure, not a selector-resolution failure). **This is app behaviour, not a
  locator problem — per playbook, out of scope to fix and not touched.**
- This could not be confirmed with a live run this session (`npx playwright test`
  required interactive approval that wasn't granted in this environment).
  **Recommend a human/CI run of `tests/signin/signin.spec.ts` immediately after
  merging this locator fix** to check whether these 6 tests now pass or fail on
  a hung/missing alert for this reason — if they do, the fix belongs in
  `signin.html`'s inline script (`formtag.mail` → `formtag.mailID`, `formtag.pass`
  → `formtag.passwordkey`, or add matching `name=""` attributes to the inputs),
  not in the test suite.

**Verification:** static only, per the same environment constraint as the prior
entry above — `npx playwright test` required interactive approval not granted
this session. Edits left uncommitted for human
review before merge, per playbook.

## 2026-08-21 — logo.spec.ts navbar logo `alt` attribute rename

**Root cause:** `test-results/results.json` shows all 4 failures resolving to the
same locator, `img[alt="logo"]`, defined in `pages/NavbarComponent.ts:20` (the
`logo` getter used by every test in `logo.spec.ts` via the `navbar` fixture):
- TC-012 — `expect(navbar.logo).toBeVisible()` failed, "element(s) not found",
  on the *first* path in its loop (`/index.html`).
- TC-013, TC-014 — timed out inside `navbar.clickLogo()` →
  `NavbarComponent.ts:60` (`this.logo.click()`), both reached via
  `homePage.setup()`, which lands on `/index.html`.
- TC-015 — same `toBeVisible()` failure as TC-012, also via `homePage.setup()`
  → `/index.html`.

Grepping every page for `alt="` on the navbar image (`onclick="homePage()"`)
shows `index.html:15` alone was changed:
`alt="logo"` → `alt="logoStyleup"`. Every other navbar.js page — `about-us.html`,
`mens.html`, `blog.html`, `contact-us.html`, `home&living.html`,
`terms-of-use.html`, `navbar.html`, plus `kids.html`/`womens.html`/`search.html`
(different markup shape, template literal) — still has `alt="logo"` unchanged.
This exactly matches the failure pattern: TC-011 (not in the failing set) only
ever visits `about-us.html` and never asserts `navbar.logo` visibility on
`index.html`, so it was unaffected; every failing test touches `/index.html`
with a `navbar.logo` assertion or click. Plain static HTML app, no bundler/CSS
Modules/hashing — the source `alt` attribute is exactly what renders, so no
live-DOM check via Playwright MCP was necessary (and MCP browser/tool
permissions were not granted in this session regardless).

**Page object:** `pages/NavbarComponent.ts` — `logo` getter

- Old locator: `this.page.locator('img[alt="logo"]')`
- New locator: `this.page.getByRole('img', { name: 'logo' })`
- Why this survives the rename: Playwright's `getByRole` name matching is a
  case-insensitive **substring** match by default (not exact), so
  `{ name: 'logo' }` matches an accessible name of both `"logo"` (unchanged
  pages) and `"logoStyleup"` (index.html) — one locator now covers every page
  navbar.js renders on, present and future variants of this same rename
  included. Confirmed via grep that no other image's `alt` on any of these
  pages contains the substring "logo", so the match stays unique per page (no
  strict-mode violation). This also moves the locator up the preference order
  from a raw CSS attribute selector to `getByRole` with an accessible name —
  the top-preferred strategy in the playbook.

**Confidence:** high — the diff (`index.html:15` `alt="logo"` →
`alt="logoStyleup"`) is a direct, unambiguous string change confirmed by grep
across every navbar.js page, and every one of the 4 failures traces to exactly
this element via the shared `navbar.logo` getter.

**Tests fixed:**
- homepage/logo.spec.ts › TC-012: Logo renders/functions identically across pages and login states
- homepage/logo.spec.ts › TC-013: Logo survives logout
- homepage/logo.spec.ts › TC-014: Logo survives a hard cache/localStorage clear
- homepage/logo.spec.ts › TC-015: Logo across 3 automatable browser engines (Chrome/Edge≈Chromium, Firefox, Safari≈WebKit)

**Not touched:** TC-011 (already passing, never asserts logo visibility on
index.html), `categoryLink`, `searchBar`, `guestSignInButton`,
`guestSignUpButton`, `logOutButton`, `cartBadge`/`cartIcon` getters — all still
match current source unchanged. No assertions, test logic, waits, test data, or
app source were modified.

**Suggestion for devs:** the navbar logo `<img>`'s `alt` text now differs
between `index.html` (`"logoStyleup"`) and every other page (`"logo"`) for no
apparent functional reason — worth aligning to one value, or better, adding a
stable `data-testid="navbar-logo"` so accessible-name drift like this can't
break locators again.

**Verification:** static only — traced `test-results/results.json` error
locations against `pages/NavbarComponent.ts:20,60` and the current `alt`
attribute on every navbar.js-bearing page via grep. Both
`npx playwright test tests/homepage/logo.spec.ts` and the Playwright MCP
browser tools required interactive approval that was not granted in this
session, so no live run or live-DOM snapshot was possible. Edits are left
uncommitted for human review before merge, per playbook. **Recommend a
human/CI run of `tests/homepage/logo.spec.ts` to confirm** before merging.

## 2026-08-31 — signup.spec.ts `nameField`/`passwordField` placeholder-spacing drift

**Root cause:** `test-results/results.json` shows all 8 failures as the same
`waiting for getByPlaceholder('Enter Your Full Name')` timeout at
`SignUpPage.ts:48` (`fillName`), reached via `fillForm`/`registerExpectingAlert`
— a selector-resolution failure, in scope to heal. Reading current
`signup.html:39-44` against the page object's own locators turned up **two**
stale locators in the same fill chain (fixing only the first would just move
the timeout to the second):

| Field | Old locator | Current source (signup.html) |
|---|---|---|
| `nameField` | `getByPlaceholder('Enter Your Full Name')` | `id="fullname"`, `placeholder="EnterYourFullName"` (line 40) — spaces removed |
| `emailField` | `getByPlaceholder('Email')` | `id="mailID"`, `placeholder="Email"` (line 42) — placeholder unchanged, already correct; only its comment referenced the stale id `mail_ID` |
| `passwordField` | `getByPlaceholder('Enter Password')` | `id="password"`, `placeholder="EnterPassword"` (line 44) — space removed |

**Page object:** `pages/SignUpPage.ts` — `nameField`, `emailField` (comment only), `passwordField` getters

- `nameField`: `getByPlaceholder('Enter Your Full Name')` → `getByPlaceholder('EnterYourFullName')`
- `passwordField`: `getByPlaceholder('Enter Password')` → `getByPlaceholder('EnterPassword')`
- `emailField`: locator unchanged (already matches source); updated stale source-line comment (`mail_ID` → `mailID`) only.
- Why placeholder and not `getByRole`/`getByLabel`: all three inputs still sit
  under `<label for="">...</label>` with an empty, unwired `for` (signup.html:39,41,43),
  so there is no accessible name to match via role/label. Placeholder text is
  unique per field and unchanged in kind (only whitespace was stripped), making
  it the best available anchor per the preference order (role → label/placeholder/
  text → testid → CSS; no `data-testid` exists).
- App is plain static HTML/JS via `python -m http.server` — no bundler/CSS
  Modules/hashing — so source ids/placeholders are exactly what renders; no
  live-DOM check via Playwright MCP was needed.
- Suggestion for devs: add `data-testid` attributes to all three signup inputs
  and wire the `<label for>` attributes to their inputs — this is the fourth
  heal cycle against this same form's locators.

**Confidence:** high — both mismatches are direct, unambiguous string diffs
between the page object's prior getters and the current `signup.html` markup.

**Tests fixed (all failed via the same shared `fillForm`/`registerExpectingAlert`
→ `fillName` timeout, per `test-results/results.json`):**
- signup/signup.spec.ts › TC-029: Valid registration
- signup/signup.spec.ts › TC-030: Full Name empty only (single-field permutation)
- signup/signup.spec.ts › TC-031: Email empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-032: Password empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-033: All three fields empty (all-empty permutation)
- signup/signup.spec.ts › TC-034: Email missing ".com"
- signup/signup.spec.ts › TC-035: Defect: email missing "@" incorrectly accepted
- signup/signup.spec.ts › TC-041: Password under 8 characters

**Not touched:** `submitButton`, `signInLink`, `termsLink`, `logoLink`,
`categoryLink` — all still match current source unchanged. No assertions, test
logic, waits, test data, or app source were modified.

### ⚠ Candidate real bug found while tracing the fix — flagged, NOT fixed

`signup.html`'s inline `<script>` (lines 61-65) still reads the submitted
values by form-control name/id lookup:
```js
let obj={
    name:formtag.name.value,
    Email:formtag.mail_ID.value,
    Password:formtag.pass.value
}
```
- None of the three inputs has a `name=""` attribute (confirmed via read of
  the full file), and their current `id`s are `fullname`, `mailID`, `password`
  — none of which is `name`, `mail_ID`, or `pass`. Per the form
  named-property-access algorithm, `formtag.mail_ID` and `formtag.pass` both
  resolve to `undefined`, so `.value` on either throws a `TypeError`
  synchronously inside `myfunction()`, before any `alert(...)` or
  `window.location.replace(...)` runs. (`formtag.name` doesn't throw — it
  resolves to the form's own reflected, empty `name` IDL attribute, a string,
  so `.value` on it is merely `undefined`, not a throw — but the very next
  line throws on `formtag.mail_ID`.)
- This is the same class of defect flagged against this file in the
  2026-08-21 entry above, recurring with different id values after another
  source edit — the inline script's control lookups have never been kept in
  sync with the input `id` renames.
- If confirmed live, this would make every submit fail before any alert fires
  or navigation happens: TC-029/TC-035 would fail their `toHaveURL`/`userdata`
  assertions (locator resolves and fills fine, but no navigation occurs), and
  TC-030/031/032/033/034/041 would time out inside `triggerAndCaptureAlert`
  waiting for a dialog that never fires — a *different* failure signature
  (dialog-wait timeout, not `locator.fill`/selector-resolution timeout) from
  the one just healed here. **This is app behaviour, not a locator problem —
  per playbook, out of scope to fix and not touched.**
- Could not be confirmed with a live run this session — `npx playwright test`
  required interactive approval that was not granted in this environment.
  **Recommend a human/CI run of `tests/signup/signup.spec.ts` immediately
  after merging this locator fix** to check whether these 8 tests now fail on
  assertions/dialog-timeouts for this reason — if they do, the fix belongs in
  `signup.html`'s inline script (`formtag.mail_ID` → `formtag.mailID`,
  `formtag.pass` → `formtag.password`, or add matching `name=""` attributes to
  the three inputs), not in the test suite.

**Verification:** static only — traced `test-results/results.json` error
locations against `pages/SignUpPage.ts:48` and the current `signup.html:39-44`
markup. `npx playwright test tests/signup/signup.spec.ts` required
interactive approval not granted this session, so no live run was possible.
Edits are left uncommitted for human review before merge, per playbook.

## 2026-08-31 (re-heal) — signup.spec.ts all three field `id`s renamed to `*_enter` suffix

**Root cause:** `test-results/results.json` shows all 8 failures as the same
`waiting for locator('#fullname')` timeout at `SignUpPage.ts:50` (`fillName`),
reached via `fillForm`/`registerExpectingAlert` — a selector-resolution
failure, in scope to heal. Reading current `signup.html:39-44` against the
page object's own getters/comments turned up all three input `id`s renamed
again (fixing only `nameField` would just move the timeout to `emailField`
next):

| Field | Old locator | Current source (signup.html) |
|---|---|---|
| `nameField` | `locator('#fullname')` | `id="full_name_enter"`, `placeholder="Enter Your FullName"` (line 40) |
| `emailField` | `locator('#mailID')` | `id="mail_ID_enter"`, `placeholder="Email"` (line 42) — placeholder unchanged |
| `passwordField` | `locator('#password')` | `id="password_enter"`, `placeholder="Enter Password"` (line 44) — placeholder regained its space |

**Page object:** `pages/SignUpPage.ts` — `nameField`, `emailField`, `passwordField` getters

- `nameField`: `this.page.locator('#fullname')` → `this.page.getByPlaceholder('Enter Your FullName')`
- `emailField`: `this.page.locator('#mailID')` → `this.page.getByPlaceholder('Email')`
- `passwordField`: `this.page.locator('#password')` → `this.page.getByPlaceholder('Enter Password')`
- Why placeholder and not `getByRole`/`getByLabel`/`getByTestId`: all three
  inputs still sit under `<label for="">...</label>` with an empty, unwired
  `for` (signup.html:39,41,43), so there is no accessible name to match via
  role/label, and no `data-testid` exists anywhere in the file. This is the
  third consecutive heal cycle where only the `id` moved and the placeholder
  text stayed intact (or reverted, in the password field's case), so
  `getByPlaceholder` is both the best available anchor per the preference
  order and empirically the most stable one across these renames — switching
  off `id`-based CSS selectors entirely for this form.
- App is plain static HTML/JS via `python -m http.server` — no bundler/CSS
  Modules/hashing — so source ids/placeholders are exactly what renders; no
  live-DOM check via Playwright MCP was needed.
- Suggestion for devs: add `data-testid` attributes to all three signup
  inputs and wire the `<label for>` attributes to their inputs — this is the
  fifth heal cycle against this same form's locators, and every cycle so far
  has been an `id` rename with the placeholder left alone or only
  whitespace-adjusted.

**Confidence:** high — all three mismatches are direct, unambiguous string
diffs between the page object's prior getters and the current `signup.html`
markup; no other elements on the page share these placeholders.

**Tests fixed (all failed via the same shared `fillForm`/`registerExpectingAlert`
→ `fillName` timeout, per `test-results/results.json`):**
- signup/signup.spec.ts › TC-029: Valid registration
- signup/signup.spec.ts › TC-030: Full Name empty only (single-field permutation)
- signup/signup.spec.ts › TC-031: Email empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-032: Password empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-033: All three fields empty (all-empty permutation)
- signup/signup.spec.ts › TC-034: Email missing ".com"
- signup/signup.spec.ts › TC-035: Defect: email missing "@" incorrectly accepted
- signup/signup.spec.ts › TC-041: Password under 8 characters

**Not touched:** `submitButton`, `signInLink`, `termsLink`, `logoLink`,
`categoryLink` — all still match current source unchanged. No assertions,
test logic, waits, test data, or app source were modified.

### ⚠ Candidate real bug — still present, still NOT fixed (see 2026-08-21/2026-08-31 entries above)

`signup.html`'s inline `<script>` (lines 61-65) still reads submitted values
via `formtag.name`, `formtag.mail_ID`, `formtag.pass` — none of which match
any current input `id` (`full_name_enter`, `mail_ID_enter`, `password_enter`)
or any `name=""` attribute (the file still has none on these inputs). This is
the same recurring defect flagged twice already; each round of `id` renames
has widened rather than closed the gap. Per playbook this is app behaviour,
out of scope to fix here. **Recommend a human/CI run of
`tests/signup/signup.spec.ts` immediately after merging this locator fix** to
confirm whether these 8 tests now pass, or fail/hang on assertions or a
dialog that never fires for this reason.

**Verification:** static only — traced `test-results/results.json` error
locations against `pages/SignUpPage.ts:50` and the current `signup.html:39-44`
markup. Live `npx playwright test tests/signup/signup.spec.ts` runs were
attempted repeatedly this session via both Bash and PowerShell tools but each
required interactive approval that was not granted, so no live run was
possible. Edits are left uncommitted for human review before merge, per
playbook.

## 2026-08-31 (re-heal 2) — signup.spec.ts all three field `id`s renamed again, `_enter` suffix dropped

**Root cause:** `test-results/results.json` shows all 8 failures as the same
`waiting for locator('#full_name_enter')` timeout at `SignUpPage.ts:49`
(`fillName`), reached via `fillForm`/`registerExpectingAlert` — a
selector-resolution failure, in scope to heal. Reading current
`signup.html:39-44` against the page object's own getters/comments confirmed
all three input `id`s changed again (fixing only `nameField` would just move
the timeout to `emailField` next):

| Field | Old locator | Current source (signup.html) |
|---|---|---|
| `nameField` | `locator('#full_name_enter')` | `id="full_name"`, `placeholder="Enter Your FullName"` (line 40) — placeholder unchanged |
| `emailField` | `locator('#mail_ID_enter')` | `id="mail_ID"`, `placeholder="Email"` (line 42) — placeholder unchanged |
| `passwordField` | `locator('#password_enter')` | `id="password"`, `placeholder="Enter Password"` (line 44) — placeholder unchanged |

**Page object:** `pages/SignUpPage.ts` — `nameField`, `emailField`, `passwordField` getters

- `nameField`: `this.page.locator('#full_name_enter')` → `this.page.getByPlaceholder('Enter Your FullName')`
- `emailField`: `this.page.locator('#mail_ID_enter')` → `this.page.getByPlaceholder('Email')`
- `passwordField`: `this.page.locator('#password_enter')` → `this.page.getByPlaceholder('Enter Password')`
- Why placeholder and not `getByRole`/`getByLabel`/`getByTestId`: all three
  inputs still sit under `<label for="">...</label>` with an empty, unwired
  `for` (signup.html:39,41,43), so there is no accessible name to match via
  role/label, and no `data-testid` exists anywhere in the file. Confirmed via
  grep that each placeholder (`Enter Your FullName`, `Email`, `Enter
  Password`) is unique on the page — the only other `placeholder` attribute
  belongs to the unrelated navbar search box. This is now the fourth
  consecutive heal cycle where only the `id` moved and the placeholder text
  stayed byte-for-byte identical, so `getByPlaceholder` remains the best
  available anchor per the preference order and the empirically most stable
  one across these renames.
- App is plain static HTML/JS via `python -m http.server` — no bundler/CSS
  Modules/hashing — so source ids/placeholders are exactly what renders; no
  live-DOM check via Playwright MCP was needed.
- Suggestion for devs: add `data-testid` attributes to all three signup
  inputs and wire the `<label for>` attributes to their inputs — this is the
  sixth heal cycle against this same form's locators, and the `id` has never
  once stayed stable between cycles while the placeholder text has never
  changed. Anchoring to a `data-testid` (or fixing the `id` churn) would end
  this cycle for good.

**Confidence:** high — all three mismatches are direct, unambiguous string
diffs between the page object's prior getters and the current `signup.html`
markup; no other elements on the page share these placeholders.

**Tests fixed (all failed via the same shared `fillForm`/`registerExpectingAlert`
→ `fillName` timeout, per `test-results/results.json`):**
- signup/signup.spec.ts › TC-029: Valid registration
- signup/signup.spec.ts › TC-030: Full Name empty only (single-field permutation)
- signup/signup.spec.ts › TC-031: Email empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-032: Password empty only (single-field permutation, others valid)
- signup/signup.spec.ts › TC-033: All three fields empty (all-empty permutation)
- signup/signup.spec.ts › TC-034: Email missing ".com"
- signup/signup.spec.ts › TC-035: Defect: email missing "@" incorrectly accepted
- signup/signup.spec.ts › TC-041: Password under 8 characters

**Not touched:** `submitButton`, `signInLink`, `termsLink`, `logoLink`,
`categoryLink` — all still match current source unchanged. No assertions,
test logic, waits, test data, or app source were modified.

### ⚠ Candidate real bug — still present, shifted shape, still NOT fixed

`signup.html`'s inline `<script>` still reads submitted values via
`formtag.name`, `formtag.mail_ID`, `formtag.pass`. With the current `id`s
(`full_name`, `mail_ID`, `password`):
- `formtag.mail_ID` now resolves correctly (the input's `id` is exactly
  `mail_ID`), so the email value would be read correctly — this leg of the
  bug has incidentally self-healed as a side effect of this rename.
- `formtag.pass` still does not resolve — no input has `id`/`name` `"pass"`
  (the password input's `id` is `"password"`) — but this is reached only
  *after* the line below, which fails first.
- `formtag.name` does not resolve to the fullname input either (its `id` is
  `full_name`, not `name`); it resolves instead to the form element's own
  reflected `name` IDL attribute, which is the empty string `""` (the
  `<form>` tag has no `name=""` attribute). `"".value` is `undefined` (no
  throw), but the very next line, `obj.name.length<=0`, calls `.length` on
  that `undefined` and throws a `TypeError` synchronously inside
  `myfunction()` — before the `Email`/`Password` checks, any `alert(...)`, or
  `window.location.replace(...)` ever run.
- This is the same class of defect flagged in every prior signup heal-report
  entry (inline script's control lookups never updated to match `id`
  renames) — the specific property that fails first has simply moved. Per
  playbook this is app behaviour, out of scope to fix here.
- If confirmed live, this would make every submission throw before any alert
  fires or navigation happens: TC-029/TC-035 would fail their
  `toHaveURL`/`userdata` assertions (locators resolve and fill fine, but no
  navigation occurs), and TC-030/031/032/033/034/041 would time out inside
  `triggerAndCaptureAlert` waiting for a dialog that never fires — a
  *different* failure signature (dialog-wait timeout / assertion failure,
  not `locator.fill`/selector-resolution timeout) from the one just healed
  here. **Recommend a human/CI run of `tests/signup/signup.spec.ts`
  immediately after merging this locator fix** to confirm whether these 8
  tests now pass, or fail/hang for this reason — if they do, the fix belongs
  in `signup.html`'s inline script (`formtag.name` → the fullname input's
  actual `id`, `formtag.pass` → `formtag.password`, or add matching
  `name=""` attributes to all three inputs), not in the test suite.

**Verification:** static only — traced `test-results/results.json` error
locations against `pages/SignUpPage.ts:49` and the current `signup.html:39-44`
markup; confirmed via grep that each new placeholder text is unique on the
page. `npx playwright test tests/signup/signup.spec.ts` required interactive
approval not granted this session, so no live run was possible. Edits are
left uncommitted for human review before merge, per playbook.

## 2026-09-02 — signup.spec.ts all three field `id`s renamed again (`_write` suffix dropped)

**Root cause:** `test-results/results.json` shows the single reported failure
(TC-029) as `waiting for locator('#fullName_write')` (`Test timeout of 30000ms
exceeded`) at `SignUpPage.ts:49` (`fillName`), reached via `fillForm` — a
selector-resolution failure (locator never resolved, no assertion involved),
in scope to heal. Reading current `signup.html:39-44` against the page
object's own getters/comments confirmed all three input `id`s changed again:

| Field | Old locator | Current source (signup.html) |
|---|---|---|
| `nameField` | `locator('#fullName_write')` | `id="fullName"`, `placeholder="Enter Your FullName"` (line 40) — placeholder unchanged |
| `emailField` | `locator('#mail_ID_write')` | `id="mail_ID"`, `placeholder="Email"` (line 42) — placeholder unchanged |
| `passwordField` | `locator('#password_write')` | `id="password"`, `placeholder="Enter Password"` (line 44) — placeholder unchanged |

**Page object:** `pages/SignUpPage.ts` — `nameField`, `emailField`, `passwordField` getters

- `nameField`: `this.page.locator('#fullName_write')` → `this.page.getByPlaceholder('Enter Your FullName')`
- `emailField`: `this.page.locator('#mail_ID_write')` → `this.page.getByPlaceholder('Email')`
- `passwordField`: `this.page.locator('#password_write')` → `this.page.getByPlaceholder('Enter Password')`
- Why placeholder and not `getByRole`/`getByLabel`/`getByTestId`: all three
  inputs still sit under `<label for="">...</label>` with an empty, unwired
  `for` (signup.html:39,41,43), so there is no accessible name to match via
  role/label, and no `data-testid` exists anywhere in the file. This is now
  the seventh consecutive heal cycle where only the `id` moved and the
  placeholder text stayed byte-for-byte identical, so `getByPlaceholder`
  remains the best available anchor per the preference order and the
  empirically most stable one across these renames.
- App is plain static HTML/JS via `python -m http.server` — no bundler/CSS
  Modules/hashing — so source ids/placeholders are exactly what renders; no
  live-DOM check via Playwright MCP was needed.
- Suggestion for devs: add `data-testid` attributes to all three signup
  inputs and wire the `<label for>` attributes to their inputs — the `id`
  has now churned seven times across heal cycles while the placeholder text
  has never once changed. Anchoring to a `data-testid` would end this cycle
  for good.

**Confidence:** high — all three mismatches are direct, unambiguous string
diffs between the page object's prior getters and the current `signup.html`
markup; confirmed via grep that each placeholder is unique on the page.

**Tests fixed:**
- signup/signup.spec.ts › TC-029: Valid registration

**Not touched:** `submitButton`, `signInLink`, `termsLink`, `logoLink`,
`categoryLink` — all still match current source unchanged. No assertions,
test logic, waits, test data, or app source were modified. Only TC-029 was
in the reported failing set this run; the other tests in this file were not
re-run and their status is unknown from `results.json` alone (it only
contains this one spec's result).

### ⚠ Candidate real bug — still present, still NOT fixed (recurring since 2026-08-21)

`signup.html`'s inline `<script>` (lines 55-79) still reads submitted values
via `formtag.name`, `formtag.mail_ID`, `formtag.pass`. Against the *current*
input `id`s (`fullName`, `mail_ID`, `password`):
- `formtag.mail_ID` now resolves correctly (input `id="mail_ID"` matches
  exactly) — this leg is incidentally correct again.
- `formtag.pass` still does not resolve — no input has `id`/`name` `"pass"`
  (the password input's `id` is `"password"`) — so `formtag.pass.value`
  throws a `TypeError` synchronously while building the `obj` literal, before
  any `if` check, `alert(...)`, or `localStorage`/`window.location` write
  runs.
- `formtag.name` does not resolve to the fullname input (its `id` is
  `fullName`, not `name`); it resolves instead to the `<form>` element's own
  reflected `name` IDL attribute — an empty string (no `name=""` attribute on
  the form tag) — so `formtag.name.value` is `undefined`, not a throw, but
  the very next line (`formtag.pass.value`) throws before that matters.
- This is the same recurring defect flagged in every prior signup heal-report
  entry since 2026-08-21 (inline script's control lookups never updated to
  match `id` renames). Per playbook this is app behaviour, out of scope to
  fix here.
- If confirmed live, this would make `myfunction()` throw on every
  submission before any alert fires or navigation/`localStorage` write
  happens — TC-029 would then fail on its `userdata` assertion (locator now
  resolves and fills fine, but no `localStorage` write occurs because the
  handler throws) rather than timing out on the locator. **Recommend a
  human/CI run of `tests/signup/signup.spec.ts` immediately after merging
  this locator fix** to confirm whether TC-029 now passes or fails on the
  `userdata` assertion for this reason — if it does, the fix belongs in
  `signup.html`'s inline script (`formtag.pass` → `formtag.password`, and
  `formtag.name` → the fullname input's actual `id`, or add matching
  `name=""` attributes to all three inputs), not in the test suite.

**Verification:** static only — traced `test-results/results.json` error
location against `pages/SignUpPage.ts:49` and the current `signup.html:39-44`
markup; confirmed via grep that each placeholder text is unique on the page.
Live test runs (`npx playwright test`, plain `node .../cli.js test`) were
attempted repeatedly this session via both Bash and PowerShell tools; every
invocation required interactive approval that was not granted, so no live
run was possible. Edits are left uncommitted for human review before merge,
per playbook.
