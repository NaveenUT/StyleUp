# Source Code Inventory — Search Results Page

Produced per the v3 framework-aware conversion prompt's Mode A section, before any locator was written. Every statement below cites `file:line`. Anything not confirmed by a read or a grep is marked "not found."

## Placeholder resolution

| Placeholder | Resolved value |
|---|---|
| `<project-root>` | `automation/Search/` (new, self-contained project inside the existing `automation/` folder) |
| `<app>` tag | `@styleup` |
| Pages in scope | Home (`index.html`), Sign In (`signin.html`), Search Results (`search.html`), Cart (`cart.html`) |

## Repository / serving

- Repository root: `d:\Style-Up-E-commerce-Website--master`. This project lives at `d:\Style-Up-E-commerce-Website--master\automation\Search\`, two levels below the app's own root.
- Serving: plain static file server, `python -m http.server 5501` run from the repo root. Confirmed reachable at `http://localhost:5501/search.html` (HTTP 200) throughout this session.
- No build tooling: plain HTML + vanilla JS, multi-page. Tests run directly against SOURCE, never a built artifact.

## Framework and routing

Plain HTML + vanilla JavaScript, multi-page navigation via `window.location.href="<file>.html"` or `<a href>`. No SPA router, no hash routing, no query-parameter routing anywhere in scope. URL assertions match a full `.html` filename (e.g. `/search.html`).

**Finding 1 (register), reconfirmed:** the search term reaches `search.html` entirely through the `searchData` localStorage key — `search-algo.js:1284-1285` writes it and navigates with a bare `window.location.href="search.html"`, no query string. `search.js:1` reads it back. No `location.search`/`URLSearchParams` exists anywhere in the codebase (grep-confirmed).

## File map

| Page | Renders from | JS that mutates its DOM / holds logic |
|---|---|---|
| `index.html` | `index.html` | `index.js`, `navbar.js`, `search-algo.js` |
| `signin.html` | `signin.html` (static navbar, own inline script) | inline script; does **not** load `navbar.js` |
| `search.html` | `search.html` | `search.js`, `navbar.js`, `search-algo.js` — **loaded in that order** (search.html:170-172) |
| `cart.html` | `cart.html` | inline script (render cart, quantity ± , remove) |

## ⚠ New finding this conversion — not in the Phase 1 register

**`search.html` loads both `search.js` and `search-algo.js`, and both declare `let searchArr` at top level.** Live-confirmed this session: this throws `"Identifier 'searchArr' has already been declared"` — a redeclaration SyntaxError. Because `let`/`const` bindings in a classic (non-module) script are checked for duplicates during that script's global-declaration-instantiation step, **before any of its statements execute**, this aborts `search-algo.js` in its entirety on this page — confirmed live by probing that neither `final` nor `getArray` ever become defined on `search.html`. Consequence: the navbar's own search bar is completely non-functional when used FROM `search.html` itself (searching again from here does nothing). No Phase 1 test case exercises this directly, so no new TC was added, per the "never expand scope" rule — recorded here, in `pages/SearchResultsPage.ts`'s header, and in `DISCREPANCY_LOG.md`.

## Storage schema

| Key | Written by | Read by | Value shape |
|---|---|---|---|
| `searchData` | `search-algo.js:1284` | `search.js:1` | JSON array of product objects `{name, brand, gender, category, price, strikedoffprice, discount, image_url}` |
| `loginStatus` | `signin.html:75`; `navbar.js`'s `logout()` | `navbar.js:1` | boolean, coerced to the string `"true"`/`"false"` |
| `userdata` | `signup.html:77` | `signin.html:53` | JSON array of `{name, Email, Password}` |
| `cartData` | `search.js:40-59` `addToCart()`; `cart.html` | `search.js:2`; `cart.html`; `navbar.js`/`index.js` (badge) | JSON array of `{image_url, name, price, cartprice, quantity}` |

## Business-logic facts extracted verbatim (Mode A, cited)

- **Matching algorithm** (`search-algo.js:1272-1280`, confirmed identical logic reused by `search.js`'s own filters): case-insensitive PREFIX match against `brand`/`gender`/`category` only — **never** `name` (Finding 2).
- **Filter/sort/brand non-composability** (Finding 3): every handler — `handlesortprice()` (search.js:61-74), `handlesortname()` (:75-92), `handlesortbrand()` (:93-105), and the three checkbox `change` listeners (:127-163) — reads/writes the single module-level `searchArr`, never a "currently displayed" subset.
- **Sort mutates in place** — ⚠ new finding this conversion, live-verified: `searchArr.sort(...)` (search.js:64,67) is `Array.prototype.sort`, which sorts the RECEIVER and returns the same reference. A sort followed by a filter therefore filters the now-PERMANENTLY-reordered `searchArr`, not the original insertion order — contradicting the register's own TC-067, which assumed filters see the pre-sort order. Checkbox filters and `handlesortbrand()` use `.filter()`, which never mutates, so TC-066/TC-069 (filter-then-sort, filter-then-brand) are unaffected and match the register's claims exactly.
- **`getItemCount()` is not called by every re-render** — ⚠ new finding this conversion, live-verified: `handlesortprice()`/`handlesortname()` call `appendData()` but never `getItemCount()` (search.js:61-92), unlike the checkbox filters and `handlesortbrand()`, which call both. A sort immediately following a filter leaves `#item-count` stale at the filter's count while the tiles re-render to the full, unsorted-filter-discarding list — contradicting the register's own Finding 11/TC-076, which called the filter→sort→brand sequence "compliant."
- **Discount checkboxes are cumulative-threshold** (Finding 5): `(discount*100)/strikedoffprice >= Number(value)`.
- **Brand "All Brands" / zero-match collision** (Finding 6): `handlesortbrand()` falls back to the full unfiltered `searchArr` whenever the filtered result is empty — true both for the blank placeholder and for a real brand with zero matches in the current set.
- **Guest console error** (Finding 7, `search.js:3-7,164-171`): `cartItems()` runs unconditionally on `window` `load` and after every `addToCart()`, targeting `#cart-items` via `document.getElementById("cart-items").innerText=...` — `navbar.js`'s guest branch never creates that element, so every guest page load and every guest Add-to-Cart throws an uncaught `TypeError: Cannot set properties of null`.
- **Price sort comparator is numeric** (Finding 8, compliant): `a.price-b.price`.
- **Name sort comparator is case-sensitive by UTF-16 code point** (Finding 9): `a.name>b.name`.
- **Breadcrumb** (Finding 10): `<h5>Home / Search Store</h5>` (search.html:49) — one plain text node, no `<a>`, no `onclick`, for either segment.
- **Product tiles** (`appendData()`, search.js:8-38): plain `document.createElement('div')`, no wrapping `<a>`, no `href`. Tile images have no `alt` attribute set anywhere. Every Add to Cart button shares the literal text `"Add to Cart"`.
- **Zero accessibility attributes**: grepped `search.html` for `<label`, `aria-`, `role=` — zero matches for all three. `alt=` appears exactly once, on the Logo.
- **`<title>styleup For Kids</title>`** (search.html:7) — static regardless of search term. No meta description/canonical/robots. A commented-out `<h1>Kids Products</h1>` (search.html:46) confirms one existed and was removed.
- **This page loads `navbar.js`** (search.html:171) — the dynamic, login-gated navbar, unlike Sign In/Sign Up.
- **Zero analytics/tracking/locale/consent code** anywhere (grep-confirmed: `gtag`/`dataLayer`/`analytics`/`fetch(`/`sendBeacon`/`XMLHttpRequest`, `Intl.`/`toLocaleString`/`i18n`/`locale`, `cookie`/`consent` outside `terms-of-use.html`'s own body text).

## Seeded / fixture accounts

None in source. This project's own `test-data/testData.ts` seeds `existingAccount` (backed by `APP_USERNAME`/`APP_PASSWORD` in `.env`) via `utils/storageHelpers.ts`, as a PRECONDITION only, per the protocol's seeding rule.

## Not found (checked, confirmed absent)

- `gtag`, `dataLayer`, `analytics`, `sendBeacon`, `XMLHttpRequest`, `fetch(` — zero matches, every `.js` file.
- `Intl.`, `toLocaleString`, `i18n`, `locale` — zero matches.
- `maxlength` in `search.html` — zero matches (no free-text input on this page other than the shared, non-functional-on-this-page navbar search).
- `<label`, `aria-`, `role=` in `search.html` — zero matches.
- `location.search`, `URLSearchParams` — zero matches anywhere in the codebase.
