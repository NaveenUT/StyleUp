================================================================================
PAYMENT PAGE — FUNCTIONAL TEST CASE GENERATION PROMPT (v2)
================================================================================

WHAT CHANGED FROM THE PREVIOUS PAYMENT ROUND (payment_page_prompt.md, Round 5)

The previous payment round generated only Positive and Negative cases. This version brings
the Payment page up to the same standard as prompt_search_v2 (Search Results) and
prompt_1_v5 (Homepage / Sign In / Sign Up): seventeen additional techniques are now in
scope — Equivalence Class, Boundary Value, Decision Table, State Transition, Data Integrity,
End-to-End, Concurrency, Recovery, Security, Compliance, Analytics, Usability, Compatibility,
Localisation, SEO, Interface Contract and Accessibility.

Adding them required six edits, not just an addition:

  1. The "Scenario type" column now holds a technique from a defined list (Section 6)
     rather than "positive or negative".
  2. The previous round's Rule 11 ban on security and accessibility testing is partially
     lifted: CLIENT-SIDE security and accessibility are now IN scope; performance, API,
     database, and all server-side/gateway/transaction security stay out. On a payment form
     this distinction matters more than on any other page — see Section 6 technique 11 and
     the DON'T CREATE section.
  3. The previous round's "Don't create — Boundary scenarios" exclusion is lifted, but ONLY
     for limits that are explicitly stated or source-verifiable. The specific prohibitions
     in the old Constraint 2 and the old "Don't create" list — no invented card-number
     digit-count, no Luhn/checksum, no CVV-length, no expiry-date-in-the-past rules — REMAIN
     IN FORCE and are restated in technique 4. Expanding the technique list is not licence
     to invent the validation rules this application does not implement.
  4. Rule 12's "functional UI test cases only" is widened to admit client-side security,
     storage-contract and accessibility checks.
  5. BR10-BR17 are added, because eight of the new techniques had no Business Rule to map to.
     NOTE THE NUMBERING: this page's register already uses BR1-BR9, where BR8 governs
     cross-links and BR9 is a carried-over Cart-page rule with zero cases. The new rules
     therefore start at BR10 and do NOT match prompt_search_v2's BR9-BR16 numbering, nor
     prompt_1_v5's BR8-BR15 numbering. When cross-referencing the three registers, map by
     rule TEXT, not by rule number.
  6. CONSEQUENT RENUMBERING OF THE DATE FIELD'S FUTURE RULE. The Round 5 prompt's Section 4
     note recommended "a future BR10" for the Date field. BR10 is now DATA INTEGRITY. The
     Date field's recommended future rule is therefore BR18, and the Date field's cases
     remain "Unmapped (see note)" in this round. Do not map any Date field case to BR10.

Because Accessibility and Boundary are now in scope here, this prompt supersedes any separate
boundary or accessibility round for the Payment page. Run one or the other, not both, or the
two registers will duplicate each other. See Rule 24 before discarding the Round 5 register.

--------------------------------------------------------------------------------

Role: Act as a QA Test Architect in functional test design for healthcare, medical, and
e-commerce websites. Analyse the source code and local host website from a QA perspective and
generate comprehensive, high-quality test cases based only on the provided context.

Task: Analyse the source code and the locally accessible Payment page (reached at
`http://localhost:5501/payment.html` — adjust the actual URL to match the real app) and
generate test cases for that page only, across ALL NINETEEN TECHNIQUES NAMED IN SECTION 6 —
the original Positive and Negative paths plus the seventeen added types.

The Payment page can be reached in three ways: (a) as an authenticated user, add one or more
products from any category (Men, Women, etc.), click the cart icon to navigate to the Cart
page, click the "PLACE ORDER" button to reach the Address page, fill in the address details,
click "ADD ADDRESS", and click "OK" on the thank-you popup, which navigates to the Payment
page; (b) navigate to the Cart page (with or without products) and click the PAYMENT link;
or (c) enter the URL directly (per BR2). All three routes are in scope and are distinguished
in Section 6 technique 5(b).

Website:
http://localhost:5501/payment.html  (Payment page — confirm the exact URL and filename
casing from the running app before execution)

================================================================================
FEATURE CONTEXT
================================================================================

1. PAGE URL & ENVIRONMENT

   URL: http://localhost:5501/payment.html — Payment page
   Environment: local  |  Domain: no domain specific
   Persistence: browser `localStorage` only. Read the actual key names and their exact casing
        from the source before writing any case that depends on them. The Cart page writes
        cart data and the Address page writes address data; establish from the source which
        keys this page READS, which (if any) it WRITES, and what it does when a key it
        expects is absent — which is precisely the state produced by the BR2 direct-URL
        route.

2. PAGE SECTIONS VISIBLE ON THE PAYMENT PAGE

   Payment page:

     - Three links: BAG, ADDRESS, PAYMENT

     - CONTACT DETAILS section (as labeled in the brief — verify the actual on-page heading
       text against the source code):
         - Card Number field — placeholder text: "Card Number"
         - Name On Card field — placeholder text: "Name On Card"

     - Date field — displays in dd-mm-yyyy format, with a calendar icon

     - CVV field (no placeholder text stated in the brief — verify the actual placeholder,
       if any, against the source code)

     - Pay Now button

     - Logo — navigates to the home page

3. KEY INTERACTIVE ELEMENTS

   This list is exhaustive for THIS round — do not test any element not named here or in
   Section 2 above. Section 6 names the techniques each must be tested with.

   - CONTACT DETAILS section:
       - Card Number field — placeholder "Card Number"; accepts numbers ONLY (does not accept
         symbols, alphabets, or alphanumeric values); has up and down spinner arrow buttons
         (per BR4).
       - Name On Card field — placeholder "Name On Card"; accepts any character (per BR3).
   - Date field — displays the dd-mm-yyyy format with a calendar icon; when the calendar icon
     is clicked, the calendar (date picker) opens.
   - CVV field — accepts numbers ONLY (does not accept symbols, alphabets, or alphanumeric
     values); has up and down spinner arrow buttons (per BR4).
   - Pay Now button — when clicked with empty or invalid credentials, the message
     "WRONG CREDENTIALS!" is shown (per BR5).
   - Three links: clicking ADDRESS navigates to "http://localhost:5501/Address.html";
     clicking PAYMENT navigates to (stays on) "http://localhost:5501/payment.html"; clicking
     BAG navigates to "http://localhost:5501/cart.html".
   - Logo — clicking it navigates to the home page.

   Also in scope for this round, but ONLY as named in BR7 (persistence) — the Logo AS IT
   APPEARS ON THIS PAGE. Do not re-test the Top Menu, Sign In/Sign Up buttons, Footer, or the
   Cart icon. (The Cart icon is excluded because prior rounds' registers documented that no
   Cart icon renders on the checkout-flow pages, and Section 2 of this round names none.)

   THIS LIST NAMES THE ELEMENTS IN SCOPE. SECTION 6 NAMES THE TECHNIQUES EACH MUST BE TESTED
   WITH.

4. BUSINESS RULES

   BR1 - Only an authenticated user can complete the full checkout entry route to the Payment
         page: add a product to the cart, navigate to the Cart page by clicking the cart icon,
         click the "PLACE ORDER" button to reach the Address page, fill in the address
         details, click "ADD ADDRESS", and click "OK" on the thank-you popup, which navigates
         to the Payment page.

   BR2 - Both a Guest user and an Authenticated user can navigate to the Payment page directly
         by entering "http://localhost:5501/payment.html" in the URL bar, can fill in the
         payment details, and can click "Pay Now".

   BR3 - The Name On Card field accepts any character (letters, numbers, symbols, and
         combinations thereof).

   BR4 - The Card Number field and the CVV field accept numbers ONLY (they do not accept
         symbols, alphabets, or alphanumeric values). Both fields have up and down spinner
         arrow buttons: clicking the up arrow increments the current value by 1 (e.g. 356
         becomes 357), and clicking the down arrow decrements the current value by 1 (e.g.
         357 becomes 356).

   BR5 - When the Pay Now button is clicked with empty or invalid credentials, the message
         "WRONG CREDENTIALS!" is shown. (The exact condition the source code uses to classify
         credentials as valid vs. invalid, and the outcome of a valid submission, must be
         derived from the source code — see Constraint 4.)

   BR6 - (Carried over from the homepage round — governs Sign-Up field validation.) Not
         applicable in this round: the Payment page contains no Sign Up fields or actions. No
         test case in this register maps to BR6.

   BR7 - Any element whose Section 2/3 description states it is displayed "on all pages,"
         "after login," "after logout," or otherwise persists across a page or session
         transition must render identically and correctly in every state named. Within THIS
         round this covers only the Logo as it appears specifically on the Payment page — it
         does NOT extend to re-testing the Top Menu, Sign In/Sign Up buttons, Footer, Cart
         icon, or any other element not named in Section 2/3 of this round. This rule also
         governs cross-browser and incognito consistency for that element.

   BR8 - All named cross-links on the Payment page (the BAG, ADDRESS, and PAYMENT links, and
         the Logo's home-page navigation) must be present and correctly targeted to the URLs
         stated in Section 3.

   BR9 - (Carried over from the Cart page round — governs valid-coupon discount behavior.)
         Not applicable in this round: the Payment page contains no coupon field, Apply Coupon
         button, or Price Details. No test case in this register maps to BR9.

   NEW IN v2 — added because eight of the seventeen new techniques had no rule to map to.
   These continue this page's own numbering from BR9; they are NOT the same numbers as
   prompt_search_v2's or prompt_1_v5's equivalent rules.

   BR10 — DATA INTEGRITY. Anything the application persists or derives must be readable back
          unchanged: every stored field exactly as written, no truncation, no type coercion,
          no silent reordering or loss. On this page this governs: what the four payment
          fields hold in the DOM versus what was typed (a `number` input silently discards
          characters it will not accept — establish exactly what is retained); whether a
          spinner increment/decrement produces the arithmetically correct value from the
          current value, including when the field is empty; whether any value this page reads
          from storage (cart total, address, user identity) is rendered exactly as stored; and
          whether Pay Now writes anything at all, and if so whether every field lands
          unchanged.

   BR11 — STATE MACHINE AND CONCURRENT ACCESS. The application must move only through valid
          state transitions (field empty -> filled -> cleared; Pay Now not-yet-submitted ->
          submitted-with-error -> resubmitted; calendar closed -> open -> date selected ->
          closed; guest -> authenticated while remaining on or returning to this page; cart
          populated -> emptied while this page is open), must reach the correct state on
          re-entry, and must behave predictably when two actors — two tabs, two browsers, or
          one rapid double-click on Pay Now — act on the same stored state.

   BR12 — CLIENT-SIDE SECURITY. On a payment form this is the highest-severity rule in the
          register. User-supplied input must not execute when rendered back. Payment field
          values must not be persisted to client storage, written into a DOM `value`
          attribute that survives navigation, or logged to the console. The CVV in particular
          must not be retained anywhere after submission. A client-side credential gate must
          not be bypassable by editing the DOM or calling the handler directly from the
          console, and any expected credential value hardcoded in the source is itself the
          finding. Failure paths must not leak a stack trace, path or version.

   BR13 — RECOVERY AND GRACEFUL DEGRADATION. After a failed action, a blocked resource, a
          storage failure, a refresh, or a browser-back, the application must return to a
          usable, correctly-stated state rather than a broken or misleading one. This includes
          what happens to entered field values on refresh and on browser-back; what the page
          renders when reached by the BR2 direct-URL route with no cart data and no address
          data present; what happens when a key this page reads holds a malformed value; and
          what happens on a Pay Now click with client storage disabled.

   BR14 — INTERFACE CONTRACT. Every page that reads a stored key must agree with every page
          that writes it — same key name, same casing, same value shape. The Cart page writes
          cart entries and the Address page writes address details; establish which of those
          this page reads, confirm the names and casing agree on both sides, and confirm this
          page handles the value being absent, empty or malformed. A value that is absent
          because the user arrived by direct URL is the ordinary case here, not an edge case.

   BR15 — COMPLIANCE. Where the application states a policy or presents a policy document,
          observed behaviour must match it; where consent is required before storing data, it
          must be obtained. On this page the observable compliance surface is: whether card
          data or the CVV is written to client storage at all; whether the card number and CVV
          inputs are masked from shoulder-surfing; whether `autocomplete` is set on the
          payment fields; and whether any consent is obtained before a Pay Now click stores
          anything. Record what is observably true. Do NOT assess PCI-DSS compliance, issue a
          compliance verdict, or test a gateway — those are out of scope per the DON'T CREATE
          section.

   BR16 — DISCOVERABILITY AND SEO. This page must carry a descriptive, distinct title and the
          metadata needed for it to be indexed as intended. A payment page is a conventional
          candidate for a `noindex` robots directive — test what directive is actually
          present, not what ought to be, and record the absence of one as the finding if that
          is what the source shows.

   BR17 — ACCESSIBILITY (WCAG 2.1 Level AA), scoped to the elements named in Section 2/3:
          (a) KEYBOARD OPERABILITY: every one of the four input fields, both spinner arrow
              pairs, the calendar icon and its date picker, the Pay Now button, the three
              navigation links and the Logo must be reachable with Tab in a logical order,
              show a visible focus indicator, and be operable with Enter/Space/arrow keys as
              appropriate. A complete fill-all-fields -> Pay Now journey must be completable
              with the keyboard alone. Establish whether the spinner arrows are reachable
              separately from the field or are driven by the Up/Down arrow keys on the field
              itself, and whether the date picker can be opened and a date selected without a
              pointer. (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7)
          (b) LABELS AND NAMES: each of the four fields must have a programmatically
              associated label. A placeholder is NOT a label — Section 2 describes all four
              fields by their placeholder text, so if the source shows placeholder-only
              fields with no `<label>`, `aria-label` or `aria-labelledby`, that is a defect
              under WCAG 1.3.1/3.3.2 and the placeholder's disappearance on focus is the
              user-facing consequence. The calendar icon and the Pay Now button must each have
              an accessible name. (WCAG 1.3.1, 3.3.2, 4.1.2)
          (c) INPUT PURPOSE: the payment fields must identify their purpose programmatically
              via the correct `autocomplete` tokens — `cc-number`, `cc-name`, `cc-exp` and
              `cc-csc`. This clause is Level AA and applies specifically and unusually well to
              this page; where the tokens are absent, that absence is the finding. (WCAG 1.3.5)
          (d) ERROR IDENTIFICATION AND STATUS ANNOUNCEMENT: the "WRONG CREDENTIALS!" message
              must identify which field or condition is at fault, be programmatically
              associated with the input it concerns, and be conveyed to assistive technology
              when it appears. A message rendered via `alert()`, or written silently into the
              DOM with no live region, must be recorded as tested against these requirements.
              (WCAG 3.3.1, 3.3.3, 4.1.3)
          (e) IMAGES: the Logo and the calendar icon must have a non-empty, meaningful `alt`
              attribute or equivalent accessible name. (WCAG 1.1.1)
          (f) CONTRAST: visible text of the three navigation links, the CONTACT DETAILS
              heading, all four field placeholders and entered values, the Date field's
              displayed format, the Pay Now button, and the "WRONG CREDENTIALS!" message must
              meet at least 4.5:1 against its background (3:1 for large-scale text). Include
              the placeholder text specifically — low-contrast placeholder text is the single
              most common failure on a form like this. (WCAG 1.4.3)
          (g) PAGE TITLE AND STRUCTURE: the page must have a descriptive, distinct `<title>`
              and a usable heading hierarchy including an `<h1>`. (WCAG 2.4.2, 1.3.1)

   Note on the Date field: the Date field's dd-mm-yyyy format and its
   calendar-icon-opens-calendar behaviour are explicitly named in Section 2/3 and therefore
   MUST be tested (per Rule 17), but no Business Rule above governs them. Map those cases as
   "Unmapped (see note)", list them in the "Unmapped but in-scope behaviors" note, and
   recommend a future BR18 — NOT BR10, which is now DATA INTEGRITY. Accessibility, Data
   Integrity, Recovery, Localisation and Compatibility cases that happen to involve the Date
   field DO map to their own rules; only the field's format-and-calendar behaviour itself is
   unmapped.

   Usability, Analytics and Localisation cases have NO STATING BUSINESS RULE and must be
   flagged in the same note per Rule 8, not force-mapped.

5. USER TYPES

   - Guest user (not logged in) — per BR1, cannot add a product to the cart, does not see the
     cart icon, and cannot reach the Payment page via the Place Order -> Address -> Add
     Address checkout route; per BR2, CAN reach the Payment page directly by URL, fill in the
     payment details, and click Pay Now.
   - Authenticated user (logged in) — can add products, reach the Cart page via the cart icon,
     reach the Payment page via the full checkout route (BR1), via the Cart page's PAYMENT
     link, or directly by URL (BR2), fill in the payment details, and click Pay Now.
   - A SECOND, SEPARATE ACCOUNT is required for the BR11 shared-browser cases.
   - Account type: not specific.
   - Browsers: Chrome, Edge, Firefox, Safari, and one private/incognito window.
   - Tooling: DevTools Application > Local Storage for BR10/BR11/BR14 cases; DevTools Network
     for blocked-resource and Analytics cases; DevTools Console for leakage and
     handler-invocation cases; DevTools Elements for SEO, autocomplete-attribute and
     Accessibility cases; a screen reader (NVDA or VoiceOver) for the BR17(b)/(c)/(d) cases;
     a contrast checker for BR17(f); two tabs and two browsers for concurrency cases.

6. TEST CASE TECHNIQUES — ALL NINETEEN ARE IN SCOPE

   Every element in Section 2/3 must be tested with every technique below that applies to it.
   Where a technique does not apply to an element, or the application does not implement the
   thing the technique probes, RECORD A ZERO-CASE PER RULE 20 — do not invent filler to
   populate a section.

   READ THIS BEFORE GENERATING. On an application of this size several of these techniques
   will legitimately produce very few cases, or none. Analytics is the likely zero section,
   because a local client-only demo has no tracking layer — though note this page is the most
   conventional place in an entire e-commerce site for a purchase or begin_checkout event, so
   its absence is worth recording specifically rather than generically. Localisation and
   Compatibility, by contrast, are expected to be PRODUCTIVE on this page and not zero
   sections, because this page renders a NATIVE DATE INPUT and TWO NATIVE NUMBER INPUTS —
   whose displayed format, spinner rendering and picker behaviour are determined by the
   browser and the OS locale, not by the application. That makes dd-mm-yyyy versus mm-dd-yyyy
   an observable, testable locale question here rather than a hypothetical one. A zero
   grounded in a named grep is a correct and valuable result. A fabricated case to fill a
   section is not.

   (1) POSITIVE — the element performing its stated function with valid input in the stated
       state. Per Constraint 5, each of the three navigation links, each numeric field's
       accepts-numbers behaviour, the Name On Card any-character acceptance, each spinner
       arrow on each field, the calendar-opens-on-icon-click behaviour, and the Logo's
       home-page navigation gets its own positive case.

   (2) NEGATIVE — invalid, missing or malformed input or state. On this page the negative
       surface is: symbols, alphabets and alphanumeric input rejected by the Card Number field
       and by the CVV field (per BR4); the Pay Now click with ALL fields empty; the Pay Now
       click with filled-but-invalid credentials (per BR5, and per the source's actual valid/
       invalid condition); a Pay Now click with SOME fields filled and others empty, if the
       source's condition makes that a distinct class; and the page reached with the storage
       keys it reads absent or malformed. One case per distinct invalid class, even where two
       classes produce the same rendered "WRONG CREDENTIALS!" result.

   (3) EQUIVALENCE CLASS — partition each input's value space into classes the code treats
       identically, then test one representative per class and state the partitions explicitly.
       Derive the classes from the source's ACTUAL branching and from the input `type`
       attribute, not from intuition. The partitionable value spaces on this page are:
         - Card Number and CVV input kind: pure numeric | pure symbol | pure alphabetic |
           alphanumeric (leading digit) | alphanumeric (leading letter) | empty. Note that a
           `number` input and a `text` input with a JS filter partition these differently —
           establish which is used before enumerating.
         - Name On Card: letters | digits | symbols | mixed | empty. Per BR3 the first four
           collapse into ONE accepting class — state that explicitly rather than generating
           four cases that assert the same thing, but DO state it as a partition so the class
           is not silently untested.
         - Pay Now credential state: all-empty | filled-and-invalid | filled-and-valid (only
           if the source defines a valid condition) | partially-filled.
         - Entry route: BR1 full checkout route | Cart page PAYMENT link | BR2 direct URL as
           guest | BR2 direct URL as authenticated.
         - Date field value: a date chosen via the picker | a date typed directly, if the
           input permits typing | empty.
       Enumerate every valid class as well as every invalid one — a partition with no
       representative is an untested class.

   (4) BOUNDARY VALUE — apply boundary-value analysis ONLY where a limit is explicitly stated
       in Section 2/4 or is verifiable in the source (an attribute on an input, a numeric
       comparison in the JS, a comparator).

       DO NOT INVENT LIMITS. THIS PROHIBITION IS UNCHANGED FROM ROUND 5 AND IS THE MOST LIKELY
       PLACE FOR THIS PROMPT TO BE MISUSED. Specifically, DO NOT generate cases for a 16-digit
       card-number length, a Luhn or checksum rule, a 3-digit or 4-digit CVV length, or an
       expiry-date-in-the-past rule, UNLESS the source code defines that rule. If the source
       defines none of them, say so in the Rule 20 zero-case statements, naming the attributes
       and comparisons grepped for.

       The source-verifiable boundaries on this page are expected to be:
         - each numeric field's `min`, `max`, `step` and `maxlength` attributes IF PRESENT —
           grep for them; where absent, that absence is itself the boundary finding, because
           an unbounded numeric input accepts values no card number could take;
         - the spinner's behaviour at its lower edge: from a value of 1, then 0, click the
           down arrow — does the value go negative, stop, or clear? An unbounded `number`
           input goes negative, which is a defect against BR4's stated
           decrement-by-1 semantics only if a floor is defined, so state both;
         - the spinner's behaviour on an EMPTY field: click the up arrow with the field empty
           and record what value results, since this is where an implicit starting value
           reveals itself;
         - the spinner's behaviour at any `max` the source defines, one step below and one
           step above;
         - the Date field's `min` and `max` attributes IF PRESENT, tested at the limit, one
           day below and one day above; and the picker's own year-range edges if the source
           constrains them;
         - the credential condition the source actually implements — whatever comparison
           BR5's valid/invalid split rests on, test it exactly at the boundary, one step
           inside and one step outside. If the condition is an emptiness check rather than a
           value comparison, say so and generate the emptiness boundary only.
       For each such limit generate cases at the limit, one step below, and one step above,
       where each side is meaningful. Where an element has no source-verifiable limit,
       generate zero boundary cases for it and say so per Rule 20.

   (5) DECISION TABLE — where two or more conditions combine to determine which outcome fires.
       Build the truth table from the source's ACTUAL EVALUATION ORDER, then generate one case
       per reachable combination and mark the unreachable ones. The decision points on this
       page are:
         (a) PAY NOW x FIELD-FILL STATE — Card Number filled? x Name On Card filled? x Date
             filled? x CVV filled? -> is "WRONG CREDENTIALS!" shown, and does anything else
             happen? Four binary conditions give sixteen combinations; establish from the
             source whether the check is a single all-or-nothing emptiness test (in which case
             most combinations collapse into one class and you must SAY SO and mark the
             collapsed rows) or a per-field test. Do not generate sixteen near-identical cases
             if the source collapses them — generate one per genuinely distinct outcome and
             state the collapse.
         (b) ENTRY ROUTE x USER TYPE — route (BR1 full checkout | Cart PAYMENT link | direct
             URL) x user (guest | authenticated) -> is the page reachable, does it render
             completely, and is any field or displayed value different? The guest-via-direct-
             URL row is the one BR2 explicitly permits and the one most likely to expose a
             page that assumes cart or address data exists.
         (c) NUMERIC FIELD x INPUT KIND — field (Card Number | CVV) x input kind (numeric |
             symbol | alphabetic | alphanumeric) -> accepted, silently filtered, or rejected.
             State what "rejected" means observably: nothing appears, or something partial
             appears.
         (d) SPINNER x CURRENT VALUE — field (Card Number | CVV) x arrow (up | down) x current
             value (empty | positive | zero) -> resulting value. This is where BR4's stated
             increment/decrement semantics meet the input's actual implementation.

   (6) STATE TRANSITION — the application's state machine. Derive the states from the actual
       persisted keys and the actual DOM state, then test each valid transition, each
       attempted invalid transition, and re-entry into a state already occupied. The machines
       here are: field empty -> filled -> cleared -> refilled (does anything persist?);
       Pay Now not-yet-submitted -> submitted-with-error -> corrected -> resubmitted (does the
       "WRONG CREDENTIALS!" message clear when the fields change, or persist stale?); calendar
       closed -> open -> date selected -> closed -> reopened (does it reopen on the previously
       selected date?); guest -> authenticated entered from this page, with the question of
       whether the entered field values and the cart survive the transition; and cart
       populated -> emptied in a second tab while this page sits open.

   (7) DATA INTEGRITY — whether what was written is what is read back, and whether derived
       values stay consistent. Inspect storage and the DOM, do not trust the rendered text.
       Test that each field's DOM `value` after typing equals exactly what was typed, and
       where it does not (a `number` input discarding characters), record precisely what is
       retained; that a spinner increment from a known value produces exactly that value plus
       one, and a decrement exactly minus one, per BR4's own example; that the spinner
       arithmetic holds at multi-digit values rather than only at the three-digit example
       BR4 gives; that any value this page reads from storage renders exactly as stored; and
       that a Pay Now click writes either nothing or exactly what it claims — inspect every
       storage key before and after and diff them.

   (8) END-TO-END — multi-step journeys chaining more than one Business Rule in a realistic
       flow. At least one journey must terminate in a PERSISTED-STATE ASSERTION — inspect the
       relevant storage keys and confirm their contents — not merely a navigation or a
       message, so the journey proves what did and did not land. The canonical journeys for
       this page are: (i) an authenticated user completes the full BR1 checkout route, lands
       on the Payment page, fills all four fields, adjusts the CVV via the up arrow, clicks
       Pay Now, and the tester then inspects every storage key to confirm what was and was not
       written; and (ii) a guest reaches the page by direct URL per BR2, clicks Pay Now with
       all fields empty, verifies "WRONG CREDENTIALS!", fills the fields, retries, and
       inspects storage. Do not create more than 5.

   (9) CONCURRENCY — two actors on the same stored state. There is no server tier, so the
       concurrency surface is client-side: two browser tabs both on the Payment page with
       Pay Now clicked from each; the same account in two different browsers; the cart emptied
       in one tab while the Payment page sits open in another; and a rapid double-click on
       Pay Now. Test whether the second actor sees stale state and whether a double-click
       produces a double write or a double message.

   (10) RECOVERY — returning to a usable state after a failure or an interruption. Test:
        whether entered field values survive a page refresh (and whether they SHOULD — a
        retained CVV after refresh is a BR12 finding, not a convenience); whether they survive
        a browser-back from the Address page and forward again; what the page renders when
        reached by direct URL with no cart data and no address data present; what happens when
        a key this page reads holds a malformed value; what happens on a Pay Now click with
        client storage disabled or full; and whether a blocked image or script leaves the form
        usable or broken.

   (11) SECURITY — CLIENT-SIDE ONLY, per BR12. This is the highest-priority technique in this
        register. Test: whether the Card Number and CVV values are ever written to
        localStorage, sessionStorage, a cookie, a DOM `value` attribute that survives
        navigation, or the console — inspect storage before and after a Pay Now click and diff;
        whether the CVV input masks its value on screen (`type="password"` versus a visible
        `number`), and whether the card number does; whether `autocomplete="off"` or the
        correct `cc-*` tokens are set on the payment fields, and what the absence implies for
        values persisted by the browser itself; whether the credential check is performed in
        client-side JS and whether the expected value is hardcoded in the source — if it is,
        that is the finding and the test is to read it out of the source; whether the check can
        be bypassed by editing the DOM or by invoking the handler directly from the console;
        whether a script payload typed into Name On Card (the only any-character field, per
        BR3) is ever rendered back unescaped into the message or the DOM; and whether any
        failure path leaks a stack trace, path or version.

        This technique covers the CLIENT ONLY. Do not test a gateway, a real transaction, a
        server-side validation, or issue a PCI-DSS verdict — see DON'T CREATE.

   (12) COMPLIANCE — stated policy versus observed behaviour, per BR15. Test whether any
        consent is obtained before a Pay Now click stores anything; whether the page presents
        or links any policy document and whether it resolves FROM THIS PAGE; and whether the
        observable handling of card data matches what a payment page conventionally states
        about it. Where no consent mechanism and no policy statement exist on this page, that
        absence is the finding. Record observable facts only — do not certify or fail the
        application against a standard.

   (13) ANALYTICS — whether any event or tracking call fires on the key actions of this page:
        page load, field entry, calendar open, and Pay Now click. Grep the source for `gtag`,
        `dataLayer`, `analytics`, `fetch`, `sendBeacon` and `XMLHttpRequest`. Report the grep
        result explicitly: if no tracking layer exists, record a zero-case naming exactly what
        was searched for, and do not invent events. Note that a payment page is the single most
        conventional place in an e-commerce site for a purchase, begin_checkout or
        add_payment_info event to fire, so its absence is worth recording specifically rather
        than generically.

   (14) USABILITY — friction and clarity, expressed OBJECTIVELY. Each case must have a
        verifiable pass condition, not an opinion. Testable here: whether "WRONG CREDENTIALS!"
        identifies WHICH field or condition is at fault or merely that something is wrong;
        whether the message is dismissible and whether it clears when the user corrects a
        field; whether the message blocks interaction (an `alert()` does, an inline div does
        not) and how many interactions are needed to get back to the form; whether any
        field-level validation feedback appears before submission; whether a spinner control
        is appropriate on a card-number field at all, tested objectively as "the field exposes
        increment/decrement affordances that no valid card-number edit would use"; whether the
        mouse scroll wheel over a focused `number` input silently changes its value, which is a
        reproducible data-entry hazard specific to this input type; and whether the Date field
        communicates its expected format before the user types.

   (15) COMPATIBILITY — the 4 named browsers plus incognito. This now covers two tiers: the
        BR7 persistence element (the Logo) as in the previous round, AND — new in v2 — the form
        interaction paths in each browser, plus the browser-native behaviour this page depends
        on more heavily than any other page in the site: native `<input type="number">`
        spinner rendering and whether the arrows are even displayed (they are hidden by default
        in some browsers and on touch devices), native `<input type="date">` picker rendering
        and its displayed format, `alert()` dialog rendering if the message uses one, and
        localStorage availability in a private window. Establish from the source which input
        `type` each field uses before writing these cases — the entire compatibility surface
        depends on it.

   (16) LOCALISATION — locale-dependent presentation. Grep for `Intl`, `toLocaleString`,
        `lang=`, and any locale or i18n module. THIS PAGE IS PRODUCTIVE FOR THIS TECHNIQUE
        because it renders a native date input: a `<input type="date">` displays in the
        BROWSER AND OS LOCALE'S format, not the application's, so Section 2's stated
        "dd-mm-yyyy format" is a claim to be TESTED rather than assumed — verify it in a
        browser configured to a US locale, where the same element renders mm-dd-yyyy, and
        record any mismatch between the stated format and the observed one as the finding. Also
        test: whether the displayed format matches what any downstream reader expects; whether
        the `<html lang=>` attribute is present and correct; text direction; and whether
        user-visible strings, including "WRONG CREDENTIALS!", are hardcoded to one language.
        Where no locale layer exists, record a zero-case — but report the hardcoded-string and
        browser-locale-dependent-date findings as the substance of that section.

   (17) SEO — per BR16. Test this page's `<title>` for presence, descriptiveness and
        distinctness from the homepage and every other page; the presence of a meta
        description, canonical and robots directive, and what the robots directive actually
        says for a payment URL — a payment page is a conventional `noindex` candidate, so an
        absent directive is a finding; and the heading hierarchy including whether an `<h1>`
        exists.

   (18) INTERFACE CONTRACT — the contract between components. There is no server API, so the
        contract here is the client storage schema: the Cart page and the Address page write
        keys that this page may read, and this page may write a key that a confirmation page
        reads. Confirm every key name and its exact casing agree on both sides; confirm the
        value shape agrees; and confirm this page handles each such value being absent, empty
        or malformed. The BR2 direct-URL route produces the absent case by design, so it is
        the ordinary path through this contract rather than an edge case — test it as such.

   (19) ACCESSIBILITY — WCAG 2.1 Level AA, per BR17. Each clause is tested per element group
        where it applies, and the label and input-purpose clauses are tested per named field.
        This page is a FORM, which makes it the richest accessibility surface in the site:
        where the source shows a placeholder-only field with no `<label>`, a missing
        `autocomplete` token, an error message with no programmatic association or live region,
        a date picker that cannot be operated by keyboard, or a missing `alt`, the Expected
        Result is the BR17 requirement and the current state is recorded as a defect — not the
        pass condition.

================================================================================
CONSTRAINTS
================================================================================

1. Analyse the source code and the locally accessible Payment page only. Do not re-generate
   test cases for the homepage, Search Results page, Sign In page, Sign Up page, Cart page, or
   Address page — those were covered in prior rounds. The Cart page's Place Order button and
   the Address page's Add Address/OK flow may appear only as entry steps of a Payment page
   journey, not as re-tested elements in their own right. Every case must be grounded in what
   the code actually does.

2. SECTION 2 AND SECTION 3 SCOPE THE ELEMENTS; SECTION 6 SCOPES THE TECHNIQUES. Do not test
   elements outside Section 2/3. Within those elements, apply every applicable technique in
   Section 6. A description that names only a happy path does not put the other techniques out
   of scope for that element. In particular, the previous round's instruction not to test
   "interaction states, transitions, or UI behaviors not explicitly described" still bars new
   ELEMENTS and invented behaviours (hover states, mandatory-field asterisks, tab-order
   requirements not derived from BR17(a), close-on-outside-click calendar behaviour), and
   still bars the invented VALIDATION RULES named in technique 4 — but it no longer bars
   applying a Section 6 technique to a named element.

3. Do not assume hidden functionality or behaviours that cannot be verified from the Payment
   page or its source code.

4. If functionality cannot be verified from the provided context, do not invent scenarios.
   Record a zero-case per Rule 20 instead. In particular:
   (a) BR5 defines the outcome only for EMPTY or INVALID credentials ("WRONG CREDENTIALS!").
       Derive from the source code exactly which condition the code treats as valid vs.
       invalid, and do not invent the outcome of a VALID Pay Now submission (success message,
       navigation, order confirmation, etc.) unless the source code explicitly defines one; if
       it does, that positive case may be included and must be flagged in the "Unmapped but
       in-scope behaviors" note (BR5 governs the wrong-credentials message only).
   (b) The CVV field's placeholder text is not stated in the brief — verify it from the source
       code and use the actual text in test cases; do not assume "CVV".
   (c) Do not invent date-format enforcement rules (e.g. rejecting typed text) for the Date
       field beyond the stated dd-mm-yyyy display and calendar-opens-on-click behaviour,
       unless the source code defines them. Note the interaction with technique 16: the stated
       dd-mm-yyyy display is itself to be TESTED, not assumed, because a native date input
       follows the browser locale.
   (d) Establish each field's actual input `type` from the source before writing any
       Equivalence Class, Boundary, Data Integrity, Compatibility or Accessibility case, since
       every one of those techniques partitions differently for `number` than for `text`.

5. EVERY ENUMERATION IN THIS PROMPT IS A FLOOR, NOT A CEILING. Where an element has more
   distinct cases than a technique's wording names, generate them all.

6. Test each explicitly named element, control, variant, decision-table row, state transition,
   equivalence class, boundary edge and technique as its own test case — do not consolidate,
   even where two cases hit the same underlying code path or produce a similarly-shaped
   result. This applies specifically to:
     (a) each of the three navigation links (BAG, ADDRESS, PAYMENT) — one click-and-verify
         test case per link;
     (b) the Name On Card field's any-character acceptance (per BR3) — its own test case;
     (c) each of the two numeric-only fields (Card Number, CVV) — one accepts-numbers positive
         case per field AND one rejects-non-numeric negative case per field (covering symbols,
         alphabets, and alphanumeric values as distinct inputs within that case's Test Data),
         per BR4;
     (d) the up-arrow increment and the down-arrow decrement as separate test cases, for EACH
         of the two numeric fields (four spinner cases in total), per BR4's explicit
         increment/decrement example;
     (e) the Pay Now click with ALL fields empty, and the Pay Now click with INVALID (filled
         but not valid per the source code's check) credentials, as two separate test cases —
         BR5 names both conditions and each must show the "WRONG CREDENTIALS!" message;
     (f) the Date field's dd-mm-yyyy default display and the calendar-icon click opening the
         calendar as two separate test cases (both flagged Unmapped per the Section 4 note);
     (g) the guest-user direct-URL access flow and the authenticated-user direct-URL access
         flow as two separate test cases (per BR2 naming both user types);
     (h) the authenticated-user full checkout entry route to the Payment page (BR1) as its own
         test case, distinct from the direct-URL cases and from the Cart-page PAYMENT-link
         route;
     (i) each reachable row of each decision table in technique 5;
     (j) each equivalence class in technique 3 and each boundary edge in technique 4;
     (k) each clause of BR17 (a) through (g), per element group where it applies.
   The only consolidation permitted is where two inputs are genuinely identical in kind and
   value space with no distinguishing characteristic named in Section 2/3 (e.g. do not create
   two separate cases both just called "type a name into the Name On Card field"). Where the
   SOURCE collapses a decision table's rows into one outcome, state the collapse and generate
   one case per distinct outcome rather than one per row — that is a source-grounded
   consolidation, not a shortcut.

7. WHERE THE APPLICATION DOES NOT IMPLEMENT SOMETHING A TECHNIQUE PROBES, THAT ABSENCE IS THE
   FINDING. Generate the case that proves it and state in the Expected Result both what
   correct behaviour would be and what the source actually does, instructing the tester to log
   the actual behaviour as a defect. Never describe missing behaviour as though it worked.
   This applies with particular force on this page to: an absent `autocomplete` token, an
   absent field label, an absent `noindex` directive, an unmasked CVV, and a card value found
   in client storage.

================================================================================
INCLUDE, BUT ONLY WHERE THE ABOVE CONSTRAINTS PERMIT
================================================================================

- All nineteen techniques in Section 6, applied per element
- Guest user and authenticated user scenarios
- All four entry routes named in technique 3
- Cross-browser, incognito and cache-clear scenarios per BR7 and technique 15
- Session-timeout and cache-clearing scenarios for the BR7 persistence element
- State-transition scenarios per technique 6
- Multi-step end-to-end journeys per technique 8, at least one terminating in a
  persisted-state assertion
- Up to 2 KEYBOARD-ONLY end-to-end journeys of the form "complete a full named journey using
  the keyboard alone" (e.g. fill all four fields, open and use the date picker, adjust the CVV
  with the arrow keys, and submit with no pointer), since those chain BR17(a) with a
  functional path

================================================================================
DON'T CREATE THIS FOR NOW
================================================================================

- SERVER-SIDE security, API and database cases — this application has no server tier, so keep
  techniques 11, 13 and 18 client-side
- REAL PAYMENT PROCESSING, GATEWAY, OR TRANSACTION-SECURITY TESTING OF ANY KIND. This
  exclusion is unchanged from Round 5 and is NOT relaxed by technique 11. Client-side handling
  of payment data is in scope; the transaction is not.
- PCI-DSS or any other compliance VERDICT. Technique 12 records observable facts; it does not
  certify or fail the application against a standard.
- INVENTED VALIDATION RULES — no card-number digit-count, Luhn/checksum, CVV-length, or
  expiry-date-validity cases unless the source code defines the rule. See technique 4.
- Performance and load-timing scenarios (still excluded, unchanged from the previous round)
- Viewport, responsive-layout and touch-target scenarios
- Address-form scenarios (Name/Mobile/Pin Code/Address/Locality fields, Add Address popup —
  Address page, covered in the prior round)
- Coupon, quantity-control, product-tile, Remove, or Price Details scenarios (Cart page —
  covered in an earlier round)
- Filter, sort, search, pagination, infinite scroll, or "load more" scenarios (not present on
  this page)
- Returning user scenarios (saved cards / pre-filled payment details)
- Re-testing of Sign In / Sign Up field validation (BR6 — out of scope this round)
- Re-testing of the Top Menu, Sign In/Sign Up buttons, Footer, Cart icon, or homepage /
  search-page / Cart-page / Address-page elements not named in Section 2/3 of this round
- Content testing of destination pages — verify only that navigation lands on the stated URL
- Any case for an element not named in Section 2/3

Prioritise business-critical user journeys. Within that, prioritise techniques 11 (Security),
7 (Data Integrity), 5 (Decision Table) and 19 (Accessibility) — on a payment form the first
two carry the highest severity of anywhere in the site, the third systematically finds the
field-combination gaps that single-condition cases miss, and the fourth has more applicable
clauses here than on any other page.

Include cross-feature, multi-step end-to-end journeys that chain more than one Business Rule
in a single flow, simulating realistic user behaviour rather than isolated element checks. Do
not create more than 5 unless the feature context requires more to cover every Business Rule
at least once.

Avoid true duplicates only. Two test cases are duplicates only if they test the exact same
element, the exact same input/option, and the exact same expected outcome — not merely because
they exercise a similar code path. Per Constraint 6, distinct named fields, spinner arrows,
links, credential conditions, entry routes, decision-table rows, state transitions,
equivalence classes, boundary edges and techniques are NOT duplicates.

================================================================================
RULES
================================================================================

8. BUSINESS RULE MAPPING. Each test case maps to exactly one Business Rule, except End-to-End
   journey cases, which may list several. A case may only map to a rule whose stated text
   directly and unambiguously governs the behaviour tested — do not stretch a rule's wording
   to cover a feature it does not explicitly describe. BR6 and BR9 are carried over for
   numbering continuity only and MUST HAVE ZERO TEST CASES MAPPED TO THEM in this round —
   state this explicitly in the summary table with a one-line reason. The Date field's
   format-and-calendar cases (per Constraint 6(f)), and all Usability, Analytics and
   Localisation cases, have no stating rule: flag them in the "Unmapped but in-scope
   behaviors" note rather than force-mapping or silently dropping them, and recommend a future
   BR18 for the Date field — NOT BR10. State explicitly in the summary table any rule with
   zero mapped cases, with a one-line reason.

9. TEST CASE FORMAT. A Markdown table with these ten columns, in this exact order:

   TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule

   - TC ID: sequential, zero-padded, register-wide — "TC-001", "TC-002" ... in the order the
     sections appear under Rule 12. Do not restart numbering per section and do not use
     per-module prefixes (no "PAY-01", "CRD-02"). If this round's register REPLACES the
     Round 5 payment register, restart at TC-001 and state so. If instead it is APPENDED to
     the prior Address page register (which ended at TC-175), continue from TC-176 rather
     than restarting. EITHER WAY, STATE THE STARTING NUMBER ASSUMED AND WHICH OF THE TWO
     MODES WAS CHOSEN, and comply with Rule 24.
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
   - Precondition: required user type, account type, and the exact application state before
     step 1 — including WHICH ENTRY ROUTE was used to reach the Payment page, whether the user
     is logged in, which fields are already filled and with what, the ACTUAL CONTENTS of the
     relevant storage keys (not merely whether they exist), the starting page and browser, and
     — where the case involves more than one tab or browser — which is which.
   - Test Data: the concrete literal values used, each on its own line, so the case can be
     executed without guessing. Never placeholders like "<a card number>" or "<valid date>".
     Use obviously non-real test card values such as "4111111111111111". Show card numbers,
     names, dates, CVV values, symbol/alphabet/alphanumeric rejection inputs, script payloads,
     expected URLs, and the exact expected message text "WRONG CREDENTIALS!" exactly as typed,
     including whitespace.
   - Steps: 3-8 numbered, executable actions a tester with no prior feature knowledge could
     follow exactly as written, naming where to verify every non-visual outcome — the DevTools
     pane, the storage key, the console, the URL bar, the element's attribute (e.g. "Open
     DevTools > Application > Local Storage and diff every key against the snapshot taken in
     step 2", "Inspect the CVV input's `type` and `autocomplete` attributes in DevTools >
     Elements").
   - Expected Result: one or more numbered, objectively verifiable checkpoints. Where the
     application is expected to fail the check, state what correct behaviour would be, then
     what the source actually does, then instruct the tester to record it as a defect.
   - Priority: High / Medium / Low by business-critical impact. The numeric-only validation,
     the Pay Now credential validation, the BR1/BR2 entry routes, and all Security and Data
     Integrity cases are High; static link-target, placeholder-text, calendar-display, SEO
     metadata, logo and cosmetic checks are typically Low/Medium.
   - Business Rule: per Rule 8.

   WORKED EXAMPLE (follow this level of concreteness for every test case):

   | TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule |
   |---|---|---|---|---|---|---|---|---|---|
   | TC-001 | Client-Side Security | Security | Verify no payment field value is written to client storage by a Pay Now click, since a card number or CVV persisted in localStorage is readable by any script on the origin | Guest user; reached `payment.html` by direct URL per BR2; all four fields empty; DevTools > Application > Local Storage open with every key and value recorded; Chrome | Card Number: "4111111111111111"<br>Name On Card: "Test User"<br>Date: "12-12-2027"<br>CVV: "356" | 1. Open DevTools > Application > Local Storage and record every key and its full value as a baseline<br>2. Fill Card Number, Name On Card, Date and CVV with the Test Data values<br>3. Click Pay Now and observe the on-screen result<br>4. Re-inspect Local Storage, Session Storage and Cookies, and diff every key against the step 1 baseline<br>5. Open DevTools > Console and inspect it for any logged field value<br>6. Inspect each field's `value` attribute in DevTools > Elements | 1. Correct behaviour: no key in Local Storage, Session Storage or Cookies contains the card number, the CVV, or any substring of either, before or after the click<br>2. No field value appears in the Console<br>3. Record the actual diff from step 4 — if any key holds the card number or the CVV, log it as a High-severity defect quoting the key name and the stored value shape<br>4. Record whether the CVV is retained in the DOM after the click | High | BR12 |

10. TEST CASE STANDARDS. Preconditions must state the entry route used, the user type, the
    active field state, exact storage contents and the starting browser. Test Data must be
    directly executable and use obviously non-real card values. Steps must name the
    verification location for every non-visual outcome. Expected Results must be specific,
    observable and objectively verifiable, expressed as one outcome or as a numbered list of
    SIMULTANEOUSLY-REQUIRED checkpoints — never using the list to smuggle in unrelated or
    optional outcomes; every listed checkpoint must be a mandatory pass/fail condition of the
    same scenario. Every case must be unique per Constraint 6.

11. FOR DECISION TABLE CASES SPECIFICALLY: before the cases, include the decision table itself
    — conditions as rows, combinations as columns, the resulting action per column, and a
    marker on any combination the code makes unreachable or collapses into another. Then
    generate one case per reachable, distinct-outcome column. State the source's evaluation
    order, since it determines whether the credential check is per-field or all-or-nothing and
    therefore how many of the sixteen field-fill combinations are genuinely distinct.

12. GROUP TEST CASES UNDER THESE SECTIONS, in this exact order, using this exact naming:

        Navigation Links (BAG / ADDRESS / PAYMENT)
        Logo
        Card Details (Card Number & Name On Card)
        Date Field & Calendar
        CVV Field
        Numeric Field Spinner Controls (Up/Down Arrows)
        Pay Now & Credential Validation
        Persistence Checks (Logo on Payment Page)
        Guest User Flows
        Authenticated User Flows
        Equivalence Classes
        Boundary — Numeric Field Spinner Limits
        Boundary — Date Field Limits
        Boundary — Credential Validation Condition
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
        Interface Contract (Checkout Client Storage Schema)
        Accessibility — Keyboard Navigation & Focus
        Accessibility — Forms & Labels
        Accessibility — Input Purpose & Autocomplete
        Accessibility — Error Identification & Status Announcement
        Accessibility — Images & Alt Text
        Accessibility — Contrast
        Accessibility — Page Title & Structure
        Cross-Feature End-to-End Journeys
        Keyboard End-to-End Journeys

    Note: "Persistence Checks" remains its own section (distinct from Guest/Authenticated User
    Flows) because it is the only place BR7 is exercised in this round, and it must not be
    folded into the element-specific sections above it. "Guest User Flows" and "Authenticated
    User Flows" contain only cross-cutting session-level checks that are not already a single
    element's dedicated test (e.g. "guest reaches the Payment page directly by URL and can
    click Pay Now" belongs in Guest User Flows; "Card Number field rejects alphabets" belongs
    in Card Details).

    A SECTION WITH NOTHING SOURCE-GROUNDED TO TEST STILL APPEARS IN THE SUMMARY TABLE WITH A
    COUNT OF 0 AND A ONE-LINE REASON. Do not delete the section and do not invent a case to
    fill it.

13. Do not invent fields, buttons, pages, workflows, or Business Rules beyond BR1-BR17 above.

14. ALL NINETEEN TECHNIQUES IN SECTION 6 ARE IN SCOPE IN THIS ROUND, including Client-Side
    Security, Boundary Value and Accessibility. This supersedes the previous round's Rule 11,
    which excluded security and accessibility, and the previous round's "Don't create"
    exclusion of boundary scenarios and accessibility scenarios. STILL EXCLUDED: server-side
    security, API, database, performance, real payment processing, gateway and
    transaction-security cases, and invented validation rules.

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
    absent or unreachable. A zero count must read as evidence grounded in the source, not as
    an omission. This is what keeps the seventeen new sections honest rather than padded. At
    minimum, state the grep result for:
      - `gtag`, `dataLayer`, `analytics`, `fetch`, `sendBeacon`, `XMLHttpRequest` (technique 13);
      - `Intl`, `toLocaleString`, `i18n`, `locale`, `lang=` (technique 16);
      - `min`, `max`, `step`, `maxlength`, `pattern` on all four inputs, and any numeric
        comparison in the payment JS (technique 4) — this grep result is what licenses or
        forbids every boundary case in the register, so report it in full;
      - `type=` on all four inputs, and `autocomplete` (techniques 3, 11, 15, 19);
      - `aria-`, `<label`, `alt=`, `role=` (technique 19);
      - `cookie`, `consent` (technique 12);
      - `localStorage`, `sessionStorage` in the Pay Now handler (techniques 7, 11);
      - the credential comparison in the Pay Now handler, quoted verbatim (technique 4, BR5).

21. BEFORE THE TEST CASE TABLE, INCLUDE:
    (a) a CRITICAL FINDINGS section — numbered, recording every fact established by reading
        the source that a tester needs first, each with a file and, where possible, line
        reference, and DISTINGUISHING COMPLIANT FINDINGS FROM DEFECTS. At minimum: the exact
        input `type` and every attribute of each of the four fields; the exact placeholder text
        of the CVV field; the exact condition the Pay Now handler uses to classify credentials
        as valid versus invalid, quoted verbatim, and whether any expected value is hardcoded;
        what the Pay Now handler does on the valid branch, if one exists; whether the handler
        writes to or reads from client storage, naming every key, its casing and its value
        shape, and which other pages read it; whether any payment field value reaches storage,
        the console, or a surviving DOM attribute; which storage keys this page READS and what
        it renders when they are absent, which is the BR2 direct-URL state; whether the
        "WRONG CREDENTIALS!" message is an `alert()` or a DOM insertion, and whether it is
        associated with any field or live region; this page's `<title>`, heading structure and
        robots directive; whether the three navigation links and the Logo are real anchors with
        the stated targets; whether the Date field carries any `min`/`max` and what format it
        actually renders in the test browser's locale; and whether any tracking, locale or
        consent code exists;
    (b) the DECISION TABLES required by Rule 11;
    (c) a summary table of case count per Rule 12 section, including every 0-count section with
        its reason;
    (d) a summary table of case count per Business Rule BR1-BR17, EXPLICITLY SHOWING 0 FOR BR6
        AND BR9 with a one-line note explaining why, plus an "Unmapped" row covering the Date
        field, Usability, Analytics and Localisation cases, plus a total-occurrences row;
    (e) a summary table of case count per Section 6 technique, showing all nineteen with 0
        where applicable — this is the primary coverage artefact for this round;
    (f) an ELEMENT x TECHNIQUE MATRIX — Section 2/3 elements as rows (each of the three
        navigation links, the Logo, the Card Number field, the Name On Card field, the Date
        field and calendar icon, the CVV field, each numeric field's spinner arrows, the Pay
        Now button), the nineteen techniques as columns — holding the covering TC IDs, a
        zero-case marker, or a dash where the technique does not apply to that element.

22. REPRODUCIBILITY CHECK. After generating the register, verify that every case traces to a
    named element in Section 2/3 and a technique in Section 6, that every decision-table case
    traces to a row of a stated table, that every boundary case traces to a limit named in the
    Rule 20 grep results, that every expected-to-fail case states both the requirement and the
    observed behaviour, and that no section was padded with a case not grounded in the source.
    Confirm a second independent run of this prompt against the same context would reproduce
    the same cases, the same zero-cases and the same defects. Remove any case that fails this
    check.

23. PRE-OUTPUT COVERAGE SELF-AUDIT. Before finalising, build the element x technique matrix
    from Rule 21(f) and confirm every applicable cell holds either a TC ID or a zero-case
    marker. Build a checklist of every element and behaviour explicitly named in Section 2 and
    Section 3 — including each of the three navigation links and its stated target URL, the
    Logo's home-page navigation, the Card Number field's exact stated placeholder "Card Number"
    and its numeric-only restriction per BR4, the Name On Card field's exact stated placeholder
    "Name On Card" and its any-character acceptance per BR3, the Date field's dd-mm-yyyy
    display and its calendar-icon-opens-calendar behaviour, the CVV field's numeric-only
    restriction per BR4 with its actual placeholder verified from source, the up-arrow and
    down-arrow behaviour on both numeric fields per BR4, the Pay Now button's "WRONG
    CREDENTIALS!" message for both the empty and the invalid credential conditions per BR5,
    both BR2 entry-by-URL user types, the Cart-page PAYMENT-link route, the BR1 full checkout
    entry route, every BR7 persistence claim as it applies to this page, and every clause of
    BR17 (a) through (g) — and confirm each checklist item has at least one corresponding test
    case. Where a cell or a checklist item is empty, add the missing case or the missing
    zero-case statement BEFORE OUTPUT rather than presenting an incomplete register. Do not
    silently omit a named element or a technique for the sake of brevity.

24. SUPERSESSION CHECK — DO NOT LOSE COVERAGE THE PREVIOUS ROUND HAD. This prompt supersedes
    the Round 5 payment register and any separate boundary or accessibility round for this
    page. Supersession is a replacement, not an amnesty: anything the Round 5 register asserted
    that this register does not reproduce becomes genuinely untested, because there is no
    combined register to fall back on.

    Before output, read the Round 5 payment register alongside this one and confirm that every
    behaviour it asserted is asserted somewhere here — under whatever new technique, section or
    TC ID. Pay particular attention to the eight Constraint 6 items (a) through (h), which
    Round 5 enumerated explicitly and which are easy to lose when a register is reorganised by
    technique rather than by element. Where a Round 5 assertion is deliberately dropped, state
    it and the reason in a short "Coverage carried forward from Round 5" note; where it was
    dropped by accident, add it back.

    This rule exists because a measured comparison of the Search Results v1 and v2 registers
    found that the technique-expanded rewrite, despite growing from 75 to 128 cases, silently
    lost four behaviours the smaller register had covered — including same-facet multi-value
    selection, which the v2 findings narrative described but no test case exercised. A
    behaviour named only in a findings narrative is NOT covered. Every finding that implies a
    testable behaviour must have a test case behind it, or an explicit zero-case statement
    saying why it does not.

================================================================================
END OF PROMPT
================================================================================
