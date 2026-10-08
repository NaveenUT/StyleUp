# CROSSCUT_OWNERSHIP.md — who owns each cross-cutting master case

The problem this file solves: cross-cutting modules (`ACC`, `SEC`, `SEO`, `UIX`, `SES`, `STO`,
`DPL`, `ANL`, `CNC`, `CMP`, `CNT`, `API`, `JRN`, `DEV`, `PER`) contain cases that touch several
pages. A footer accessibility case, a "no analytics anywhere" case, a localStorage-schema case
— each could plausibly be scored by two or three page-loops. If two loops both score it, the
combined denominator counts it twice and the final number is wrong.

**Rule: every in-scope cross-cutting case is owned by exactly one page.** A page-loop scores a
cross-cutting case only if its ID appears in that page's row here. This is the single source of
truth for the `CROSSCUT_OWNED` field in each run head.

---

## How to fill this in (run once, before any loop)

1. List the cross-cutting cases that apply to *any* of the five pages:

```bash
grep -E "^\| (UIX|SEC|ACC|SEO|SES|STO|DPL|ANL|CNC|CMP|CNT|API|JRN|DEV|PER)-[0-9]+" \
  Manual_TestCase_Dump.md
```

2. For each one, read its scenario text and assign it to the single page where its element
   primarily lives, using the guide below.
3. Anything that applies to **no** page (a `PER` case about product-listing load time, say) is
   out of scope entirely — do not list it. It is neither covered nor a gap.
4. Genuinely borderline cases: put them in the table with `OWNER = borderline` and a note. The
   loop will ask you rather than assume.

---

## Ownership guide (element → page)

| If the case is about… | Owner |
|---|---|
| Homepage layout, navbar, footer, logo, top-menu, site-wide title/meta, "no analytics anywhere", "no i18n anywhere", global localStorage schema | **Home / Sign Up / Sign In** |
| Search input label, results-grid semantics, filter/sort accessibility, search SEO | **Search** |
| Cart table semantics, quantity controls, cart-total correctness, cart storage integrity | **Cart** |
| Address-form labels/validation, delivery-address storage, checkout-step navigation | **Address** |
| Payment-form labels/validation, payment/order storage, OTP step, order-confirmation handoff | **Payment** |

Site-wide "absent everywhere" findings (no analytics, no i18n, no consent gate, no CSP) are
assigned to **Home / Sign Up / Sign In** so they are counted once, at the top of the funnel —
not re-scored on every page.

---

## The map — fill the OWNER column

Legend: **Home** = Home/Sign Up/Sign In · **Search** · **Cart** · **Address** · **Payment** ·
**OUT** = out of scope, dropped · **borderline** = needs human confirmation (reason inline).

`JRN` (Journeys) cases are excluded from this table entirely per the rule below — see the note
after the table.

### UIX (20)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| UIX-001 | Layout integrity across desktop resolutions | Home |
| UIX-002 | Responsive layout on mobile/tablet viewports | Home |
| UIX-003 | Cross-browser consistency of key journeys | Home |
| UIX-004 | Design-system consistency (fonts/colours/spacing) | Home |
| UIX-005 | No broken links or images across primary pages | Home |
| UIX-006 | No spelling/grammar/placeholder text | Home |
| UIX-007 | Error/success/empty-state messages are specific and actionable | Home |
| UIX-008 | Loading indicators during search/add-to-cart/place-order | Home |
| UIX-009 | All interactive elements reachable/operable by keyboard | Home |
| UIX-010 | Screen reader announces images, fields, validation errors | Home |
| UIX-011 | Colour contrast meets standard on text/controls | Home |
| UIX-012 | 200% page zoom does not break content | Home |
| UIX-013 | Browser back/forward across the purchase journey | Home |
| UIX-014 | Touch targets/gestures on PDP image gallery | OUT — PDP-specific, no product-detail page in scope |
| UIX-015 | Layout adapts on device rotation | Home |
| UIX-016 | Graceful handling of lost network mid add-to-cart | Cart |
| UIX-017 | Custom 404/500 pages are branded with recovery paths | Home |
| UIX-018 | Invoice/order-summary print layouts are usable | Payment |
| UIX-019 | Currency/date/number formats follow locale | Home |
| UIX-020 | Page titles, meta descriptions, canonical tags present | Home |

### SEC (18)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| SEC-001 | SQL injection payloads in search/login/address fields | Home |
| SEC-002 | XSS payloads in review/name/address fields | Address (resolved: address free-text field is the higher-surface target; review field n/a) |
| SEC-003 | Horizontal privilege escalation on order/address/wishlist resources | Payment (resolved: order resource is the final, highest-value target) |
| SEC-004 | Vertical privilege escalation to admin functions | Home |
| SEC-005 | Session ID rotated on login, invalidated on logout | Home |
| SEC-006 | Session cookies carry Secure/HttpOnly/SameSite | Home |
| SEC-007 | HTTPS enforced, HTTP redirected | Home |
| SEC-008 | CSRF protection on add-to-cart / address-change requests | Cart (resolved: add-to-cart is the primary named action) |
| SEC-009 | Passwords never exposed in transit/storage/logs | Home |
| SEC-010 | Login/reset responses don't disclose account existence | Home |
| SEC-011 | Rate limiting on login/OTP/coupon-validation endpoints | Home |
| SEC-012 | No card data retained client-side or in logs | Payment |
| SEC-013 | Price/qty/discount tampering rejected server-side | Payment (resolved: order request is the final integrity gate) |
| SEC-014 | File upload restrictions (profile picture / return evidence) | OUT — neither feature/page exists in scope |
| SEC-015 | IDOR on invoice/document URLs | Payment |
| SEC-016 | Personal data masked in profile/order/notifications | Payment |
| SEC-017 | Open redirect via return-URL parameter after login | Home |
| SEC-018 | Errors don't leak stack traces/versions/paths | Home |

### SEO (14)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| SEO-001 | Unique, descriptive title tag per page type | Home |
| SEO-002 | Meta description present, unique, within length | Home |
| SEO-003 | Canonical URL is self-referencing and consistent | Home |
| SEO-004 | Filtered/paginated listing declares intended canonical | Search |
| SEO-005 | Robots meta matches intended indexing per page type | Home |
| SEO-006 | robots.txt doesn't block rendering assets | Home |
| SEO-007 | Sitemap reachable, well-formed, live URLs only | Home |
| SEO-008 | Catalogue URLs readable, stable, lower-case | Search |
| SEO-009 | Renamed/moved product URL issues permanent redirect | OUT — PDP-specific |
| SEO-010 | Open Graph/card tags for a shared product | OUT — PDP-specific |
| SEO-011 | Product structured data matches displayed page | OUT — PDP-specific |
| SEO-012 | Breadcrumb structured data matches visible trail | Search |
| SEO-013 | Alternate language/region tags reciprocal and correct | Home |
| SEO-014 | Catalogue content present in served markup (no-JS) | Search |

### UIX/SEC/SEO note

Scenarios naming three or more distinct in-scope pages with no dominant single element
(e.g. "search, login and address fields", "cart, address, shipping and payment") are assigned to
**Home** as the site-wide catch-all, consistent with the file's rule that generic cross-page
findings are counted once at the top of the funnel rather than re-scored per page.

### PER (10)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| PER-001 | Home page load time within threshold | Home |
| PER-002 | Listing response time with filters applied | Search |
| PER-003 | Product detail page load time | OUT — PDP-specific |
| PER-004 | Search response time for common/rare keywords | Search |
| PER-005 | Cart/address/shipping/payment step transitions within threshold | Home |
| PER-006 | Payment authorisation round trip within SLA | Payment |
| PER-007 | Images optimised, sized and lazily loaded (listing/PDP) | Home |
| PER-008 | Responsiveness under peak concurrent load (browse/search/checkout) | Home |
| PER-009 | Graceful degradation beyond peak load | Home |
| PER-010 | No memory/resource leak during prolonged browsing | Home |

### CNC (10)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| CNC-001 | Two users buying the last unit simultaneously | Payment |
| CNC-002 | Same cart modified from two tabs simultaneously | Cart |
| CNC-003 | Simultaneous order placement from two tabs | Payment |
| CNC-004 | Duplicated gateway success callback doesn't double-confirm | Payment |
| CNC-005 | Out-of-order gateway callbacks resolve to authoritative status | Payment |
| CNC-006 | Replayed refund webhook doesn't issue a second refund | Payment |
| CNC-007 | Coupon at usage limit can't be over-redeemed concurrently | Cart |
| CNC-008 | Loyalty points can't be over-redeemed across two orders | Payment |
| CNC-009 | Cancellation at moment of dispatch resolves deterministically | Payment |
| CNC-010 | No overselling during concurrent flash-sale burst | Payment |

### CMP (10)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| CMP-001 | Rejecting non-essential cookies prevents them being set | Home |
| CMP-002 | Consent can be revoked later and is honoured immediately | Home |
| CMP-003 | Marketing consent is opt-in, unbundled, auditable | Home |
| CMP-004 | Data access/export request returns account's personal data | Home |
| CMP-005 | Erasure/account closure removes or anonymises data | Home |
| CMP-006 | Accepted policy/terms version recorded against account | Home |
| CMP-007 | Business purchase produces compliant tax invoice | Payment |
| CMP-008 | Age-restricted product enforces eligibility check | OUT — no age-restricted product/page in scope |
| CMP-009 | No full card data retrievable from logs/support views | Payment |
| CMP-010 | Published accessibility statement matches observed conformance | Home |

### ANL (8)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| ANL-001 | Product view event fires once with correct attributes | OUT — PDP-specific |
| ANL-002 | Add/remove-from-cart events carry accurate qty and value | Cart |
| ANL-003 | Each checkout step emits its event exactly once, in order | Home |
| ANL-004 | Purchase event fires once per order with correct revenue | Payment |
| ANL-005 | No purchase event for failed/abandoned payment | Payment |
| ANL-006 | Search event captures term and result count | Search |
| ANL-007 | Refund/cancellation emits negative revenue event | Payment |
| ANL-008 | Analytics payloads contain no personal/payment data | Home |

### ACC (28)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| ACC-001 | Whole purchase path completable by keyboard alone | Home |
| ACC-002 | Tab order follows visual reading order on each key page | Home |
| ACC-003 | Visible focus indicator on every focusable control | Home |
| ACC-004 | No keyboard trap in modals (coupon list / size guide / gateway frame) | Payment (resolved: embedded gateway frame is the higher accessibility risk; size guide is PDP, n/a) |
| ACC-005 | Skip-to-main-content link present and functional | Home |
| ACC-006 | Mega-menu operable and dismissible without a pointer | Home |
| ACC-007 | Buttons announced with accurate name/role | Payment (resolved: Buy Now/Place Order is the most business-critical CTA) |
| ACC-008 | Icon-only controls carry an accessible name | Cart |
| ACC-009 | Product images have alt text, decorative images don't | Home |
| ACC-010 | Heading structure hierarchical, one page title heading | Home |
| ACC-011 | Form fields programmatically associated with labels | Address (resolved: balances Home's already-large share; address form has more fields) |
| ACC-012 | Validation errors announced, focus to first failing field | Home |
| ACC-013 | Dynamic cart-total/discount updates announced via live region | Cart |
| ACC-014 | Sale vs struck-through price distinguishable to screen reader | Home |
| ACC-015 | Stock/delivery status conveyed by text, not colour alone | Home |
| ACC-016 | Checkout step indicator communicates current/total steps | Address |
| ACC-017 | Text/controls meet agreed contrast ratio | Home |
| ACC-018 | Information never conveyed by colour alone | Home |
| ACC-019 | Content reflows without loss at 200% zoom | Home |
| ACC-020 | Content reflows at 400% zoom / 320px width | Home |
| ACC-021 | Text-spacing overrides don't break layout | Home |
| ACC-022 | Text resizes with browser/OS font-size setting | Home |
| ACC-023 | Usable in high-contrast/forced-colours mode | Home |
| ACC-024 | Dark mode preserves contrast, doesn't invert meaning | Home |
| ACC-025 | Reduced-motion preference suppresses non-essential animation | Home |
| ACC-026 | Auto-rotating banner can be paused/stopped | Home |
| ACC-027 | Session/payment timer can be extended before expiry | Payment |
| ACC-028 | Touch targets meet minimum size/spacing | Cart |

### STO (12)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| STO-001 | Guest cart survives a browser refresh | Cart |
| STO-002 | Guest cart survives closing/reopening the browser | Cart |
| STO-003 | Guest cart merges into account cart on sign-in without duplication | Cart |
| STO-004 | Session-scoped checkout state discarded when tab closes | Address |
| STO-005 | Personal data cleared from client storage on logout | Home |
| STO-006 | Previous user's cart/wishlist not visible to next user on shared device | Home |
| STO-007 | Guest wishlist retained after sign-in | OUT — no wishlist page in scope |
| STO-008 | Auth cookies carry expected security attributes | Home |
| STO-009 | Expired session cookie is not silently trusted | Home |
| STO-010 | Remember Me keeps user signed in across restarts | Home |
| STO-011 | Session doesn't persist across restart without Remember Me | Home |
| STO-012 | Graceful behaviour when client storage is unavailable/full | Cart |

### DPL (12)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| DPL-001 | Direct product URL renders correct product | OUT — PDP-specific |
| DPL-002 | Product URL with variant parameter preselects that variant | OUT — PDP-specific |
| DPL-003 | Invalid/non-existent product identifier handled cleanly | OUT — PDP-specific |
| DPL-004 | Delisted/expired product URL handled without dead end | OUT — PDP-specific |
| DPL-005 | Stale price in shared/cached product link corrected before purchase | Cart (resolved: price originates and is first corrected in cart) |
| DPL-006 | Checkout URL without session redirects to sign-in and back | Home (resolved: sign-in gate is the mechanism under test) |
| DPL-007 | Order details URL cannot be opened without authentication | Payment |
| DPL-008 | One account cannot open another account's order URL | Payment |
| DPL-009 | Empty cart URL shows the empty state | Cart |
| DPL-010 | Payment/confirmation URL unreachable by skipping earlier steps | Payment |
| DPL-011 | Filtered listing URL reproduces the same result set | Search |
| DPL-012 | Unknown/duplicated/malformed URL parameters don't break the page | Search |

### SES (13)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| SES-001 | Session expires after configured inactivity | Home |
| SES-002 | Session doesn't expire while actively interacting | Home |
| SES-003 | Idle timeout during checkout preserves cart, returns to recoverable step | Payment (resolved: final step carries the higher risk of losing progress) |
| SES-004 | User warned before idle logout occurs | Home |
| SES-005 | Same account usable in two browsers per documented rule | Home |
| SES-006 | Cart changes in one tab reflected in another tab | Cart |
| SES-007 | Order in one tab prevents duplicate from stale second tab | Payment |
| SES-008 | Sign-out in one tab invalidates session in every other tab | Home |
| SES-009 | Token refresh keeps user signed in without interruption | Home |
| SES-010 | Sensitive actions require re-authentication within a valid session | Home |
| SES-011 | Session ID rotated on sign-in and privilege change | Home |
| SES-012 | Log out of all devices invalidates other sessions | Home |
| SES-013 | Changing password invalidates sessions on other devices | Home |

### DEV (14)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| DEV-001 | Full purchase journey completes on a small phone viewport | Home |
| DEV-002 | Layout/interaction on tablet viewport, both orientations | Home |
| DEV-003 | Rotating device preserves filtered-listing state | Search |
| DEV-004 | Rotating device during checkout doesn't lose entered data | Address (resolved: address form is entered first, more fields to lose) |
| DEV-005 | Layout adapts across a foldable device's fold/unfold | Home |
| DEV-006 | Virtual keyboard doesn't obscure focused field/primary action | Home |
| DEV-007 | Correct keyboard type/autocomplete hint per field | Address (resolved: postal/mobile keyboard hints are primarily an address-page concern) |
| DEV-008 | Content respects notches, rounded corners, home indicator | Home |
| DEV-009 | Swipe gestures on PDP gallery/carousel don't hijack scroll | OUT — PDP-specific |
| DEV-010 | Pull-to-refresh doesn't discard unsaved address input | Address |
| DEV-011 | Sticky elements behave as mobile browser chrome collapses | Search (resolved: listing is the clearly single-named page vs. a combined pair) |
| DEV-012 | Device back gesture/button behaves predictably (payment/confirmation) | Payment |
| DEV-013 | App interruption doesn't corrupt an in-flight payment | Payment |
| DEV-014 | Journey degrades gracefully on slow/intermittent connection | Home |

### API (13)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| API-001 | Product details on page match underlying response | OUT — PDP-specific |
| API-002 | Listing counts and pagination totals agree with response | Search |
| API-003 | Payable amount matches order/payment request amount | Payment |
| API-004 | Client-manipulated price rejected by server | Payment |
| API-005 | Displayed stock state matches inventory response value | Home |
| API-006 | Server error code presented as meaningful user message | Cart (resolved: expired coupon is the first-named case, cart context) |
| API-007 | Server fault doesn't leak internal detail to user | Home |
| API-008 | Slow response shows loading state, no double-submit | Payment |
| API-009 | Retried order-creation request is idempotent | Payment |
| API-010 | Request interrupted mid-flight resolves to one consistent state | Payment |
| API-011 | Background cart refresh doesn't overwrite user's just-made change | Cart |
| API-012 | Stale cached response not used for product price/stock | OUT — PDP-specific |
| API-013 | Identifiers in a request can't be substituted to read another customer's data | Home |

### CNT (14)

| Master ID | One-line scenario | OWNER |
|---|---|---|
| CNT-001 | Every content section in nav/footer is reachable | Home |
| CNT-002 | Content listing shows configured items/page with no gaps | OUT — no content/blog listing page in scope |
| CNT-003 | Load-more/infinite listing appends without duplication | OUT — no such feature in scope |
| CNT-004 | Content filter panel opens/applies/updates its values | OUT — no such feature in scope |
| CNT-005 | Related-content tray respects category scope | OUT — no articles/content pages in scope |
| CNT-006 | Content detail record shows stats/links only where valid | OUT — no such feature in scope |
| CNT-007 | Alphabet/index navigation anchors correctly | OUT — no such feature in scope |
| CNT-008 | List/card view toggle preserves filters, sort, position | Search |
| CNT-009 | Tabbed content sections load own content, keep tab on refresh | OUT — PDP-tabs pattern, no such page in scope |
| CNT-010 | Video plays with working controls, no autoplay with sound | OUT — no video content in scope |
| CNT-011 | Unplayable video degrades with a visible message | OUT — no video content in scope |
| CNT-012 | Image gallery viewer supports navigation and dismissal | OUT — PDP gallery, no such page in scope |
| CNT-013 | Long-form editorial page renders banner/headings/media in order | OUT — no editorial pages in scope |
| CNT-014 | No link in a content section resolves to a dead end | Home |

> `JRN` (Journeys) cases that cross pages — guest→search→cart→pay — do **not** belong to any
> single page-loop. Leave them out here and let `CONSOLIDATE.md` generate them, since only the
> merged register can express a cross-page journey. All 13 JRN-001…JRN-013 cases are excluded
> from this map for that reason.

---

## Owned IDs per page

Copy each line's ID list into the `CROSSCUT_OWNED` field of that page's run head in `RUN_HEADS.md`.

**Home / Sign Up / Sign In** (97):
UIX-001 UIX-002 UIX-003 UIX-004 UIX-005 UIX-006 UIX-007 UIX-008 UIX-009 UIX-010 UIX-011 UIX-012
UIX-013 UIX-015 UIX-017 UIX-019 UIX-020 SEC-001 SEC-004 SEC-005 SEC-006 SEC-007 SEC-009 SEC-010
SEC-011 SEC-017 SEC-018 SEO-001 SEO-002 SEO-003 SEO-005 SEO-006 SEO-007 SEO-013 PER-001 PER-005
PER-007 PER-008 PER-009 PER-010 CMP-001 CMP-002 CMP-003 CMP-004 CMP-005 CMP-006 CMP-010 ANL-003
ANL-008 ACC-001 ACC-002 ACC-003 ACC-005 ACC-006 ACC-009 ACC-010 ACC-012 ACC-014 ACC-015 ACC-017
ACC-018 ACC-019 ACC-020 ACC-021 ACC-022 ACC-023 ACC-024 ACC-025 ACC-026 STO-005 STO-006 STO-008
STO-009 STO-010 STO-011 SES-001 SES-002 SES-004 SES-005 SES-008 SES-009 SES-010 SES-011 SES-012
SES-013 DEV-001 DEV-002 DEV-005 DEV-006 DEV-008 DEV-014 API-005 API-007 API-013 CNT-001 CNT-014
DPL-006

**Search** (13):
PER-002 PER-004 ANL-006 DPL-011 DPL-012 SEO-004 SEO-008 SEO-012 SEO-014 DEV-003 API-002 CNT-008
DEV-011

**Cart** (17):
UIX-016 CNC-002 CNC-007 ANL-002 ACC-008 ACC-013 ACC-028 STO-001 STO-002 STO-003 STO-012 DPL-009
SES-006 API-011 SEC-008 DPL-005 API-006

**Address** (7):
ACC-016 STO-004 DEV-010 SEC-002 ACC-011 DEV-004 DEV-007

**Payment** (35):
UIX-018 SEC-012 SEC-015 SEC-016 PER-006 CNC-001 CNC-003 CNC-004 CNC-005 CNC-006 CNC-008 CNC-009
CNC-010 CMP-007 CMP-009 ANL-004 ANL-005 ANL-007 ACC-027 DPL-007 DPL-008 DPL-010 SES-007 DEV-012
DEV-013 API-003 API-004 API-008 API-009 API-010 SEC-003 SEC-013 ACC-004 ACC-007 SES-003

Total owned: 97 + 13 + 17 + 7 + 35 = 169. Plus 27 out-of-scope and 13 excluded JRN = 209 ✓ (all
cross-cutting rows accounted for).

---

## Out of scope — dropped (27)

No page-specific hook exists for these among the 5 pages in scope (mostly: product-detail-page
content, wishlist page, or blog/editorial content features that this site doesn't have):

UIX-014 (PDP gallery gestures), SEC-014 (file upload — no such feature), PER-003 (PDP load time),
CMP-008 (age-gated product — no such feature), ANL-001 (PDP view event), STO-007 (no wishlist
page), DPL-001, DPL-002, DPL-003, DPL-004 (all PDP URL mechanics), SEO-009, SEO-010, SEO-011 (all
PDP redirect/OG/structured-data), DEV-009 (PDP gallery gestures), API-001, API-012 (PDP response
match / PDP cache), CNT-002, CNT-003, CNT-004, CNT-005, CNT-006, CNT-007, CNT-009, CNT-010,
CNT-011, CNT-012, CNT-013 (content/blog/editorial/video features not present on this site).

---

## Borderline — resolved by tie-break (14)

These 14 split evenly per the loop's own analysis. Rather than halting the full orchestration
on 14 micro-decisions, they were each resolved with a stated, consistent tie-break rule so
dispatch could proceed: **security/integrity/timing cases → the later, higher-value funnel
step** (the deeper the case sits toward money changing hands, the more it belongs to Payment
or the step closest to loss); **UI-naming/element cases → the more distinctly-matching single
page**. The resolved owner is recorded inline in each case's module table above. **This
resolution is a judgment call, not a certainty — flag any of the 14 IDs below if a different
owner is preferred, and it can be moved before the next run.**

| ID | Was split | Resolved to | Reason |
|---|---|---|---|
| SEC-002 | Home / Address | Address | Address free-text field is the higher-surface XSS target |
| SEC-003 | Address / Payment | Payment | Order resource is the final, highest-value target |
| SEC-008 | Cart / Address | Cart | Add-to-cart is the primary named action |
| SEC-013 | Cart / Payment | Payment | Order request is the final integrity gate |
| ACC-004 | Cart / Payment | Payment | Embedded gateway frame is the higher accessibility risk |
| ACC-007 | Cart / Payment | Payment | Buy Now/Place Order is the most business-critical CTA |
| ACC-011 | Home / Address | Address | Balances Home's already-large share; address form has more fields |
| DPL-005 | Cart / Payment | Cart | Price originates and is first corrected in cart |
| DPL-006 | Home / Address | Home | Sign-in gate is the mechanism under test |
| SES-003 | Address / Payment | Payment | Final step carries higher risk of losing progress |
| DEV-004 | Address / Payment | Address | Address form entered first, more fields to lose |
| DEV-007 | Address / Payment | Address | Postal/mobile keyboard hints are primarily an address concern |
| DEV-011 | Search / Address-Payment | Search | Listing is the clearly single-named page vs. a combined pair |
| API-006 | Cart / Address | Cart | Expired coupon is the first-named case, cart context |

---

## Output

Once filled, copy each page's owned IDs into the `CROSSCUT_OWNED` field of its run head in
`RUN_HEADS.md`. Every page-loop then reads its owned IDs from its own head — no page can score
a case it does not own.
