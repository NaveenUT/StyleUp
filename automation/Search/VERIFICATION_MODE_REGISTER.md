# Verification Mode Register

One row per distinct element. Every element below is Mode A (source-verified); the JS-injected navbar elements (Cart badge, guest Sign In button) additionally carry a Mode B live cross-check, per the Cross-Check Matrix, performed against the Homepage project earlier this session and reconfirmed against this page's own instance of `navbar.js`. Per-page copies of these blocks (with their own comments) live directly above each locator in `pages/*.ts`; this table is the consolidated index the output format requires.

| Element | Page/Route | Mode | Source ref (file:line) | DOM checked? | Locator |
|---|---|---|---|---|---|
| Email field | `/signin.html` | A | signin.html:42 | No | `#mail` |
| Password field | `/signin.html` | A | signin.html:44 | No | `#pass` |
| Sign In submit button | `/signin.html` | A | signin.html:48 | No | `getByRole('button',{name:'Sign In'})` |
| Logo | `/index.html` | A | index.html:15 | No | `img[alt="logo"]` |
| Search bar | `/index.html` | A | index.html:25 | No | `#search-bar` |
| Footer table | `/index.html` | A | index.html:65-81 | No | `#table` |
| Cart badge (Home) | `/index.html` | A+B | navbar.js:20-34 | Yes (Homepage project, this session) | `#cart-items` |
| Breadcrumb | `/search.html` | A | search.html:49 | No | `h5:has-text("Home / Search Store")` |
| Total items label | `/search.html` | A | search.html:51; search.js:107-109 | No | `#item-count` |
| Product tiles | `/search.html` | A | search.js:8-38 | No | `#item-container > div` |
| Tile name | `/search.html` | A | search.js:10-11 | No | `h4` (scoped to tile) |
| Tile brand | `/search.html` | A | search.js:12-13 | No | `p` (scoped to tile) |
| Tile price | `/search.html` | A | search.js:19-20 | No | `div > span:first-child` (scoped to tile) |
| Tile discount % | `/search.html` | A | search.js:24-27 | No | `span.discount_label` (scoped to tile) |
| Tile image | `/search.html` | A | search.js:13-14 | No | `img` (scoped to tile) |
| Add to Cart button | `/search.html` | A | search.js:30-34 | No | `getByRole('button',{name:'Add to Cart'})` (scoped to tile) |
| GENDER checkbox | `/search.html` | A | search.html:88-96 | No | `#gender input[value="Boys"/"Girls"]` |
| CATEGORIES checkbox | `/search.html` | A | search.html:97-109 | No | `#categories input[value="..."]` |
| Discount checkbox | `/search.html` | A | search.html:110-122 | No | `#discount input[value="10".."50"]` |
| Sort by Price select | `/search.html` | A | search.html:55-59; search.js:61-74 | No | `#sort_price` |
| Sort by Name select | `/search.html` | A | search.html:62-66; search.js:75-92 | No | `#sort_name` |
| Sort by Brand select | `/search.html` | A | search.html:69-81; search.js:93-105 | No | `#sort_brand` |
| Footer table/cells | `/search.html` | A | search.html:130-147 | No | `#table`, `#table td:has-text(...)` |
| Logo | `/search.html` | A+B | search.html:15-20 | Yes (this session) | `img[alt="logo"]` |
| Cart badge/icon | `/search.html` | A+B | navbar.js:20-34 | Yes (this session) | `#cart-items` |
| Guest Sign In button | `/search.html` | A+B | navbar.js:38-49 | Yes (this session) | `#login_Status div:has-text("Sign In")` |
| Cart line item | `/cart.html` | A | cart.html:66-116 | No | `#product > div` (by index) |
| Remove button | `/cart.html` | A | cart.html:105-111 | No | `#dele` (scoped to row) |

Locators marked "No" under DOM checked are plain static attributes in `.html` files or read directly from the `document.createElement`/template-literal source (search.js), per Cross-Check Matrix row 1/3 — Mode A alone is sufficient and no cross-check is mandated. The three rows marked "Yes" are the JS-injected, conditionally-rendered navbar elements the matrix explicitly requires a DOM cross-check for; both were confirmed live in this session (and, for the Cart badge, additionally in the sibling Homepage automation project against the same `navbar.js`).

No locator in this register is `NOT VERIFIED` (Mode C) — source was available for every element in scope, and DOM verification was completed wherever the matrix required it.
