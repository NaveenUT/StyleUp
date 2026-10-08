# Verification Mode Register

One row per distinct element, per the Phase 2 protocol's Output Format item 3. Full
[SOURCE VERIFIED]/[DOM VERIFIED] blocks live as comments directly above each locator
getter/method in the relevant Page Object under `pages/` — this table indexes them.
Elements are verified **once** here and reused across every spec file that needs them
(protocol Step S7/D6), via the Page Object Model: a spec file gets a locator through
`homePage.navbar.logo`, `signInPage.emailField`, etc., never by re-deriving a selector.

| Element | Page Object | Mode | Source ref (file:line) | DOM checked? | Accessor |
|---|---|---|---|---|---|
| Logo (dynamic navbar) | `NavbarComponent` | A + B | navbar.js:1-51,88-90 | Yes — index.html, guest+auth branches | `navbar.logo` |
| Category link (MEN/WOMEN/KIDS/HOME & LIVING) | `NavbarComponent` | A | index.html:18-23 | No (static markup) | `navbar.categoryLink(name)` |
| Search bar | `NavbarComponent` | A | index.html:25 | No (static attribute) | `navbar.searchBar` |
| Guest "Sign In" / "Sign Up" | `NavbarComponent` | A + B | navbar.js:38-49 | Yes — index.html, loginStatus=false | `navbar.guestSignInButton` / `navbar.guestSignUpButton` |
| "Log Out" | `NavbarComponent` | A + B | navbar.js:16-18 | Yes — index.html, loginStatus=true | `navbar.logOutButton` |
| Cart badge / icon | `NavbarComponent` | A + B | navbar.js:20-34 | Yes — index.html, loginStatus=true | `navbar.cartBadge` / `navbar.cartIcon` |
| Footer "Men" cell (onclick) | `HomePage` | A | index.html:71 | No | `homePage.footerMenCell` |
| Footer Contact Us/Blog/About Us/Terms of use links | `HomePage` | A | index.html:71-74 | No | `homePage.footerContactUsLink` etc. |
| Footer static cell (Women/Kids/.../Privacy Policy) | `HomePage` | A | index.html:72-80 | No | `homePage.footerStaticCell(text)` |
| Promotional `<h4>` headings | `HomePage` | A | index.html:86,88,98 | No | `homePage.promotionalHeading(text)` |
| Sign In Logo link | `SignInPage` | A | signin.html:17-19 | No | `signInPage.logoLink` |
| Sign In Email/Password fields | `SignInPage` | A | signin.html:42,44 | No | `signInPage.emailField` / `signInPage.passwordField` |
| Sign In submit button | `SignInPage` | A | signin.html:48 | No | `signInPage.submitButton` |
| Sign In Terms/Sign up links | `SignInPage` | A | signin.html:46,49 | No | `signInPage.termsLink` / `signInPage.signUpLink` |
| Sign In's own category links (MEN/etc.) | `SignInPage` | A | signin.html:22-25 | No | `signInPage.categoryLink(name)` |
| Sign Up Name/Email/Password fields | `SignUpPage` | A | signup.html:40,42,44 | No | `signUpPage.nameField` etc. |
| Sign Up submit button | `SignUpPage` | A | signup.html:48 | No | `signUpPage.submitButton` |
| Sign Up Sign in/Terms links | `SignUpPage` | A | signup.html:46,49 | No | `signUpPage.signInLink` / `signUpPage.termsLink` |
| Sign Up's own category links | `SignUpPage` | A | signup.html:20-23 | No | `signUpPage.categoryLink(name)` |
| mens.html product card / Add to Cart | `MensPage` | A | mens.js:118-165 | No | `mensPage.productCard(i)` / `mensPage.addToCartButton(i)` |
| womens.html product card / Add To Cart | `WomensPage` | A | womens.js:141,150-183 | No | `womensPage.productCard(i)` / `womensPage.addToCartButton(i)` |
| Home&Living.html product card / Add to Cart | `HomeLivingPage` | A | home&living.js:197-228 | No | `homeLivingPage.productCard(i)` / `homeLivingPage.addToCartButton(i)` |
| cart.html line item (+/-/REMOVE) | `CartPage` | A | cart.html:66-116 | No | `cartPage.lineItem(i)`, `decrementButton(i)`, `incrementButton(i)`, `removeButton(i)` |
| cart.html price panel (Noofitems/Finalamount) | `CartPage` | A | cart.html:41,53 | No | `cartPage.noOfItems` / `cartPage.finalAmount` |

## Notes on reuse and scope

- Every locator above is defined exactly once, as a getter/method on its owning Page
  Object (`pages/*.ts`), and imported implicitly by every spec file via the
  `homePage`/`signInPage`/`signUpPage`/`cartPage`/`mensPage`/`womensPage`/
  `homeLivingPage`/`navbar` fixtures in `fixtures/customFixtures.ts` — satisfying the
  "verify once, reuse" rule without duplicating the same `[SOURCE VERIFIED]` block
  across 34 spec files.
- Pages with no dedicated Page Object (about-us.html, contact-us.html, blog.html,
  terms-of-use.html — all four load only the shared dynamic navbar, nothing else under
  test) are reached via the standalone `navbar` fixture (`new NavbarComponent(page)`)
  plus `utils/navigationHelpers.ts`'s `gotoPath()`, rather than a near-empty class.
- Mode B (live DOM) checks were performed in-session via Playwright MCP against the
  running local server (`python -m http.server 5501`) for the JS-injected navbar branch
  specifically — the one element class the Cross-Check Matrix marks as requiring it
  (`navbar.js`'s `innerHTML`/`createElement` output). All other elements are plain,
  static HTML attributes, for which Mode A alone is sufficient per the matrix.
- No locator uses absolute XPath, a generated/build-transformed CSS class, or a bare
  positional selector as its primary strategy. Where multiple identical elements exist
  on one page with no distinguishing attribute (mens.html/womens.html/Home&Living.html
  product cards; cart.html line items — all confirmed via source read to have no
  unique per-item id), addressing by DOM position (`.nth(index)`) is the only viable
  strategy and is documented as such at each accessor's definition.
