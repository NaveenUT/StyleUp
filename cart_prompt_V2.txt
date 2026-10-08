================================================================================
CART PAGE — FUNCTIONAL TEST CASE GENERATION PROMPT (v2)
================================================================================

WHAT CHANGED FROM THE PREVIOUS CART ROUND (Prompt_cart_page_rewritten.md, Round 3)

The previous cart round generated only Positive and Negative cases. This version brings the
Cart page up to the same standard as payment_prompt_V2 (Payment), prompt_search_v2 (Search
Results) and prompt_1_v5 (Homepage / Sign In / Sign Up): seventeen additional techniques are
now in scope — Equivalence Class, Boundary Value, Decision Table, State Transition, Data
Integrity, End-to-End, Concurrency, Recovery, Security, Compliance, Analytics, Usability,
Compatibility, Localisation, SEO, Interface Contract and Accessibility.

Adding them required six edits, not just an addition:

  1. The "Scenario type" column now holds a technique from a defined list (Section 6) rather
     than "positive or negative".
  2. The previous round's Rule 11 ban on security and accessibility testing is partially
     lifted: CLIENT-SIDE security and accessibility are now IN scope; performance, API,
     database, and all server-side security stay out. On the Cart page this distinction is
     load-bearing, because the cart total is computed entirely from a client-side storage
     value the user can edit — see Section 6 technique 11.
  3. The previous round's "Don't create — Boundary scenarios" exclusion is lifted, but ONLY
     for limits that are explicitly stated or source-verifiable. The specific prohibitions in
     the old Constraint 2 and the old "Don't create" list — no invented maximum-quantity cap,
     no invented coupon-field character-count rule — REMAIN IN FORCE and are restated in
     technique 4. Expanding the technique list is not licence to invent the limits this
     application does not implement.
  4. Rule 12's "functional UI test cases only" is widened to admit client-side security,
     storage-contract and accessibility checks.
  5. BR10-BR17 are added, because eight of the new techniques had no Business Rule to map to.
     NOTE THE NUMBERING: this page's register already uses BR1-BR9, so the new rules start at
     BR10. That happens to MATCH payment_prompt_V2's BR10-BR17 exactly, because the Payment
     round also used BR1-BR9 — the two registers are directly cross-referenceable by rule
     number. It does NOT match prompt_search_v2's BR9-BR16 or prompt_1_v5's BR8-BR15. When
     cross-referencing all four registers, map by rule TEXT, not by rule number.
  6. CONSEQUENT RENUMBERING OF THE CART-ICON COUNT RULE. Section 5 states an authenticated
     user "sees the cart icon reflecting item count", but no Business Rule governs that count
     — BR7 governs only the icon's persistence, not its value. The cart-icon count therefore
     stays "Unmapped (see note)" in this round, with a recommended future BR18. Do not map any
     cart-icon-count case to BR10, which is now DATA INTEGRITY.

Because Accessibility and Boundary are now in scope here, this prompt supersedes any separate
boundary or accessibility round for the Cart page. Run one or the other, not both, or the two
registers will duplicate each other. See Rule 24 before discarding the Round 3 register, and
Rule 25 before writing any Expected Result.

--------------------------------------------------------------------------------

Role: Act as a QA Test Architect in functional test design for healthcare, medical, and
e-commerce websites. Analyse the source code and localhost website from a QA perspective and
generate comprehensive, high-quality test cases based only on the provided context.

Task: Analyse the source code and the locally accessible Cart page (reached at
`http://localhost:5501/cart.html` — adjust the actual URL to match the real app) and generate
test cases for that page only, across ALL NINETEEN TECHNIQUES NAMED IN SECTION 6 — the
original Positive and Negative paths plus the seventeen added types.

The Cart page can be reached in four ways: (a) as an authenticated user, add one or more
products from any category (Men, Women, etc.) on a listing page and click the cart icon to
reach the Cart page WITH products; (b) click the cart icon without adding any product to reach
the Cart page in its EMPTY state; (c) click the BAG link from the Address or Payment page; or
(d) enter the URL directly. All four routes are in scope and are distinguished in Section 6
technique 5(c). Note that route (d) is not stated in the Round 3 brief — establish from the
source whether the Cart page carries any login gate of its own before writing those cases, and
record what you find as a Critical Finding either way.

Website:
http://localhost:5501/cart.html  (Cart page — confirm the exact URL and filename casing from
the running app before execution)

================================================================================
FEATURE CONTEXT
================================================================================

1. PAGE URL & ENVIRONMENT

   URL: http://localhost:5501/cart.html — Cart page
   Environment: local  |  Domain: no domain specific
   Persistence: browser `localStorage` only. Read the actual key names and their exact casing
        from the source before writing any case that depends on them. Prior rounds established
        that a key spelled `cartData` is written and read by this page's own script and is
        cleared one step past the Payment page, in `OTP.js` — re-verify all of that against the
        current source rather than taking it on trust, and establish which pages WRITE the key
        and which only READ it. The Cart page is expected to be the primary WRITER, which makes
        it the origin of every downstream contract in the checkout flow.

2. PAGE SECTIONS VISIBLE ON THE CART PAGE

   Cart page:

     - Three links: BAG, ADDRESS, PAYMENT

     - Price Details section: includes Price, Total MRP, "Enter Coupon code" input field
       (placeholder text exactly: "Enter Coupan code" — note the misspelling of "Coupon",
       which is literal in the source and must be reproduced verbatim in every test case that
       references it), Apply Coupon button, Total Amount, and Place Order button

     - Logo — navigates to the home page

     - Product tile (displayed only if a product has been added to the cart): contains product
       name, price, quantity control with "-" and "+" buttons, and a Remove button

   Also present and in scope only as named in BR7 (persistence): the Cart icon as it appears
   on this page.

3. KEY INTERACTIVE ELEMENTS

   This list is exhaustive for THIS round — do not test any element not named here or in
   Section 2 above. Section 6 names the techniques each must be tested with.

   - Three links: clicking ADDRESS navigates to "http://localhost:5501/Address.html"; clicking
     PAYMENT navigates to "http://localhost:5501/payment.html"; clicking BAG navigates to
     (stays on) "http://localhost:5501/cart.html".
   - Logo: clicking it navigates to the home page.
   - Price Details section: entering a valid coupon code and clicking Apply Coupon reduces the
     Total Amount; clicking the Place Order button navigates to the Address page
     "http://localhost:5501/Address.html".
   - Product tile: when a product is added, its product tile is displayed on the Cart page and
     contains the quantity count with "-" and "+" buttons, and a Remove button that removes the
     product tile from the cart.
   - Cart icon (BR7 persistence only, plus its item count as an Unmapped in-scope behaviour).

   THIS LIST NAMES THE ELEMENTS IN SCOPE. SECTION 6 NAMES THE TECHNIQUES EACH MUST BE TESTED
   WITH.

4. BUSINESS RULES

   BR1 - Only an authenticated user can add a product to the cart and navigate to the Cart page
         by clicking the cart icon.

   BR2 - When a product is added to the cart, the respective product tile must be displayed on
         the Cart page (and after the Remove button is clicked, that tile must no longer be
         displayed).

   BR3 - The Price Details (Price, Total MRP, Total Amount) must be displayed and calculated
         correctly when a product is added to the cart, and must remain correct after the
         quantity is changed via the "+" / "-" controls or a product is removed.

   BR4 - (Carried over from the homepage/search round — governs search-input validation.) Not
         applicable in this round: the Cart page contains no search field or search results. No
         test case in this register maps to BR4.

   BR5 - (Carried over from the homepage round — governs Sign-In field validation.) Not
         applicable in this round: the Cart page contains no Sign In fields or actions. No test
         case in this register maps to BR5.

   BR6 - (Carried over from the homepage round — governs Sign-Up field validation.) Not
         applicable in this round: the Cart page contains no Sign Up fields or actions. No test
         case in this register maps to BR6.

   BR7 - Any element whose Section 2/3 description states it is displayed "on all pages,"
         "after login," "after logout," or otherwise persists across a page or session
         transition must render identically and correctly in every state named. Within THIS
         round this covers only the Logo and the Cart icon as they appear specifically on the
         Cart page — it does NOT extend to re-testing the Top Menu, Sign In/Sign Up buttons,
         Footer, or any other element not named in Section 2/3 of this round. This rule also
         governs cross-browser and incognito consistency for those two elements. BR7 governs
         the icon's PRESENCE and RENDERING only; the correctness of its item COUNT is an
         Unmapped in-scope behaviour — see the note at the end of this section.

   BR8 - All named cross-links on the Cart page (the BAG, ADDRESS, and PAYMENT links, and the
         Logo's home-page navigation) must be present and correctly targeted to the URLs stated
         in Section 3.

   BR9 - A valid coupon code, when applied, must reduce the Total Amount by the coupon's
         discount percentage.

   NEW IN v2 — added because eight of the seventeen new techniques had no rule to map to.
   These continue this page's own numbering from BR9 and align with payment_prompt_V2's
   BR10-BR17 by both number and text.

   BR10 — DATA INTEGRITY. Anything the application persists or derives must be readable back
          unchanged: every stored field exactly as written, no truncation, no type coercion, no
          silent reordering or loss. On this page this is the richest rule in the register,
          because three independent surfaces must agree at all times: the RENDERED DOM (tiles,
          quantity counts, Price, Total MRP, Total Amount), the STORED cart array, and the CART
          ICON'S COUNT. Every case in this area should triangulate at least two of the three
          rather than trusting the rendered text. Specifically this governs: whether a quantity
          change via "+"/"-" is written back to storage and not merely to the DOM; whether
          Remove deletes the entry from storage or only hides the tile; whether Total Amount
          equals Price × quantity summed across tiles to the last decimal; whether Total MRP
          and Price hold their documented relationship; whether a coupon discount is
          arithmetically exact rather than rounded twice; and whether the icon count equals
          both the tile count and the stored array length.

   BR11 — STATE MACHINE AND CONCURRENT ACCESS. The application must move only through valid
          state transitions (cart empty -> one product -> several -> removed -> empty again;
          quantity 1 -> 2 -> 1; coupon not-applied -> applied -> cart-contents-changed;
          guest -> authenticated with items already present), must reach the correct state on
          re-entry, and must behave predictably when two actors — two tabs, two browsers, or
          one rapid double-click on Apply Coupon, Remove or Place Order — act on the same
          stored cart. Returning to the empty state after removing the last product is the
          transition most likely to leave stale state behind, and must be tested as its own
          case rather than assumed symmetrical with the initial empty state.

   BR12 — CLIENT-SIDE SECURITY. On this page the highest-severity risk in the entire checkout
          flow: the payable total is derived from a client-side storage value the user can
          edit. Test whether editing the stored price or quantity in DevTools changes the
          rendered Total Amount, and whether that tampered total then carries forward to the
          Address and Payment steps. Also test whether the valid coupon code (or the list of
          them) is readable in cleartext from client-side JavaScript; whether a discount can be
          applied by invoking the handler directly from the console without entering a code;
          whether a negative or non-numeric quantity injected via storage produces a negative
          total; whether user-supplied coupon text is ever rendered back unescaped; whether any
          failure path leaks a stack trace, path or version; and — EXPLICITLY, because a prior
          round's register omitted it and it was the only outright coverage miss in that
          round's gap analysis — whether the page and its form submissions are served over a
          secure transport, recording the actual scheme rather than assuming it.

   BR13 — RECOVERY AND GRACEFUL DEGRADATION. After a failed action, a blocked resource, a
          storage failure, a refresh, or a browser-back, the application must return to a
          usable, correctly-stated state rather than a broken or misleading one. This includes
          whether an applied coupon survives a refresh; what renders when the stored cart key
          is absent, empty, or malformed; what happens when the stored cart references a
          product that no longer exists or carries a missing price field; what happens on a
          quantity change or Place Order click with client storage disabled or full; and
          whether a browser-back from the Address page returns to a correctly-stated cart.

   BR14 — INTERFACE CONTRACT. Every page that reads a stored key must agree with every page
          that writes it — same key name, same casing, same value shape. This page is the
          primary WRITER for the checkout flow, so its contract is the origin of every
          downstream one: confirm the exact key name and casing, confirm the value shape
          (array of what fields, with what types), confirm which downstream pages read it and
          which clear it, and confirm this page handles the value being absent, empty or
          malformed on its own load. A shape this page writes but no downstream page reads, or
          a field a downstream page expects but this page never writes, is a finding.

   BR15 — COMPLIANCE. Where the application states a policy or presents a policy document,
          observed behaviour must match it; where consent is required before storing data, it
          must be obtained. On this page the observable compliance surface is: whether any
          consent is obtained before cart contents are persisted to the client; whether the
          cart's persistence across sessions is disclosed anywhere; and whether any policy
          document is linked and resolves FROM THIS PAGE. Record what is observably true. Do
          NOT issue a compliance verdict against any standard.

   BR16 — DISCOVERABILITY AND SEO. This page must carry a descriptive, distinct title and the
          metadata needed for it to be indexed as intended. A cart page is a conventional
          candidate for a `noindex` robots directive — test what directive is actually present,
          not what ought to be, and record the absence of one as the finding if that is what
          the source shows.

   BR17 — ACCESSIBILITY (WCAG 2.1 Level AA), scoped to the elements named in Section 2/3:
          (a) KEYBOARD OPERABILITY: the three navigation links, the Logo, the Cart icon, every
              product tile's "-", "+" and Remove buttons, the coupon input, Apply Coupon and
              Place Order must be reachable with Tab in a logical order, show a visible focus
              indicator, and be operable with Enter/Space. A complete add-to-cart-onward
              journey — change quantity, apply a coupon, place the order — must be completable
              with the keyboard alone. FOCUS MANAGEMENT AFTER REMOVE is a specific requirement
              here: when a tile is destroyed, focus must move somewhere sensible and must not
              be lost to the document body, which is what happens by default and is the single
              most likely keyboard defect on this page. (WCAG 2.1.1, 2.4.3, 2.4.7)
          (b) LABELS AND NAMES: the coupon input must have a programmatically associated label.
              A placeholder is NOT a label — Section 2 describes the field only by its
              (misspelled) placeholder, so if the source shows a placeholder-only field with no
              `<label>`, `aria-label` or `aria-labelledby`, that is a defect under WCAG
              1.3.1/3.3.2. Apply Coupon and Place Order must each have an accessible name.
              (WCAG 1.3.1, 3.3.2, 4.1.2)
          (c) NAME, ROLE AND VALUE FOR CONTROLS: the "-", "+" and Remove controls must each
              expose an accessible name that identifies BOTH the action and the product it acts
              on — with several tiles present, three buttons all named "-" are ambiguous to a
              screen-reader user reading out of context. Establish whether each control is a
              real `<button>` or a styled `<div>`/`<span>`, since a non-button carries no role
              and is not keyboard-operable. The quantity value must be exposed as a value, not
              only as visual text. (WCAG 4.1.2, 2.4.6)
          (d) STATUS MESSAGES AND DYNAMIC UPDATES: Total Amount, Price, Total MRP and the
              quantity count all change without a page reload. Each such change must be
              conveyed to assistive technology — a total that updates silently leaves a
              screen-reader user unaware the price changed. Test the coupon-applied outcome,
              the quantity-changed outcome and the product-removed outcome against this
              requirement, and test whether any invalid-coupon feedback (if the source defines
              one) is announced and programmatically associated with the input. (WCAG 4.1.3,
              3.3.1)
          (e) IMAGES: the Logo, the Cart icon and every product image in a tile must have a
              non-empty, meaningful `alt` attribute or equivalent accessible name. (WCAG 1.1.1)
          (f) CONTRAST: visible text of the three navigation links, every Price Details label
              and value (Price, Total MRP, Total Amount), the coupon placeholder text
              specifically, the Apply Coupon and Place Order buttons, the product name and
              price in each tile, the quantity count, and the empty-cart message must meet at
              least 4.5:1 against their background (3:1 for large-scale text). Include the
              placeholder text and any greyed-out or secondary price text specifically — those
              are the most common failures on a page like this. (WCAG 1.4.3)
          (g) PAGE TITLE AND STRUCTURE: the page must have a descriptive, distinct `<title>`
              and a usable heading hierarchy including an `<h1>`. Establish whether the Price
              Details block is marked up with a programmatic relationship between each label
              and its value, or is only visually aligned. (WCAG 2.4.2, 1.3.1)

   Note on the cart-icon item count: Section 5 states an authenticated user "sees the cart icon
   reflecting item count". That count MUST be tested (per Rule 17), but no Business Rule above
   governs it — BR7 covers only the icon's presence and rendering. Map those cases as "Unmapped
   (see note)", list them in the "Unmapped but in-scope behaviors" note, and recommend a future
   BR18 — NOT BR10, which is now DATA INTEGRITY. Data Integrity cases that reconcile the count
   against the tile count and the stored array DO map to BR10; only the count's own correctness
   as a stated behaviour is unmapped.

   Usability, Analytics and Localisation cases have NO STATING BUSINESS RULE and must be
   flagged in the same note per Rule 8, not force-mapped.

5. USER TYPES

   - Guest user (not logged in) — can browse products but, per BR1, cannot add a product to the
     cart, does not see the cart icon, and therefore cannot reach the Cart page through the
     cart icon. Whether a guest can reach `cart.html` by DIRECT URL is not stated in the brief
     and must be established from the source — record the answer as a Critical Finding.
   - Authenticated user (logged in) — can add products to the cart, sees the cart icon
     reflecting item count, can navigate to the Cart page, and can proceed toward checkout via
     Place Order.
   - A SECOND, SEPARATE ACCOUNT is required for the BR11 shared-browser cases.
   - Account type: not specific.
   - Browsers: Chrome, Edge, Firefox, Safari, and one private/incognito window.
   - Tooling: DevTools Application > Local Storage for BR10/BR11/BR12/BR14 cases; DevTools
     Network for blocked-resource and Analytics cases; DevTools Console for leakage,
     handler-invocation and storage-tampering cases; DevTools Elements for SEO,
     label-association and Accessibility cases; a screen reader (NVDA or VoiceOver) for the
     BR17(b)/(c)/(d) cases; a contrast checker for BR17(f); two tabs and two browsers for
     concurrency cases.

6. TEST CASE TECHNIQUES — ALL NINETEEN ARE IN SCOPE

   Every element in Section 2/3 must be tested with every technique below that applies to it.
   Where a technique does not apply to an element, or the application does not implement the
   thing the technique probes, RECORD A ZERO-CASE PER RULE 20 — do not invent filler to
   populate a section.

   READ THIS BEFORE GENERATING. On an application of this size several of these techniques will
   legitimately produce very few cases, or none. Analytics is the likely zero section, because
   a local client-only demo has no tracking layer — though note the Cart page is, after the
   Payment page, the most conventional place in an e-commerce site for `view_cart`,
   `add_to_cart`, `remove_from_cart` and `begin_checkout` events, so its absence is worth
   recording specifically rather than generically. Localisation, by contrast, is expected to be
   PRODUCTIVE on this page and not a zero section, because THIS PAGE RENDERS MONEY — Price,
   Total MRP and Total Amount — and currency symbol, decimal separator, thousands separator and
   symbol placement are all locale-dependent presentation questions with observable answers.
   Data Integrity and Client-Side Security are expected to be the two largest sections in the
   register, because the total shown to the customer is computed from an editable client value.
   A zero grounded in a named grep is a correct and valuable result. A fabricated case to fill a
   section is not.

   (1) POSITIVE — the element performing its stated function with valid input in the stated
       state. Per Constraint 5, each of the three navigation links, the Logo, the "+" and "-"
       controls, Remove, the valid-coupon flow, Place Order, the product-tile display, and the
       empty-cart state gets its own positive case.

   (2) NEGATIVE — invalid, missing or malformed input or state. On this page the negative
       surface is: a guest attempting cart access per BR1; the empty-cart state showing no
       product tile; an invalid or empty coupon code (ONLY where the source defines an outcome
       — see Constraint 4); Place Order clicked with an empty cart; a decrement attempted at
       the lowest quantity; and the page loaded with the stored cart key absent or malformed.
       One case per distinct invalid class, even where two classes produce the same rendered
       result.

   (3) EQUIVALENCE CLASS — partition each input's value space into classes the code treats
       identically, then test one representative per class and state the partitions explicitly.
       Derive the classes from the source's ACTUAL branching, not from intuition. The
       partitionable value spaces on this page are:
         - Coupon code: valid code | unknown/invalid code | empty | whitespace-only | correct
           code in the wrong case (e.g. lowercase where the source compares uppercase) | a
           valid code applied a second time. Establish from the source whether the comparison
           is case-sensitive and whether re-application is guarded before enumerating.
         - Quantity: 1 | greater than 1 | the value reached by decrementing at the floor | any
           value injected via storage that the UI cannot produce.
         - Cart contents: empty | exactly one product | several distinct products | THE SAME
           product added twice. That last class is the one most likely to be untested and most
           likely to be wrong — establish whether a repeat add merges into one tile with
           quantity 2 or creates a second tile, and test the class that actually occurs.
         - Entry route: cart icon with products | cart icon with an empty cart | BAG link from
           Address or Payment | direct URL.
         - User type: guest | authenticated.
       Enumerate every valid class as well as every invalid one — a partition with no
       representative is an untested class.

   (4) BOUNDARY VALUE — apply boundary-value analysis ONLY where a limit is explicitly stated
       in Section 2/4 or is verifiable in the source (an attribute on an input, a numeric
       comparison in the JS, a comparator, a guard).

       DO NOT INVENT LIMITS. THIS PROHIBITION IS UNCHANGED FROM ROUND 3. Specifically, DO NOT
       generate cases for a maximum-quantity cap or a coupon-field character-count limit UNLESS
       the source code defines that rule. If the source defines neither, say so in the Rule 20
       zero-case statements, naming the attributes and comparisons grepped for.

       The source-verifiable boundaries on this page are expected to be:
         - THE QUANTITY DECREMENT FLOOR. This is the single most important boundary on the
           page. With the quantity at 1, click "-" and record exactly what happens: does it
           hold at 1, fall to 0 with the tile still shown, fall to 0 and remove the tile, or go
           negative? Then, from whatever state that produces, click "-" again. State which
           behaviour the source actually implements and whether the resulting Total Amount
           stays arithmetically consistent — a quantity of 0 or below with a tile still
           displayed is a defect regardless of which of those four the code does.
         - the quantity increment ceiling, IF the source defines one — grep for a cap or a
           comparison; where absent, that absence is itself the boundary finding, since an
           uncapped increment lets a customer build an order no stock could satisfy.
         - the coupon input's `maxlength` and `pattern` attributes IF PRESENT — grep for them;
           where absent, record the absence.
         - the coupon comparison the source actually implements — whatever condition BR9's
           valid/invalid split rests on, test it exactly at the boundary, one character inside
           and one outside. If the comparison is against a hardcoded literal, quote it.
         - TOTAL AMOUNT AT ITS EDGES: the total with exactly one item at quantity 1; the total
           after removing the last item (does it read 0, blank, or stale?); and the total when
           a coupon's discount is applied to the smallest and largest reachable subtotal, to
           expose double-rounding.
         - Place Order at the empty/non-empty boundary: with zero items, is the button absent,
           disabled, or live and navigating onward with nothing in the cart?
       For each such limit generate cases at the limit, one step below, and one step above,
       where each side is meaningful. Where an element has no source-verifiable limit, generate
       zero boundary cases for it and say so per Rule 20.

   (5) DECISION TABLE — where two or more conditions combine to determine which outcome fires.
       Build the truth table from the source's ACTUAL EVALUATION ORDER, then generate one case
       per reachable combination and mark the unreachable ones. The decision points on this
       page are:
         (a) COUPON x CART STATE — coupon code (valid | invalid | empty) x cart (empty | has
             products) -> is a discount applied, what is the resulting Total Amount, and what
             message if any is shown? The valid-coupon-on-empty-cart row is the one most likely
             to produce a nonsensical total.
         (b) QUANTITY CONTROL x CURRENT QUANTITY — button ("+" | "-") x current quantity (1 |
             greater than 1 | 0 if reachable) -> resulting quantity, resulting Total Amount,
             and whether the tile survives.
         (c) ENTRY ROUTE x USER TYPE x CART CONTENTS — route (cart icon | BAG link | direct
             URL) x user (guest | authenticated) x cart (empty | populated) -> is the page
             reachable, does it render completely, and is anything different? Mark every
             unreachable combination and state why, since BR1 makes several of them unreachable
             by the intended click-path while leaving direct URL open.
         (d) COUPON APPLIED x SUBSEQUENT CART CHANGE — this is the highest-value table on the
             page and the direct analogue of the sequencing defects found on the Search Results
             page. Apply a valid coupon, THEN change the quantity or remove a product, and
             record whether the discount persists, silently recomputes against the new
             subtotal, is dropped, or is left stale so the displayed total no longer equals
             any correct arithmetic. Then run the opposite order — change the cart first, then
             apply the coupon — and compare. State the source's evaluation order as the basis
             for the table, and if the two orders produce different totals, that difference is
             the finding.
         (e) REMOVE x COUPON APPLIED — remove the last remaining product while a coupon is
             applied -> what does Total Amount read? A negative, stale or NaN total here is a
             defect and this row must be tested explicitly rather than inferred from (d).

   (6) STATE TRANSITION — the application's state machine. Derive the states from the actual
       persisted values and the actual DOM, then test each valid transition, each attempted
       invalid transition, and re-entry into a state already occupied. The machines here are:
       cart empty -> one product -> several -> one removed -> all removed -> empty again (test
       the RETURN to empty as its own case; it is not automatically identical to the initial
       empty state and is where stale totals surface); quantity 1 -> 2 -> 3 -> 2 -> 1 -> "-" at
       1; coupon not-applied -> applied -> cart-contents-changed -> re-applied; guest ->
       authenticated with items already in the cart (does anything merge, and whose cart wins?);
       and Cart page open in one tab while the cart is mutated in another.

   (7) DATA INTEGRITY — whether what was written is what is read back, and whether derived
       values stay consistent. Per BR10, TRIANGULATE: rendered DOM, stored value, and cart-icon
       count. Inspect storage directly, do not trust the rendered text. Test that a "+" or "-"
       click writes the new quantity back to storage rather than only updating the DOM; that
       Remove deletes the entry from storage rather than only hiding the tile (reload the page
       to prove it); that Total Amount equals the sum of Price x quantity across all tiles to
       the last decimal; that Total MRP and Price hold their documented relationship at
       quantity 1 and after a quantity change; that a coupon discount is applied once and
       exactly, not rounded twice; that the cart-icon count equals both the visible tile count
       and the stored array length after every mutation; and that a product's name and price
       render exactly as stored with no truncation or coercion.

   (8) END-TO-END — multi-step journeys chaining more than one Business Rule in a realistic
       flow. At least one journey must terminate in a PERSISTED-STATE ASSERTION — inspect the
       stored cart and confirm its contents — not merely a navigation or a rendered total, so
       the journey proves what did and did not land. The canonical journey is: an authenticated
       user adds a product, opens the Cart page via the cart icon, verifies the tile and Price
       Details, increments the quantity, applies a valid coupon, verifies the reduced Total
       Amount, clicks Place Order, lands on the Address page, and the tester then inspects the
       stored cart to confirm the quantity and any discount actually persisted. Do not create
       more than 5.

   (9) CONCURRENCY — two actors on the same stored cart. There is no server tier, so the
       concurrency surface is client-side: the Cart page open in two tabs with a product removed
       in one and the other not reloaded; a quantity incremented in both tabs; the same account
       in two different browsers; and a rapid double-click on Apply Coupon (does the discount
       compound?), on Remove, and on Place Order. The double-click-Apply-Coupon case is the one
       most likely to expose a real arithmetic defect.

   (10) RECOVERY — returning to a usable state after a failure or an interruption. Test:
        whether an applied coupon survives a page refresh, and whether the total it produced
        survives with it or reverts inconsistently; what renders when the stored cart key is
        absent, empty (`[]`), or malformed (not JSON); what happens when a stored entry is
        missing its price field or references a product that no longer exists; what happens on a
        quantity change or a Place Order click with client storage disabled or full; whether a
        browser-back from the Address page returns a correctly-stated cart; and whether a
        blocked image or script leaves the cart usable or broken.

   (11) SECURITY — CLIENT-SIDE ONLY, per BR12. Expected to be one of the two largest sections.
        Test: whether editing the stored price or quantity in DevTools changes the rendered
        Total Amount, and whether that tampered total then carries into the Address and Payment
        steps — this is the single highest-severity case in the register and must be written
        with an explicit before/after storage diff; whether a negative or non-numeric quantity
        injected via storage produces a negative or NaN total rather than being rejected;
        whether the valid coupon code or the list of codes is readable in cleartext from
        client-side JavaScript, in which case reading it out of the source IS the test; whether
        a discount can be applied by invoking the handler directly from the console with no code
        entered; whether coupon text is ever rendered back into the DOM unescaped; whether any
        failure path leaks a stack trace, path or version; and WHETHER THE PAGE IS SERVED OVER A
        SECURE TRANSPORT — record the actual URL scheme and any security headers rather than
        assuming, because transport was the one outright miss in the Payment round's gap
        analysis and it is cheap to close.

        This technique covers the CLIENT ONLY. Do not test a server-side validation, an API, or
        a database — see DON'T CREATE.

   (12) COMPLIANCE — stated policy versus observed behaviour, per BR15. Test whether any
        consent is obtained before cart contents are persisted to the client; whether the
        cart's persistence across sessions and browser closes is disclosed anywhere on this
        page; and whether any policy document is linked and resolves FROM THIS PAGE. Where no
        consent mechanism and no disclosure exist, that absence is the finding. Record
        observable facts only — do not certify or fail the application against a standard.

   (13) ANALYTICS — whether any event or tracking call fires on the key actions of this page:
        page load, quantity change, Remove, Apply Coupon, and Place Order. Grep the source for
        `gtag`, `dataLayer`, `analytics`, `fetch`, `sendBeacon` and `XMLHttpRequest`. Report the
        grep result explicitly: if no tracking layer exists, record a zero-case naming exactly
        what was searched for, and do not invent events. Note that `view_cart`, `add_to_cart`,
        `remove_from_cart` and `begin_checkout` are the four most conventional e-commerce events
        after `purchase`, and all four would fire from this page, so their absence is worth
        recording specifically.

   (14) USABILITY — friction and clarity, expressed OBJECTIVELY. Each case must have a
        verifiable pass condition, not an opinion. Testable here: THE COUPON PLACEHOLDER IS
        MISSPELLED — "Enter Coupan code" — which is an objectively verifiable text defect and
        must be raised as its own case quoting the literal string; whether an invalid coupon
        produces any feedback at all, or fails silently; whether Remove asks for confirmation
        before destroying a tile, and whether the action is reversible; whether "-" at the
        lowest quantity gives any feedback or appears to do nothing; whether Place Order is
        reachable and live with an empty cart, producing a dead-end; and whether Price, Total
        MRP and Total Amount are distinguishable from one another by label alone.

   (15) COMPATIBILITY — the 4 named browsers plus incognito. This now covers two tiers: the BR7
        persistence elements (Logo and Cart icon) as in the previous round, AND — new in v2 —
        the cart interaction paths in each browser, plus the browser-dependent behaviour this
        page relies on: `localStorage` availability in a private window (where the cart is
        expected not to persist at all, which must be verified rather than assumed), and the
        rendering of currency and decimal values. Establish from the source how the quantity
        control is implemented before writing these cases — a native input, a pair of buttons,
        or styled divs behave differently across browsers and drive the Accessibility cases too.

   (16) LOCALISATION — locale-dependent presentation. Grep for `Intl`, `toLocaleString`,
        `lang=`, and any locale or i18n module. THIS PAGE IS PRODUCTIVE FOR THIS TECHNIQUE
        because it renders money: test the currency symbol on Price, Total MRP and Total Amount,
        its placement relative to the number, the decimal separator, the thousands separator on
        a total large enough to need one, and whether the same value renders identically in a
        browser configured to a different locale. Also test whether the `<html lang=>` attribute
        is present and correct, text direction, and whether user-visible strings — including the
        misspelled placeholder and any coupon message — are hardcoded to one language. Where no
        locale layer exists, record a zero-case for the i18n module but report the
        hardcoded-currency and hardcoded-string findings as the substance of the section.

   (17) SEO — per BR16. Test this page's `<title>` for presence, descriptiveness and
        distinctness from every other page; the presence of a meta description, canonical and
        robots directive, and what the robots directive actually says for a cart URL — a cart
        page is a conventional `noindex` candidate, so an absent directive is a finding; and the
        heading hierarchy including whether an `<h1>` exists.

   (18) INTERFACE CONTRACT — the contract between components. There is no server API, so the
        contract here is the client storage schema, and THIS PAGE IS THE WRITER. Confirm the
        exact key name and casing this page writes; confirm the value shape, field by field,
        with types; confirm which downstream pages read it and which clear it; and confirm this
        page handles the value being absent, empty or malformed on its own load. Two specific
        findings to look for: a field this page writes that no downstream page ever reads, and a
        field a downstream page expects that this page never writes. Verify the downstream side
        against the actual source of those pages rather than assuming, but do not generate test
        cases for the downstream pages themselves — Constraint 1 still applies.

   (19) ACCESSIBILITY — WCAG 2.1 Level AA, per BR17. Each clause is tested per element group
        where it applies, and the label, name/role/value and status-message clauses are tested
        per named control. This page has more dynamic, unlabelled, icon-only controls than any
        other page in the flow, which makes it the richest accessibility surface: where the
        source shows an icon-only "-"/"+"/Remove control with no accessible name, a
        placeholder-only coupon field, a Total Amount that updates with no live region, a
        destroyed tile that drops focus to the body, or a missing `alt`, the Expected Result is
        the BR17 requirement and the current state is recorded as a defect — not the pass
        condition.

================================================================================
CONSTRAINTS
================================================================================

1. Analyse the source code and the locally accessible Cart page only. Do not re-generate test
   cases for the homepage, Search Results page, Sign In page, Sign Up page, Address page, or
   Payment page — those were covered in other rounds. A listing page's add-to-cart action and
   the Address page may appear only as the entry step or the destination of a Cart page journey,
   not as re-tested elements in their own right. Every case must be grounded in what the code
   actually does.

2. SECTION 2 AND SECTION 3 SCOPE THE ELEMENTS; SECTION 6 SCOPES THE TECHNIQUES. Do not test
   elements outside Section 2/3. Within those elements, apply every applicable technique in
   Section 6. A description that names only a happy path does not put the other techniques out
   of scope for that element. In particular, the previous round's instruction not to test
   "interaction states, transitions, or UI behaviors not explicitly described" still bars new
   ELEMENTS and invented behaviours (hover states, close-on-outside-click), and still bars the
   invented LIMITS named in technique 4 — but it no longer bars applying a Section 6 technique
   to a named element.

3. Do not assume hidden functionality or behaviours that cannot be verified from the Cart page
   or its source code.

4. If functionality cannot be verified from the provided context, do not invent scenarios.
   Record a zero-case per Rule 20 instead. In particular:
   (a) BR9 defines the outcome only for a VALID coupon. Do not invent an outcome for an invalid
       or empty coupon code unless the source code explicitly defines one; if it does, that
       negative case may be included and must be flagged in the "Unmapped but in-scope
       behaviors" note (BR9 governs valid coupons only). The same applies to a valid code
       applied twice and to a code entered in the wrong case.
   (b) The coupon field's placeholder is stated as the misspelled "Enter Coupan code" — verify
       the literal string from the source and reproduce it exactly, including the misspelling,
       rather than silently correcting it.
   (c) Do not invent a maximum-quantity cap or a coupon character limit. Establish what the
       source does at the quantity floor rather than assuming it holds at 1.
   (d) Establish how the quantity control and the "-"/"+"/Remove controls are implemented
       (native input, `<button>`, or styled `<div>`) before writing any Equivalence Class,
       Boundary, Compatibility or Accessibility case, since all four partition differently
       depending on the answer.
   (e) Whether a guest can reach `cart.html` by direct URL is not stated in the brief.
       Establish it from the source and record it as a Critical Finding before writing the
       Decision Table 5(c) rows that depend on it.

5. EVERY ENUMERATION IN THIS PROMPT IS A FLOOR, NOT A CEILING. Where an element has more
   distinct cases than a technique's wording names, generate them all.

6. Test each explicitly named element, control, variant, decision-table row, state transition,
   equivalence class, boundary edge and technique as its own test case — do not consolidate,
   even where two cases hit the same underlying code path or produce a similarly-shaped result.
   This applies specifically to:
     (a) each of the three navigation links (BAG, ADDRESS, PAYMENT) — one click-and-verify test
         case per link;
     (b) the "+" quantity increment and the "-" quantity decrement as two separate test cases;
     (c) the Remove button as its own test case, distinct from the quantity cases;
     (d) the Place Order button navigation as its own test case, distinct from the ADDRESS link
         case (same target URL, different element);
     (e) the valid-coupon Apply Coupon flow (BR9) as its own test case;
     (f) the empty-cart state and the cart-with-product state (BR2) as two separate test cases;
     (g) the guest-user cart-access attempt and the authenticated-user cart-access flow as two
         separate test cases (per BR1's differing cart-icon-visibility outcome);
     (h) each named Price Details item — Price, Total MRP, Total Amount — verified individually,
         not collapsed into one "price details are correct" case;
     (i) each reachable row of each decision table in technique 5, with Table 5(d)'s two
         orderings as separate cases;
     (j) each equivalence class in technique 3 and each boundary edge in technique 4;
     (k) each clause of BR17 (a) through (g), per element group where it applies, with the
         "-"/"+"/Remove controls covered individually under BR17(c).
   The only consolidation permitted is where two inputs are genuinely identical in kind and
   value space with no distinguishing characteristic named in Section 2/3. Where the SOURCE
   collapses a decision table's rows into one outcome, state the collapse and generate one case
   per distinct outcome rather than one per row — that is a source-grounded consolidation, not a
   shortcut.

7. WHERE THE APPLICATION DOES NOT IMPLEMENT SOMETHING A TECHNIQUE PROBES, THAT ABSENCE IS THE
   FINDING. Generate the case that proves it and state in the Expected Result both what correct
   behaviour would be and what the source actually does, instructing the tester to log the
   actual behaviour as a defect. Never describe missing behaviour as though it worked. This
   applies with particular force on this page to: an absent quantity floor, an absent accessible
   name on an icon-only control, an absent live region on Total Amount, an absent `noindex`
   directive, an absent consent mechanism, and a total that changes when stored data is edited.

================================================================================
INCLUDE, BUT ONLY WHERE THE ABOVE CONSTRAINTS PERMIT
================================================================================

- All nineteen techniques in Section 6, applied per element
- Guest user and authenticated user scenarios
- All four entry routes named in technique 3
- Cross-browser, incognito and cache-clear scenarios per BR7 and technique 15
- Session-timeout and cache-clearing scenarios for the BR7 persistence elements
- State-transition scenarios per technique 6, including the return-to-empty transition
- Multi-step end-to-end journeys per technique 8, at least one terminating in a persisted-state
  assertion
- Up to 2 KEYBOARD-ONLY end-to-end journeys of the form "complete a full named journey using the
  keyboard alone" (e.g. change quantity, apply a coupon, and place the order with no pointer),
  since those chain BR17(a) with a functional path

================================================================================
DON'T CREATE THIS FOR NOW
================================================================================

- SERVER-SIDE security, API and database cases — this application has no server tier, so keep
  techniques 11, 13 and 18 client-side
- Real order placement, payment processing, or gateway behaviour — Place Order is tested only as
  far as the navigation and the state it leaves behind
- A compliance VERDICT against any standard. Technique 12 records observable facts.
- INVENTED LIMITS — no maximum-quantity cap or coupon character-count cases unless the source
  code defines the rule. See technique 4.
- Performance and load-timing scenarios (still excluded, unchanged from the previous round)
- Viewport, responsive-layout and touch-target scenarios
- Filter, sort, search, pagination, infinite scroll, or "load more" scenarios (not present on
  this page)
- Returning user scenarios (Recently Viewed)
- Re-testing of Sign In / Sign Up field validation (BR5/BR6 — out of scope this round)
- Re-testing of the Top Menu, Sign In/Sign Up buttons, Footer, or homepage / search-page /
  Address-page / Payment-page elements not named in Section 2/3 of this round
- Content testing of destination pages — verify only that navigation lands on the stated URL
- Any case for an element not named in Section 2/3

Prioritise business-critical user journeys. Within that, prioritise techniques 7 (Data
Integrity), 11 (Security), 5 (Decision Table) and 19 (Accessibility) — on a cart page the first
two carry the highest severity anywhere in the flow because the payable total is derived from an
editable client value, the third systematically finds the coupon-and-quantity sequencing gaps
that single-condition cases miss, and the fourth has more applicable clauses here than on any
other page.

Include cross-feature, multi-step end-to-end journeys that chain more than one Business Rule in
a single flow, simulating realistic user behaviour rather than isolated element checks. Do not
create more than 5 unless the feature context requires more to cover every Business Rule at
least once.

Avoid true duplicates only. Two test cases are duplicates only if they test the exact same
element, the exact same input/option, and the exact same expected outcome — not merely because
they exercise a similar code path. Per Constraint 6, distinct named links, controls, Price
Details items, cart states, coupon classes, entry routes, decision-table rows, state
transitions, equivalence classes, boundary edges and techniques are NOT duplicates.

================================================================================
RULES
================================================================================

8. BUSINESS RULE MAPPING. Each test case maps to exactly one Business Rule, except End-to-End
   journey cases, which may list several. A case may only map to a rule whose stated text
   directly and unambiguously governs the behaviour tested — do not stretch a rule's wording to
   cover a feature it does not explicitly describe. BR4, BR5 and BR6 are carried over for
   numbering continuity only and MUST HAVE ZERO TEST CASES MAPPED TO THEM in this round — state
   this explicitly in the summary table with a one-line reason. The cart-icon item-count cases
   (per the Section 4 note), and all Usability, Analytics and Localisation cases, have no
   stating rule: flag them in the "Unmapped but in-scope behaviors" note rather than
   force-mapping or silently dropping them, and recommend a future BR18 for the icon count —
   NOT BR10. State explicitly in the summary table any rule with zero mapped cases, with a
   one-line reason.

9. TEST CASE FORMAT. A Markdown table with these ten columns, in this exact order:

   TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule

   - TC ID: sequential, zero-padded, register-wide — "TC-001", "TC-002" ... in the order the
     sections appear under Rule 12. Do not restart numbering per section and do not use
     per-module prefixes (no "CRT-01", "CPN-02"). If this round's register REPLACES the Round 3
     cart register, restart at TC-001 and state so. If instead it is APPENDED to a prior
     register, continue from the last TC ID used there rather than restarting. EITHER WAY, STATE
     THE STARTING NUMBER ASSUMED AND WHICH OF THE TWO MODES WAS CHOSEN, and comply with Rule 24.
   - Module: the Rule 12 section this case belongs to.
   - Scenario type: THE TECHNIQUE FROM SECTION 6, named exactly — one of: Positive, Negative,
     Equivalence Class, Boundary (accept), Boundary (reject), Boundary (discrepancy), Decision
     Table, State Transition, Data Integrity, End-to-End, Concurrency, Recovery, Security,
     Compliance, Analytics, Usability, Compatibility, Localisation, SEO, Interface Contract,
     Accessibility. This replaces the previous round's "positive or negative". Boundary cases
     take one of the three Boundary sub-values so an accept edge, a reject edge and a
     rule-contradicting edge are distinguishable at a glance.
   - Scenario: one sentence stating the behaviour under test and why it matters. For a Decision
     Table case, name the condition combination. For a State Transition case, name the
     from-state and to-state. For an Equivalence Class case, name the partition. For a Boundary
     case, name the limit and which side of it.
   - Precondition: required user type, account type, and the exact application state before step
     1 — including WHICH ENTRY ROUTE was used, whether the user is logged in, exactly which
     products are in the cart and at what quantities, whether a coupon is already applied, the
     ACTUAL CONTENTS of the relevant storage keys (not merely whether they exist), the starting
     page and browser, and — where the case involves more than one tab or browser — which is
     which.
   - Test Data: the concrete literal values used, each on its own line, so the case can be
     executed without guessing. Never placeholders like "<a product>" or "<a valid coupon>".
     Show product names, prices, quantities, the exact coupon code, the exact expected totals
     with their arithmetic shown, expected URLs, and the exact literal placeholder text "Enter
     Coupan code" where referenced, including whitespace.
   - Steps: 3-8 numbered, executable actions a tester with no prior feature knowledge could
     follow exactly as written, naming where to verify every non-visual outcome — the DevTools
     pane, the storage key, the console, the URL bar, the element's attribute (e.g. "Open
     DevTools > Application > Local Storage and diff the cart key against the snapshot taken in
     step 2", "Inspect the Remove button's accessible name in DevTools > Elements >
     Accessibility").
   - Expected Result: one or more numbered, objectively verifiable checkpoints, written per
     Rule 25. Where the application is expected to fail the check, state the requirement first,
     then what the source actually does, then instruct the tester to record it as a defect.
   - Priority: High / Medium / Low by business-critical impact. Product-tile display, all Price
     Details correctness, the coupon discount arithmetic, quantity-to-storage writeback, Place
     Order navigation, and every Security and Data Integrity case are High; static link-target,
     placeholder-text, SEO metadata, logo and cosmetic checks are typically Low/Medium.
   - Business Rule: per Rule 8.

   WORKED EXAMPLE (follow this level of concreteness for every test case):

   | TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule |
   |---|---|---|---|---|---|---|---|---|---|
   | TC-001 | Client-Side Security | Security | Verify the rendered Total Amount cannot be changed by editing the stored cart price, since the payable total is derived from a client value the user controls | Authenticated user; exactly one product in the cart at quantity 1; on the Cart page; DevTools > Application > Local Storage open with the cart key's full value recorded | Product: "Men's Casual Shirt"<br>Stored price before edit: `1299`<br>Stored price after edit: `1`<br>Total Amount before edit: as displayed | 1. Record the cart key's full value and the displayed Price, Total MRP and Total Amount<br>2. In DevTools > Application > Local Storage, edit the stored price for the product from `1299` to `1`<br>3. Reload the Cart page<br>4. Read the displayed Price, Total MRP and Total Amount<br>5. Click Place Order and, on the Address page, re-inspect the cart key<br>6. Diff the stored value against the step 1 snapshot | 1. Correct behaviour: a price is authoritative server-side and a client edit either has no effect on the payable total or is rejected<br>2. Record the actual rendered Total Amount after step 3 — if it reflects the tampered price, log it as a High-severity defect quoting both values<br>3. Record whether the tampered value survives into the Address step per step 5<br>4. State explicitly whether any validation rejected the edit | High | BR12 |

10. TEST CASE STANDARDS. Preconditions must state the entry route, the user type, exact cart
    contents and quantities, exact storage contents, whether a coupon is applied, and the
    starting browser. Test Data must be directly executable and must show the arithmetic behind
    any expected total. Steps must name the verification location for every non-visual outcome.
    Expected Results must be specific, observable and objectively verifiable, expressed as one
    outcome or as a numbered list of SIMULTANEOUSLY-REQUIRED checkpoints — never using the list
    to smuggle in unrelated or optional outcomes; every listed checkpoint must be a mandatory
    pass/fail condition of the same scenario. Every case must be unique per Constraint 6.

11. FOR DECISION TABLE CASES SPECIFICALLY: before the cases, include the decision table itself
    — conditions as rows, combinations as columns, the resulting action per column, and a marker
    on any combination the code makes unreachable or collapses into another. Then generate one
    case per reachable, distinct-outcome column. State the source's evaluation order, since it
    determines whether the coupon recomputes against a changed cart and therefore how many of
    Table 5(d)'s orderings are genuinely distinct.

12. GROUP TEST CASES UNDER THESE SECTIONS, in this exact order, using this exact naming:

        Navigation Links (BAG / ADDRESS / PAYMENT)
        Logo
        Product Tile Display
        Quantity Controls
        Remove Product
        Price Details Section
        Coupon Code
        Place Order
        Empty Cart State
        Persistence Checks (Logo & Cart Icon on Cart Page)
        Guest User Flows
        Authenticated User Flows
        Equivalence Classes
        Boundary — Quantity Control Limits
        Boundary — Coupon Code Field Limits
        Boundary — Price & Total Arithmetic Limits
        Decision Tables
        State Transitions
        Data Integrity
        Concurrency
        Recovery
        Client-Side Security
        Compliance
        Analytics
        Usability
        Compatibility
        Localisation
        SEO & Discoverability
        Interface Contract (Cart Client Storage Schema)
        Accessibility — Keyboard Navigation & Focus
        Accessibility — Forms & Labels
        Accessibility — Name, Role & Value for Controls
        Accessibility — Status Messages & Dynamic Updates
        Accessibility — Images & Alt Text
        Accessibility — Contrast
        Accessibility — Page Title & Structure
        Cross-Feature End-to-End Journeys
        Keyboard End-to-End Journeys

    Note: "Persistence Checks" remains its own section (distinct from Guest/Authenticated User
    Flows) because it is the only place BR7 is exercised in this round, and it must not be folded
    into the element-specific sections above it. "Guest User Flows" and "Authenticated User
    Flows" contain only cross-cutting session-level checks that are not already a single
    element's dedicated test (e.g. "guest does not see the cart icon and cannot reach the Cart
    page" belongs in Guest User Flows; "product tile appears after an authenticated user adds a
    product" belongs in Product Tile Display).

    A SECTION WITH NOTHING SOURCE-GROUNDED TO TEST STILL APPEARS IN THE SUMMARY TABLE WITH A
    COUNT OF 0 AND A ONE-LINE REASON. Do not delete the section and do not invent a case to fill
    it.

13. Do not invent fields, buttons, pages, workflows, or Business Rules beyond BR1-BR17 above.

14. ALL NINETEEN TECHNIQUES IN SECTION 6 ARE IN SCOPE IN THIS ROUND, including Client-Side
    Security, Boundary Value and Accessibility. This supersedes the previous round's Rule 11,
    which excluded security and accessibility and confined compatibility to the Logo and Cart
    icon, and the previous round's "Don't create" exclusion of boundary and accessibility
    scenarios. STILL EXCLUDED: server-side security, API, database, performance, and invented
    limits.

15. Generate manually executable UI-level test cases only. Tools assist verification; they do
    not replace a human-verifiable checkpoint.

16. Do not duplicate scenarios, per Constraint 6's duplicate definition.

17. Ensure every explicitly named element in Section 2 and Section 3 is covered by at least one
    case in every applicable Section 6 technique, or carries a zero-case statement for that
    technique. No element outside those sections is covered.

18. Ensure every test case maps to a Business Rule per Rule 8, or appears in the "Unmapped but
    in-scope behaviors" note.

19. Use clear, concise, and professional QA language.

20. ZERO-CASE STATEMENTS ARE MANDATORY. After the register, list every element-and-technique
    pair for which zero cases were generated, each with one line stating exactly what was
    searched for — name the attribute, the function, the grep pattern — and what was found
    absent or unreachable. A zero count must read as evidence grounded in the source, not as an
    omission. At minimum, state the grep result for:
      - `gtag`, `dataLayer`, `analytics`, `fetch`, `sendBeacon`, `XMLHttpRequest` (technique 13);
      - `Intl`, `toLocaleString`, `i18n`, `locale`, `lang=`, and the hardcoded currency symbol
        (technique 16);
      - `maxlength`, `pattern` on the coupon input, and any numeric comparison or cap in the
        quantity handler (technique 4) — this grep result is what licenses or forbids every
        boundary case in the register, so report it in full;
      - the quantity decrement handler, quoted verbatim, showing whether any floor is enforced
        (technique 4, BR3);
      - the coupon comparison, quoted verbatim, including whether it is case-sensitive and
        whether the accepted code or list is a hardcoded literal (technique 4, BR9, BR12);
      - `aria-`, `<label`, `alt=`, `role=`, and whether "-"/"+"/Remove are real `<button>`
        elements (technique 19);
      - `cookie`, `consent` (technique 12);
      - every `localStorage`/`sessionStorage` call in the cart script, with the key name and
        casing quoted (techniques 7, 11, 18);
      - the page's URL scheme and any security headers (technique 11).

21. BEFORE THE TEST CASE TABLE, INCLUDE:
    (a) a CRITICAL FINDINGS section — numbered, recording every fact established by reading the
        source that a tester needs first, each with a file and, where possible, line reference,
        and DISTINGUISHING COMPLIANT FINDINGS FROM DEFECTS. At minimum: the exact storage key
        name and casing this page writes, its full value shape field by field with types, and
        which downstream pages read or clear it; the exact quantity-change handler and whether
        it writes back to storage; whether Remove deletes from storage or only hides the tile;
        the exact Total Amount / Price / Total MRP arithmetic as implemented, quoted; the exact
        coupon comparison, quoted, with the accepted code and whether it is case-sensitive;
        whether a repeat add of the same product merges or duplicates; whether the Cart page
        carries any login gate of its own and therefore whether a guest can reach it by direct
        URL; the exact literal coupon placeholder string; whether "-"/"+"/Remove are `<button>`
        elements and what accessible name each carries; whether Total Amount lives in a live
        region; this page's `<title>`, heading structure and robots directive; the hardcoded
        currency symbol and any locale code; whether the three navigation links, Place Order and
        the Logo are real anchors with the stated targets; the page's URL scheme; and whether any
        tracking, locale or consent code exists;
    (b) the DECISION TABLES required by Rule 11, including both orderings of Table 5(d);
    (c) a summary table of case count per Rule 12 section, including every 0-count section with
        its reason;
    (d) a summary table of case count per Business Rule BR1-BR17, EXPLICITLY SHOWING 0 FOR BR4,
        BR5 AND BR6 with a one-line note explaining why, plus an "Unmapped" row covering the
        cart-icon count, Usability, Analytics and Localisation cases, plus a total-occurrences
        row;
    (e) a summary table of case count per Section 6 technique, showing all nineteen with 0 where
        applicable — this is the primary coverage artefact for this round;
    (f) an ELEMENT x TECHNIQUE MATRIX — Section 2/3 elements as rows (each of the three
        navigation links, the Logo, the Cart icon, the product tile and each of its named
        contents: product name, price, quantity count, "+", "-", Remove; each Price Details
        item: Price, Total MRP, coupon input, Apply Coupon, Total Amount, Place Order; and the
        empty-cart state), the nineteen techniques as columns — holding the covering TC IDs, a
        zero-case marker, or a dash where the technique does not apply to that element.

22. REPRODUCIBILITY CHECK. After generating the register, verify that every case traces to a
    named element in Section 2/3 and a technique in Section 6, that every decision-table case
    traces to a row of a stated table, that every boundary case traces to a limit named in the
    Rule 20 grep results, that every expected-to-fail case states both the requirement and the
    observed behaviour, and that no section was padded with a case not grounded in the source.
    Confirm a second independent run of this prompt against the same context would reproduce the
    same cases, the same zero-cases and the same defects. Remove any case that fails this check.

23. PRE-OUTPUT COVERAGE SELF-AUDIT. Before finalising, build the element x technique matrix from
    Rule 21(f) and confirm every applicable cell holds either a TC ID or a zero-case marker.
    Build a checklist of every element and behaviour explicitly named in Section 2 and Section 3
    — including each of the three navigation links and its stated target URL, the Logo's
    home-page navigation, the product tile and each of its named contents (product name, price,
    quantity count, "+" button, "-" button, Remove button), each named Price Details item
    (Price, Total MRP, the coupon input with its exact misspelled placeholder, Apply Coupon,
    Total Amount, Place Order), the empty-cart state, the Cart icon's presence and its item
    count, and every clause of BR17 (a) through (g) — and confirm each checklist item has at
    least one corresponding test case. Where a cell or a checklist item is empty, add the missing
    case or the missing zero-case statement BEFORE OUTPUT rather than presenting an incomplete
    register. Do not silently omit a named element or a technique for the sake of brevity.

24. SUPERSESSION CHECK — DO NOT LOSE COVERAGE THE PREVIOUS ROUND HAD. This prompt supersedes the
    Round 3 cart register and any separate boundary or accessibility round for this page.
    Supersession is a replacement, not an amnesty: anything the Round 3 register asserted that
    this register does not reproduce becomes genuinely untested, because there is no combined
    register to fall back on.

    Before output, read the Round 3 cart register alongside this one and confirm that every
    behaviour it asserted is asserted somewhere here — under whatever new technique, section or
    TC ID. Pay particular attention to the eight Constraint 6 items (a) through (h), which
    Round 3 enumerated explicitly and which are easy to lose when a register is reorganised by
    technique rather than by element. Where a Round 3 assertion is deliberately dropped, state it
    and the reason in a short "Coverage carried forward from Round 3" note; where it was dropped
    by accident, add it back.

    This rule exists because a measured comparison of the Search Results v1 and v2 registers
    found that the technique-expanded rewrite, despite growing from 75 to 128 cases, silently
    lost four behaviours the smaller register had covered — including same-facet multi-value
    selection, which the v2 findings narrative described but no test case exercised. A behaviour
    named only in a findings narrative is NOT covered. Every finding that implies a testable
    behaviour must have a test case behind it, or an explicit zero-case statement saying why it
    does not.

25. ASSERTION, NOT OBSERVATION. Every Expected Result must state the requirement the case is
    measuring against, not merely instruct the tester to record what happens. "Record the
    resulting value" is a note-taking instruction, not a pass/fail condition, and a case built
    that way cannot fail — which means it provides no coverage no matter how well written the
    steps are.

    Where the correct behaviour is knowable, state it first, then state what the source actually
    does, then instruct the tester to log the difference as a defect. Where the correct behaviour
    is genuinely NOT knowable from the available context — a browser-specific behaviour, an
    unspecified design decision — the case may ask the tester to record the actual result, but it
    must ALSO state the condition under which the recorded result would constitute a defect, so
    there is still a pass/fail line.

    This rule exists because a measured comparison of the Payment page register against the
    master test-case dump found that all three of its partially-covered master requirements
    failed for exactly this reason: the register exercised a rapid double-click on the submit
    button and a browser-back after success, but never stated that a submit guard was expected or
    that a replay should be refused, so the master's requirements went unmet despite the
    behaviour being exercised. On this page the same trap is waiting at the quantity floor, the
    double-click on Apply Coupon, and the Remove-with-coupon-applied row — in each case it is not
    enough to record what Styleup does; the case must state what correct behaviour would be.

================================================================================
END OF PROMPT
================================================================================
