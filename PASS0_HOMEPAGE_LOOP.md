# Homepage / Sign In / Sign Up — Loop Prompt, Pass 0

**Scope:** `index.html`, `signin.html`, `signup.html`, `navbar.js`, `index.js`, `search-algo.js` (every script `index.html` loads; `signin.html`/`signup.html` carry no external script, only inline `<script>` blocks read in full below).
**Rule basis:** Rule 24 (Pass 0 tasks), Section 7 (Source Inventory), Section 8 (Data-Class catalogue), Section 9 (Transition Inventory), Rule 27 (stop gate). Per Rule 27, **no test cases are produced in this pass.**
**Prior artifact on disk:** `TEST_CASES_HOMEPAGE_UNIFIED_REGISTER_V6.md` (127 TC, repo root) — the most recent completed register for this exact scope, built under an earlier rule-numbering (Rule 19a–e, Rule 21) than the prompt now in force (Rule 21a, Sections 7–9, Rule 24/27/30/34). Treated below as the prior-round baseline for duplicate-checking, not as the `Manual_TestCase_Dump.xlsx` master — see Scope Declaration.

---

## (a) Critical Findings — Rule 21a

Carried forward from V6 (still verified true on a fresh read this pass): three navbar implementations exist; Sign In/Sign Up's own menu links are unguarded plain `<a>` tags bypassing BR2; search matches by case-insensitive prefix and accepts empty submissions; Sign Up's email check only verifies a `.com` suffix (no `@`) and is case-sensitive on it; Sign Up's name check accepts a single space; no label has a working `for`; neither auth page has an `<h1>` or a real `<title>`; `logout()` never touches `cartData`; no cross-tab storage sync exists; `#navbar` is `position: sticky`; passwords are stored in plaintext; sign-in failure message doesn't leak account existence; no uniqueness check on sign-up email.

**New this pass** (fresh line-by-line re-read of `signin.html`/`signup.html`):

1. **Sign In's password field is `<input id="pass" type="text">`, not `type="password"`** (`signin.html:44`). The password is rendered in plaintext on screen as the user types — a distinct, visually-observable defect from the already-known plaintext-storage finding, and independently testable/screenshot-able.
2. **Sign Up's password field has the identical `type="text"` defect** (`signup.html:44`).
3. **`signin.html`'s markup never closes `<form>`, its container `<div id="signin_container">`, `<label>` opening tags used without a matching structural close before the browser's implicit end-tag insertion, nor is there a `</form>`/`</div>` before `</body>`** (`signin.html:39,44,50` — the last explicit tag before `</body>` is the `<p>` at line 49; no `</form>` or closing `</div>` appears anywhere in the file). `signup.html`, by contrast, closes both correctly (`signup.html:50-51`) — a structural asymmetry between the two pages that a DOM/HTML-validity check can catch on Sign In only.
4. **On failed sign-in, the user is redirected to `signup.html`, not back to `signin.html`** (`signin.html:71`) — an unusual UX choice (a failed *login* attempt lands on the *registration* page) worth its own test, separate from the alert-text assertion.
5. **The success alert text is literally `"Login successfull"`** (`signin.html:74`) — missing the second "l" in "successful"; a copy defect distinct from any functional one.
6. **`loginStatus` is written via `localStorage.setItem("loginStatus", true)` passing a boolean, not `JSON.stringify(true)`** (`signin.html:75`) — `localStorage` coerces it to the string `"true"` implicitly; `navbar.js:1` reads it back through `JSON.parse`, which happens to parse `"true"` correctly, but the write-side inconsistency (boolean vs. JSON string) is a latent fragility, not yet a live defect.
7. **Sign Up's redirect uses `location.replace(...)`** (`signup.html:78`) while Sign In's failure/success paths both use `location.href = ...` (`signin.html:71,76`) — `replace()` drops the registration page from session history (Back won't return to it), an intentional-looking but untested difference in navigation semantics between the two forms.

---

## (b) Section 7 — Source Inventory (`INV-` IDs)

### `index.html`

| INV ID | Element / behavior | file:line |
|---|---|---|
| INV-IDX-001 | `<title>Styleup</title>` | index.html:7 |
| INV-IDX-002 | Logo `<img onclick="homePage()">`, `alt="logo"` | index.html:15 |
| INV-IDX-003 | `#products_page` MEN/WOMEN/KIDS/HOME & LIVING divs (click-delegated by navbar.js) | index.html:18-23 |
| INV-IDX-004 | `#search-bar` text input, placeholder only, no `<label>` | index.html:25 |
| INV-IDX-005 | `#login_Status` container, populated entirely by `navbar.js` | index.html:27-28 |
| INV-IDX-006 | Invite-friends banner (static image + copy + button, no handlers) | index.html:30-36 |
| INV-IDX-007 | Home-pic banner `<img>` | index.html:38-40 |
| INV-IDX-008 | Offers banner `<img>` (Ajio CDN) | index.html:41 |
| INV-IDX-009 | `#crauser_1` carousel: `<img id="image_url">`, `.prev`/`.next` buttons | index.html:42-47 |
| INV-IDX-010 | "Must Have" static banner `<img>` | index.html:48 |
| INV-IDX-011 | `#products_grid2` container (populated by index.js) | index.html:49-51 |
| INV-IDX-012 | Deals banner `<img>` | index.html:52 |
| INV-IDX-013 | `#products_grid1` container (populated by index.js) | index.html:53-55 |
| INV-IDX-014 | `#crauser_2` carousel: `<img id="image2_url">`, `.prev1`/`.next1` buttons | index.html:56-61 |
| INV-IDX-015 | Footer `#table` — 10 rows, "Online Shopping" / "Useful Links" columns | index.html:65-82 |
| INV-IDX-015a | "Men" cell — `onclick="window.location.href='mens.html'"` (only live cell in col. 1) | index.html:71 |
| INV-IDX-015b | "Contact Us" — `<a href="http://127.0.0.1:5501/contact-us.html">` (absolute, hardcoded host) | index.html:71 |
| INV-IDX-015c | "Women"/"Kids"/"Home"/"Living"/"Beauty"/"Gift cards" cells — plain text, no link/handler | index.html:72-77 |
| INV-IDX-015d | "Blog", "About Us", "Terms of use" — real `<a>` links (absolute) | index.html:72-74 |
| INV-IDX-015e | "Tracking Order", "Shipping", "Returns", "Cancellation", "SiteMap", "Privacy Policy" — plain text, unlinked | index.html:75-80 |
| INV-IDX-016 | Marketing copy blocks (`<h4>`/`<p>`/`<ol>`) | index.html:86-99 |
| INV-IDX-017 | Stray empty `<a href="about-us.html"></a>` after `</html>`, outside `<body>` | index.html:103 |
| INV-IDX-018 | Script load order: `index.js`, `navbar.js`, `search-algo.js` — all placed *after* `</html>` | index.html:106-108 |

### `navbar.js`

| INV ID | Behavior | file:line |
|---|---|---|
| INV-NAV-001 | `login_status` read via `JSON.parse(localStorage.getItem('loginStatus')) \|\| false` | navbar.js:1 |
| INV-NAV-002 | Authenticated branch: builds avatar, "Log Out", cart icon + `#cart-items` span (hardcoded `0`) | navbar.js:4-35 |
| INV-NAV-003 | "Log Out" div → `logout()` | navbar.js:16-18 |
| INV-NAV-004 | Cart icon click → `cart.html` | navbar.js:20-33 |
| INV-NAV-005 | `#cart-items` initialized to literal `0`, not read from `cartData` at render time (only `index.js`'s `cartItems()` reconciles it, and only on `index.html`) | navbar.js:27-29 |
| INV-NAV-006 | Guest branch: builds "Sign In"/"Sign Up" divs | navbar.js:37-50 |
| INV-NAV-007 | `logout()` — sets `loginStatus` to `false` (boolean, same coercion pattern as INV-SIN finding), `location.reload()` — no `cartData` reference | navbar.js:52-55 |
| INV-NAV-008 | `#products_page` click delegation → `verifyLogin()` | navbar.js:59-84 |
| INV-NAV-009 | `verifyLogin()` — guest branch alerts "Please Login First", redirects `signin.html`; authenticated branch reads `event.target.innerText` to route | navbar.js:63-84 |
| INV-NAV-010 | `homePage()` — Logo's `onclick` target | navbar.js:88-90 |

### `index.js` (homepage-only decorative/interactive script)

| INV ID | Behavior | file:line |
|---|---|---|
| INV-IDXJS-001 | `load` listener → `cartItems()` | index.js:1-3 |
| INV-IDXJS-002 | `crauser1` array (4 images) + `.prev`/`.next` wraparound handlers | index.js:6-33 |
| INV-IDXJS-003 | `crauser2` array (4 images) + `.prev1`/`.next1` wraparound handlers | index.js:35-62 |
| INV-IDXJS-004 | `products_grid1`/`products_grid2` population (8 + 10 static images) | index.js:64-100 |
| INV-IDXJS-005 | `cartItems()` — sums `cartData[].quantity` into `#cart-items` | index.js:102-109 |

### `search-algo.js` (loaded on `index.html`; drives `#search-bar`)

| INV ID | Behavior | file:line |
|---|---|---|
| INV-SRC-001 | `final[]` static catalog, 108 entries | search-algo.js:1-1262 |
| INV-SRC-002 | `searchArr` read from `searchData` (unused after assignment on this page) | search-algo.js:1263 |
| INV-SRC-003 | `#search-bar` `'change'` listener → `getValue()` (fires on blur/commit, not per keystroke) | search-algo.js:1264 |
| INV-SRC-004 | `getValue()` reads `event.target.value` | search-algo.js:1265-1269 |
| INV-SRC-005 | `getArray(str)` — filters `final[]` by brand/gender/category **prefix**, case-insensitive (`.substring(0,str.length).toUpperCase()===str.toUpperCase()`) | search-algo.js:1270-1280 |
| INV-SRC-006 | Empty-string case: `substring(0,0)` is always `""`, so an empty query matches every record (defect, carried forward) | search-algo.js:1273-1275 |
| INV-SRC-007 | Match branch: `alert(`${n} no. of products found`)`, writes `searchData`, redirects `search.html` | search-algo.js:1281-1285 |
| INV-SRC-008 | No-match branch: `alert("Product not Found")`, no redirect, no storage write | search-algo.js:1286-1288 |

### `signin.html` (static navbar + inline script; no `navbar.js`)

| INV ID | Element / behavior | file:line |
|---|---|---|
| INV-SIN-001 | Static navbar duplicate — Logo `<a href="index.html"><img>`, no `alt` | signin.html:15-19 |
| INV-SIN-002 | MEN/WOMEN/KIDS/HOME LIVING — plain unguarded `<a>` tags (no login gate) | signin.html:22-25 |
| INV-SIN-003 | Decorative search input — no `id`, no listener | signin.html:31 |
| INV-SIN-004 | Decorative cart image — no `id`, no listener, no `alt` | signin.html:34 |
| INV-SIN-005 | `<form>` (never explicitly closed — see Critical Finding 3) | signin.html:39 |
| INV-SIN-006 | Email field `#mail`, `type="text"`, `<label for="">` (empty `for`) | signin.html:41-42 |
| INV-SIN-007 | Password field `#pass`, `type="text"` — **plaintext-on-screen defect** (Critical Finding 1) | signin.html:43-44 |
| INV-SIN-008 | Terms of Service link (absolute URL) | signin.html:46-47 |
| INV-SIN-009 | Submit button, `value="Sign In"` | signin.html:48 |
| INV-SIN-010 | "Sign up" link → `signup.html` | signin.html:49 |
| INV-SIN-011 | `userarr` loaded from `userdata` | signin.html:53 |
| INV-SIN-012 | Submit listener registered on the form | signin.html:54 |
| INV-SIN-013 | `loggeddetails` loaded from `logginName` (write-only elsewhere in the app — never read back, carried-forward finding) | signin.html:56 |
| INV-SIN-014 | `myfunction()` — `preventDefault`, reads Email/Password | signin.html:57-61 |
| INV-SIN-015 | Match loop — `==` loose equality, both Email **and** Password must match one `userarr` entry | signin.html:62-68 |
| INV-SIN-016 | On match: push to `loggeddetails`, write `logginName` | signin.html:63-65 |
| INV-SIN-017 | No-match branch: `alert("Incorrect Id or password")`, redirect to **`signup.html`** (Critical Finding 4) | signin.html:69-72 |
| INV-SIN-018 | Match branch: `alert("Login successfull")` (Critical Finding 5), `loginStatus` set as boolean (Critical Finding 6), redirect `index.html` | signin.html:73-77 |

### `signup.html` (static navbar + inline script; no `navbar.js`)

| INV ID | Element / behavior | file:line |
|---|---|---|
| INV-SUP-001 | Static navbar duplicate, identical structure to Sign In's | signup.html:13-35 |
| INV-SUP-002 | `<form>` … `</form></div>` — **properly closed**, unlike Sign In | signup.html:37,50-51 |
| INV-SUP-003 | Full Name field `#name`, `type="text"` | signup.html:39-40 |
| INV-SUP-004 | Email field `#mail`, `type="text"` | signup.html:41-42 |
| INV-SUP-005 | Password field `#pass`, `type="text"` — plaintext-on-screen defect (Critical Finding 2) | signup.html:43-44 |
| INV-SUP-006 | Terms link | signup.html:46-47 |
| INV-SUP-007 | Submit button, `value="Sign up"` | signup.html:48 |
| INV-SUP-008 | "Sign in" link → `signin.html` | signup.html:49 |
| INV-SUP-009 | Submit listener registered | signup.html:56 |
| INV-SUP-010 | `userarr` loaded from `userdata` | signup.html:58 |
| INV-SUP-011 | `myfunction()` — builds `obj{name,Email,Password}` | signup.html:59-65 |
| INV-SUP-012 | Name check: `obj.name.length<=0` → `alert("Enter correct name")`, return (whitespace-satisfies-gate — a single space passes) | signup.html:66-68 |
| INV-SUP-013 | Email check: `obj.Email.substring(len-4)!=".com"` → `alert("Enter correct Email")`, return (no `@` check; case-sensitive `.com`) | signup.html:69-71 |
| INV-SUP-014 | Password check: `obj.Password.length<8` → `alert("Weak Password:Enter atleast 8 character")`, return | signup.html:72-74 |
| INV-SUP-015 | Unconditional `userarr.push(obj)` — **no uniqueness/duplicate-email check anywhere in the function** | signup.html:76 |
| INV-SUP-016 | Write `userdata`, `location.replace("signin.html")` (Critical Finding 7 — `replace`, not `href`) | signup.html:77-78 |

**Total Source Inventory items:** 18 (index.html) + 10 (navbar.js) + 5 (index.js) + 8 (search-algo.js) + 18 (signin.html) + 16 (signup.html) = **75 INV- entries**.

---

## (c) Section 8 — Data-Class Catalogue

| Input | Data classes applicable |
|---|---|
| Search bar (`#search-bar`, index.html) | valid full brand/category/gender term · valid but partial/prefix term (defect-accepting) · case-variant of a valid term (lower/UPPER/MiXeD) · empty submission · whitespace-only · internal-space term · alphanumeric (letters+digits) · purely numeric · leading/trailing space around a valid term · special-character/script-payload term · very-long string (≫ any real brand/category name) |
| Sign In — Email (`#mail`) | valid, registered · valid, unregistered · empty · whitespace-only · case-variant of a registered email's local/domain part · leading/trailing space · malformed (no `@`) — accepted here since Sign In does no format check at all, only equality against stored records · script-payload string |
| Sign In — Password (`#pass`) | correct for the given email · incorrect · empty · whitespace-only · case-variant of the correct password (`==` is case-sensitive, so this is a rejection class) · leading/trailing space · script-payload string |
| Sign Up — Full Name (`#name`) | valid alphabetic name · empty · single space (boundary-accept defect) · multiple spaces · leading/trailing space around a valid name · numeric-leading name · script-payload/HTML-injection string · very-long string |
| Sign Up — Email (`#mail`) | valid (`...something.com`) · empty · missing `@` (accepted — defect) · missing `.com` suffix entirely · ends in `.COM` (case-variant, rejected — defect per Critical Finding, distinct from V6's) · exactly 4 chars ending `.com` (shortest string the length-based check can pass) · duplicate of an already-registered email (accepted — no uniqueness check, Critical Finding) · whitespace-only · script-payload string |
| Sign Up — Password (`#pass`) | length ≥ 8 (valid) · length exactly 8 (lower boundary, accept) · length exactly 7 (upper boundary, reject) · empty · whitespace-only, length ≥ 8 (accepted — whitespace counts toward length) · script-payload string of length ≥ 8 |

---

## (d) Section 9 — Transition Inventory (`TRN-` IDs)

| TRN ID | From → To | Trigger | Guard? |
|---|---|---|---|
| TRN-001 | `index.html` → `signin.html` | navbar Sign In (guest) | none |
| TRN-002 | `index.html` → `signup.html` | navbar Sign Up (guest) | none |
| TRN-003 | `index.html` → `mens.html`/`womens.html`/`kids.html`/`Home&Living.html` | top-menu item click, authenticated | `verifyLogin()` gate (guest redirected to TRN-005 instead) |
| TRN-004 | `index.html` → `cart.html` | cart icon click, authenticated only (icon doesn't exist for guests) | implicit (icon absent when guest) |
| TRN-005 | `index.html` → `signin.html` | top-menu item click while guest | forced by `verifyLogin()` |
| TRN-006 | `index.html` → `search.html` | valid search term, match found | `getArray()` non-empty result |
| TRN-007 | `index.html` → `index.html` (self, no navigation) | search term, no match | none — stays put |
| TRN-008 | `signin.html` → `index.html` | successful login | credential match |
| TRN-009 | `signin.html` → `signup.html` | failed login (Critical Finding 4) | credential mismatch |
| TRN-010 | `signin.html` → `signup.html` | "Sign up" link click | none |
| TRN-011 | `signin.html` → `index.html` | Logo click | none |
| TRN-012 | `signin.html` → `mens.html`/etc. | static top-menu link click | **none — bypasses BR2 entirely** (Critical Finding, carried forward) |
| TRN-013 | `signup.html` → `signin.html` | successful registration | all 3 field checks pass |
| TRN-014 | `signup.html` → `signin.html` | "Sign in" link click | none |
| TRN-015 | `signup.html` → `signup.html` (self, no navigation) | any of the 3 validation failures | none — stays put |
| TRN-016 | `signup.html` → `index.html` | Logo click | none |
| TRN-017 | `signup.html` → `mens.html`/etc. | static top-menu link click | none — bypasses BR2 |
| TRN-018 | `index.html` (authenticated) → `index.html` (guest) | Log Out click | `logout()` unconditional |
| TRN-019 | any page → `index.html` | Logo click (dynamic-navbar pages) | none |
| TRN-020 | `index.html` footer → `mens.html` | "Men" cell click | none |
| TRN-021 | `index.html` footer → `contact-us.html`/`blog.html`/`about-us.html`/`terms-of-use.html` | real footer `<a>` links | none |
| TRN-022 | `search.html` → `index.html` (or any dynamic-navbar page) | Logo click from Search Results | none |

**Total Transition Inventory items:** 22 TRN- entries (edges strictly within/adjacent to the Homepage/Sign In/Sign Up scope; edges wholly inside `search.html`/`cart.html` internals are out of scope here and already covered by the separate Search Results register).

---

## (e) Declared Denominator

Denominator = distinct applicable **(Source Inventory item × Section 8 data-class × relevant dimension)** combinations, counted only where the combination is *reachable* (e.g., "script-payload" only applies to free-text inputs, not to click targets; "boundary length" only applies to Sign Up Password/Email/Name).

- Interactive elements with a data-class-bearing input: 4 (Search bar, Sign In Email, Sign In Password, Sign Up Name, Sign Up Email, Sign Up Password → **6** fields, corrected count) × their respective class counts (11+8+7+8+9+6 = 49 field/class pairs).
- Non-input elements (links, buttons, static cells, carousels, footer rows) from the Source Inventory: 75 total INV- entries − 6 field entries already counted above = 69, each contributing at minimum one positive-path cell, plus a state/permission cell wherever a guard exists (TRN- rows with "Guard?" ≠ none: TRN-003, 005 → +2), plus a defect/discrepancy cell wherever a Critical Finding attaches (7 new + ~13 carried-forward ≈ 20 cells, not all mapped 1:1 to a single INV row since several findings span multiple rows).
- Transition Inventory: 22 TRN- entries, each a candidate cell independent of the field/data-class count above (they test navigation, not input values).

**Working denominator for this pass: 49 (field × data-class) + 69 (element positive-path) + 2 (guard cells) + 22 (transition cells) = 142 candidate cells**, before subtracting (i) whatever V6's 127 test cases already satisfy under a mapping to this new INV-/TRN- scheme, and (ii) the exclusions below. This number is a working estimate, not a rule-derived exact count — the prompt text available to me does not specify a single closed-form formula beyond "count applicable cells," so I built it bottom-up from the inventories above and am stating the arithmetic openly rather than asserting false precision.

---

## (f) Scope Declaration Against the Master Register

**`Manual_TestCase_Dump.xlsx` has not been supplied in this conversation.** No file by that name (or a close variant) exists anywhere under the repository (checked: `Get-ChildItem`/`find` for `*Manual_TestCase*` and `*Manual TestCase*` — zero matches). I cannot score Rule 30's master-alignment percentage without it.

In its absence, the closest available artifact is `TEST_CASES_HOMEPAGE_UNIFIED_REGISTER_V6.md` (127 TC, repo root) — a prior, completed register for this identical scope, built under an earlier version of this same iterative methodology. I am treating it as the **prior-round baseline** for duplicate-checking against the new (element, technique, data-class) triples this pass's INV-/Section 8/Section 9 inventories define — not as a substitute master file, since it predates the INV-/TRN- ID scheme and I cannot verify it was cross-checked against a true master dump either.

**If a `Manual_TestCase_Dump.xlsx` (or equivalent) exists for this scope, please provide it before Pass 1 generation begins** so Rule 30 scoring is possible. If none exists, say so explicitly and I will proceed using V6 as the sole baseline.

**Update — master file supplied.** `Manual_TestCase_Dump.md` (797 cases, 47 modules, converted from the `.xlsx`) is now on disk. It is a **generic e-commerce reference register**, not written against this codebase — most of its modules (Payment, Checkout, Wishlist, Coupons, etc.) don't correspond to anything Styleup has. The three modules addressing this pass's scope are **Home Page** (`HOM-001`–`018`, 18 cases), **Registration** (`REG-001`–`024`, 24 cases), and **Login** (`LOG-001`–`025`, 25 cases) — **67 cases total**, read in full from `Manual_TestCase_Dump.md:128-220`.

### Rule 30 — Master Alignment Scoring

Each of the 67 cases was checked against the actual Styleup source (not assumed) to classify it as: **feature absent** (Styleup has nothing resembling it — mark N/A with the reason), **fully covered** (an existing V6 test case already asserts the same concept), or **applicable gap** (the underlying element/behavior exists in Styleup, but the master case's specific technique or data class isn't yet in V6 — a genuine Pass 1 candidate).

| Module | Total | Feature-absent (N/A) | Fully covered by V6 | Applicable gap (Pass 1 candidate) |
|---|---|---|---|---|
| Home Page | 18 | 10 | 3 | 5 |
| Registration | 24 | 15 | 2 | 7 |
| Login | 25 | 17 | 3 | 5 |
| **Total** | **67** | **42 (63%)** | **8 (12%)** | **17 (25%)** |

**Master alignment score = 8 / 25 applicable cases = 32%** (N/A cases are excluded from the denominator — they don't measure this codebase's test coverage, they measure how much of a generic e-commerce feature set Styleup simply doesn't implement).

**Feature-absent modules driving the 42 N/A cases** (no test case can meaningfully exist for these — confirmed by source read, not assumed): mega-menu/subcategories, deal timers, personalised/recently-viewed rails, wishlist, mobile+OTP registration/login, password-confirm field, password-strength meter, show/hide toggle, mobile-number field, marketing opt-in, referral codes, DOB/age gate, verification email, forgot-password/reset flow (the whole `LOG-009`–`016` cluster), CAPTCHA/lockout, Remember-Me checkbox, federated/SSO login, deep-link return-to-origin (no PDP page exists to return to), locale/currency selector, and consent checkboxes on either form (both pages show the Terms sentence as plain text with no actual `<input type="checkbox">`).

**The 17 applicable gaps** (each maps to Section 7 `INV-` items already inventoried above, and is a candidate for Pass 1 — none of these have been written as test cases yet):

| # | Master ID | Gap — what V6 doesn't yet test | Relevant INV items |
|---|---|---|---|
| 1 | HOM-001 | A single dedicated "page loads, all sections render without console errors" smoke case | INV-IDX-001–018 |
| 2 | HOM-005 | Carousel auto-rotate is claimed by the master but Styleup's `#crauser_1`/`#crauser_2` never auto-advance — worth a discrepancy case proving they stay static without interaction | INV-IDXJS-002/003 |
| 3 | HOM-006 | Carousel arrow navigation exists and wraps around, but there are no dot indicators at all — a gap distinct from #2 | INV-IDXJS-002/003 |
| 4 | HOM-013 | Cart badge is reconciled only once, on `index.html`'s `load` event — it does **not** live-update "without a full page reload" if `cartData` changes while the tab is already open | INV-IDXJS-005, INV-NAV-005 |
| 5 | HOM-015 | Sticky-header-on-scroll — **currently excluded** under the confirmed Viewport/Responsive exclusion; flagging again here since the master treats it as its own Header/Data-Integrity case, not a responsive-breakpoint case. Recommend revisiting whether to lift just this one. | `navbar.css:14` (finding, carried forward) |
| 6 | REG-003 | Sign Up shows one `alert()` per submit for the *first* failing field only (name → email → password, in that order) — never all invalid fields at once. Worth a case demonstrating the ordering, not just each check individually | INV-SUP-012–014 |
| 7 | REG-004 | The weak `.substring(-4)===".com"` check lets `"@domain.com"` (no local part) and similar malformed-but-`.com`-suffixed strings through — concrete new data classes beyond what's in V6's boundary set | INV-SUP-013 |
| 8 | REG-007 | No password complexity policy exists at all — an 8+-char all-digit or all-lowercase password is accepted. Distinct from V6's length-only boundary cases | INV-SUP-014 |
| 9 | REG-012 | No maximum length or character-set restriction on Full Name — a very long name or a name with symbols is accepted without limit | INV-SUP-012 |
| 10 | REG-013 | No trimming anywhere — a Sign Up email padded with a trailing space fails the `.com`-suffix check (a legitimate email gets wrongly rejected) | INV-SUP-013 |
| 11 | REG-017 | No `<input type="checkbox">` backs the Terms sentence on either form — the "acceptance" is purely cosmetic text, never enforced | INV-SUP-006, INV-SIN-008 |
| 12 | REG-023 / LOG-023 | `cartData` is a single unscoped array (Critical Finding, carried forward) — registering/signing in doesn't "merge" a guest cart into an account cart because there was only ever one cart; worth a case proving persistence-without-merge rather than assuming a merge operation exists | `cartData` finding (V6 #9) |
| 13 | LOG-001 | The authenticated user's name never appears anywhere in the header after login (carried-forward finding) — not yet asserted by a dedicated case; also, login always redirects to `index.html`, never to "the intended page" | INV-NAV-002 |
| 14 | LOG-006 | Sign In's match loop (`Email==el.Email`) is case-**sensitive** on both fields — logging in with the registered email in a different case fails, contradicting a common (but here absent) case-insensitive-email convention | INV-SIN-015 |
| 15 | LOG-017 | A tab opened *after* login reflects the authenticated state (localStorage is read fresh on load); a tab that was already open before login does **not** update live — no `storage` event listener exists (carried-forward finding) to distinguish the two | INV-NAV-001, `navbar.js` (finding, carried forward) |
| 16 | LOG-019 | Because `navbar.js` runs its `login_status` check synchronously per page load, a browser **Back** navigation into the bfcache after logout may render a stale, still-authenticated header rather than the true (logged-out) state — a plausible, concrete, not-yet-tested defect scenario | INV-NAV-001, INV-NAV-007 |
| 17 | LOG-023 | See #12 (`REG-023`) — identical reasoning applies on the Sign In side | `cartData` finding (V6 #9) |

Note #12/#17 are the same underlying gap approached from Sign Up and Sign In respectively — they'll likely collapse into one or two test cases in Pass 1, not two independent ones. Effective distinct-gap count: **16**.

---

## (g) Exclusion Review

Per Rule 24/27, the following categories are proposed as **excluded** from this pass's generation scope, consistent with earlier rounds (V6 recorded no Performance or Viewport/Responsive test cases):

| # | Category | Why excluded (default) | Status |
|---|---|---|---|
| 1 | **Performance** (load time, script-execution timing, image-decode latency, carousel animation smoothness) | No performance budget, timing assertion, or Lighthouse-style threshold is stated anywhere in the source or prior registers; nothing in `index.html`/`navbar.js`/`index.js`/`search-algo.js` defines a measurable performance contract to test against. | `[REVIEW]` |
| 2 | **Viewport / Responsive / touch-target sizing** (mobile breakpoints, tap-target dimensions, orientation change) | No media queries were found in `navbar.css`/`index.css` during prior rounds' review, and no responsive behavior is coded in any homepage script. **Caveat:** `#navbar`'s `position: sticky` (Critical Finding, carried forward — `navbar.css:14`, `top: 1px`, `z-index: 9999999`) is a scroll/viewport-adjacent behavior that sits right at this exclusion's edge — it's arguably "layout behavior on scroll," not "responsive to viewport size," but close enough to flag explicitly rather than silently fold into either bucket. | `[REVIEW]` |

**These are proposed exclusions, not confirmed ones.** Per the gate, I need your explicit decision on each before Pass 1 can generate anything against them.

---

**Per Rule 27, this is the stop point. No test cases have been generated in this pass.**
