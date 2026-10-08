# Source Code Inventory — Homepage / Sign In / Sign Up

Produced per the Phase 2 protocol (`prompt_phase2_playwright_conversion_v2_source_aware.md`), Mode A section, before any locator was written. Every statement below cites `file:line`. Anything not confirmed by a read or grep is marked "not found."

## Repository / serving

- Repository root: `d:\Style-Up-E-commerce-Website--master` (no git metadata present at time of this inventory).
- Serving: plain static file server. Verified live in this session with `python -m http.server 5501`, confirmed reachable at `http://localhost:5501/index.html` (HTTP 200). `contact-us.html`/`index.html` also contain hardcoded absolute links to `http://127.0.0.1:5501/...` (`index.html:71-74`), consistent with this being the intended local dev origin.
- No build tooling of any kind: no `package.json`, no bundler config, no `dist/` output existed in the repo root prior to this automation scaffold. Tests run directly against the SOURCE `.html`/`.js` files — there is no built artifact to diverge from.

## Framework

Plain HTML + vanilla JavaScript, multi-page (one `.html` file per page, no client-side router). Confirmed no `react`, `vue`, `angular`, or SPA router reference anywhere (grep across all `.html`/`.js` files for `react`, `vue`, `Router` — zero matches).

## Routing mode and its effect on URL assertions

Plain multi-page navigation via `window.location.href = "<file>.html"` or `<a href="...">`. URL assertions must match a full `.html` filename, e.g. `/index.html`, `/signin.html`, `/mens.html` — never a SPA-style hash or path-only route. Confirmed via every navigation call cited in the File Map below.

**Filename-casing note (relevant to URL assertions from this flow):** `navbar.js:77` and `index.html`/`signin.html`/`signup.html`'s HOME LIVING links all target `Home&Living.html` (capital H); the actual on-disk file is `home&living.html` (lowercase, confirmed via directory listing). This resolves only because the local filesystem is case-insensitive. `cart.html:22,54` link to `Address.html` (capital A); the actual file is `address.html` (lowercase). Tests asserting these specific navigations should assert the URL the code actually produces (capital-cased), not the on-disk filename, since that is what a browser actually requests.

## File map

| Page | Renders from | JS that mutates its DOM / holds logic |
|---|---|---|
| `index.html` | `index.html` | `index.js` (carousels, product grids, cart badge count on load), `navbar.js` (login-state navbar, category-link gate, logo), `search-algo.js` (search) |
| `signin.html` | `signin.html` (static navbar markup, own inline `<script>`) | inline script `signin.html:52-79` (sign-in logic); **does not** load `navbar.js` |
| `signup.html` | `signup.html` (static navbar markup, own inline `<script>`) | inline script `signup.html:55-80` (sign-up logic); **does not** load `navbar.js` |
| `cart.html` | `cart.html` | inline script `cart.html:60-169` (render cart, quantity +/-, remove, coupon) |
| `mens.html` (representative gated category page) | `mens.html` | `mens.js`, `navbar.js`, `search-algo.js` |
| `about-us.html`, `contact-us.html`, `blog.html`, `terms-of-use.html` | own `.html` | each loads `navbar.js` (confirmed via grep: all four contain `<div id="login_Status">` and `<script src="navbar.js"></script>`) |

Confirmed by grep (`grep -n "navbar.js\|login_Status" about-us.html contact-us.html blog.html terms-of-use.html`): all four pages carry both the `#login_Status` container and the `navbar.js` script tag, i.e. all four render the **dynamic** navbar, not the static Sign-In/Sign-Up-style one.

## Storage schema (every key read/written on these 3 pages + their direct navbar dependency)

| Key | Written by | Read by | Value shape |
|---|---|---|---|
| `loginStatus` | `signin.html:75` (`localStorage.setItem("loginStatus",true)`); `navbar.js:53` (`logout()` sets it back to `false`) | `navbar.js:1` (`JSON.parse(localStorage.getItem('loginStatus'))\|\|false`) | boolean (`true`/`false`), not a JSON string in the true case — `signin.html:75` writes the bare boolean `true`, which `localStorage.setItem` coerces to the string `"true"`; `navbar.js:1` correctly `JSON.parse`s it back |
| `userdata` | `signup.html:77` (`localStorage.setItem('userdata', JSON.stringify(userarr))`) | `signin.html:53`, `signup.html:58` | JSON array of `{name, Email, Password}` (note the mixed casing: `name` lowercase, `Email`/`Password` capitalized — `signup.html:61-65`) |
| `logginName` | `signin.html:65` (on every successful login, pushes the full matched record) | `signin.html:56` (reads its own prior writes back into `loggeddetails`) | JSON array of `{name, Email, Password}` — full plaintext-password-bearing records, one appended per successful login, never trimmed or cleared |
| `cartData` | `cart.html:124,128,135,142` (quantity change / remove) | `cart.html:61,148`; `index.js:103` (badge count on `index.html` load) | JSON array of `{image_url, name, price, cartprice, quantity, ...}` |
| `searchData` | `search-algo.js:1284` | `search-algo.js:1263` (search.html's own render, out of scope here) | JSON array of matched product objects |

## Seeded / fixture accounts

None. Grepped `signin.html`, `signup.html` for any hardcoded credential literal — zero matches. All accounts are created at runtime via Sign Up; there is no pre-seeded account in source.

## Business-logic facts extracted verbatim (Mode A, cited)

- **Sign Up validation, exact order** (`signup.html:66-75`): `if(obj.name.length<=0)` → `"Enter correct name"` → `return` (short-circuit) → `else if(obj.Email.substring(obj.Email.length-4)!=".com")` → `"Enter correct Email"` → `return` → `else if(obj.Password.length<8)` → `"Weak Password:Enter atleast 8 character"` → `return` → else: push, `localStorage.setItem('userdata', ...)`, `window.location.replace("signin.html")`.
- **Sign In validation** (`signin.html:57-77`): loops `userarr`, matches `Email==el.Email && Password==el.Password` per record. On any match: push to `logginName` (`signin.html:64-65`), `flag=true`. After the loop: if `flag==false` → `alert("Incorrect Id or password")` then `window.location.href="signup.html"`; else → `alert("Login successfull")`, `localStorage.setItem("loginStatus",true)`, `window.location.href="index.html"`.
- **Category-link gate** (`navbar.js:63-84`, `verifyLogin()`): if `login_status==true`, branches on `event.target.innerText` (`'MEN'`→`mens.html`, `'WOMEN'`→`womens.html`, `'KIDS'`→`kids.html`, else→`Home&Living.html`); if false, `alert('Please Login First')` then `window.location.href = 'signin.html'`.
- **Search** (`search-algo.js:1264-1289`): fires on the `change` event (not `input`/`keyup`) of `#search-bar`. Matches if the typed string, case-insensitively, equals the *prefix* (same length) of `brand`, `gender`, OR `category` of any product in the in-memory `final` array. On ≥1 match: `alert(\`${filteredlist.length} no. of products found\`)`, writes `searchData`, navigates to `search.html`. On 0 matches: `alert("Product not Found")`, no navigation.
- **Logo** (`index.html:15`, `mens.html:17`, etc.): `<img onclick="homePage()">`; `homePage()` (`navbar.js:88-90`) sets `window.location.href = 'index.html'`. Sign In/Sign Up's Logo is a plain anchor instead: `signin.html:17-19` / `signup.html:15-17` — `<a href="index.html"><img ...></a>`, no `onclick`.
- **Dynamic navbar render** (`navbar.js:4-51`): branches once at script-load time on `login_status` (captured at `navbar.js:1`, not re-read reactively). Authenticated branch (`navbar.js:4-35`) appends an avatar `<img class="wth">`, a `<div>Log Out</div>` bound to `logout()`, and a cart `<div>` containing an `<img class="wth">` plus `<span id="cart-items">`. Guest branch (`navbar.js:36-51`) appends `<div>Sign In</div>` (→ `signin.html`) and `<div>Sign Up</div>` (→ `signup.html`). **Live-confirmed** in this session (Mode B, see Verification Mode Register) — guest: `<div>Sign In</div><div>Sign Up</div>`; authenticated: avatar `<img>`, `<div>Log Out</div>`, cart `<img>` + `<span id="cart-items">`.
- **Cart badge count on page load** (`index.js:102-109`, `cartItems()`): sums every item's `quantity` field from `cartData` into `#cart-items`'s `innerText`. Runs once on `window load`; **does not** re-run reactively when `cartData` changes in another tab.
- **`signin.html`/`signup.html` never read `loginStatus`** — confirmed by grep: neither file's inline script nor its static markup references `loginStatus` in any form. This is the source basis for Critical Finding 7 (static navbar never branches on login state).

## Not found (checked, confirmed absent)

- `gtag`, `dataLayer`, `analytics`, `sendBeacon`, `XMLHttpRequest`, `fetch(` — zero matches across every `.js` file.
- `Intl.`, `toLocaleString`, `i18n`, `locale` — zero matches across every `.js`/`.html` file.
- `cookie`, `consent` (case-insensitive) — matches only inside `terms-of-use.html`'s own body text, never as an interactive gating element.
- `maxlength` — zero matches on any of the fields in scope (`signin.html`, `signup.html` inputs).
- A `privacy-policy.html` or equivalent file — does not exist (grepped the whole project tree for `privacy` — no matching `.html` file).
