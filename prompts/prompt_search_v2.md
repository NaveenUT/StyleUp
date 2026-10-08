================================================================================
SEARCH RESULTS PAGE — FUNCTIONAL TEST CASE GENERATION PROMPT (v2)
================================================================================

WHAT CHANGED FROM THE PREVIOUS SEARCH ROUND (Prompt_2_Search_result_page.md)

The previous search round generated only Positive and Negative cases. This version brings
the Search Results page up to the same standard as prompt_1_v5 (Homepage / Sign In / Sign
Up): seventeen additional techniques are now in scope — Equivalence Class, Boundary Value,
Decision Table, State Transition, Data Integrity, End-to-End, Concurrency, Recovery,
Security, Compliance, Analytics, Usability, Compatibility, Localisation, SEO, Interface
Contract and Accessibility.

Adding them required five edits, not just an addition:

  1. The "Scenario type" column now holds a technique from a defined list (Section 6)
     rather than "positive or negative".
  2. The previous round's Rule 11 ban on security, accessibility and performance testing is
     partially lifted: security and accessibility are now IN scope; performance stays out.
  3. The previous round's "Don't create — Boundary scenarios" exclusion is lifted, but only
     for limits that are explicitly stated or source-verifiable (see technique 4).
  4. Rule 12's "functional UI test cases only" is widened to admit client-side security,
     storage-contract and accessibility checks.
  5. BR9-BR16 are added, because eight of the new techniques had no Business Rule to map to.
     NOTE THE NUMBERING: this page's register already uses BR1-BR8, where BR8 governs
     cross-links and static text. The new rules therefore start at BR9 and do NOT match
     prompt_1_v5's BR8-BR15 numbering. When cross-referencing the two registers, map by
     rule TEXT, not by rule number.

Because Accessibility and Boundary are now in scope here, this prompt supersedes any
separate boundary or accessibility round for the Search Results page. Run one or the other,
not both, or the two registers will duplicate each other.

--------------------------------------------------------------------------------

Role: Act as a QA Test Architect in functional test design for healthcare, medical, and
e-commerce websites. Analyse the source code and local host website from a QA perspective
and generate comprehensive, high-quality test cases based only on the provided context.

Task: Analyse the source code and the locally accessible Search Results page (reached after
a valid product search from the homepage, e.g. `http://localhost:5501/search.html?q=Shoes` —
adjust the actual URL/query parameter to match the real app) and generate test cases for
that page only, across ALL NINETEEN TECHNIQUES NAMED IN SECTION 6 — the original Positive
and Negative paths plus the seventeen added types.

Website:
http://localhost:5501/search.html  (or equivalent Search Results route — confirm the exact
URL and parameter name from the running app before execution)

================================================================================
FEATURE CONTEXT
================================================================================

1. PAGE URL & ENVIRONMENT

   URL: Search Results page reached via a valid, complete search term entered on the
        homepage search bar (e.g. searching "Shoes" from `http://localhost:5501/index.html`)
   Environment: local  |  Domain: no domain specific
   Persistence: browser `localStorage` only. Read the actual key names and their exact
        casing from the source before writing any case that depends on them. The search term
        itself may travel by URL query parameter, by storage key, or both — confirm which
        from the source before writing any case that depends on it.

2. PAGE SECTIONS VISIBLE ON THE SEARCH RESULTS PAGE

   Search Results page:

     - Breadcrumb (Home / Search Store) — shows navigation path; "Home" segment navigates
       back to the homepage; "Search Store" segment identifies current location and does not
       navigate elsewhere.

     - Total Items count — a numeric count of matching products displayed on the page, must
       match the actual number of product tiles rendered.

     - Filter section — checkboxes grouped under:
           GENDER (e.g. Men, Women, Kids/Boys, Girls — as available in the app)
           CATEGORIES (as available in the app, e.g. Shoes, Bags, etc.)
           Discount (discount-range checkboxes as available in the app)
       Selecting/deselecting a checkbox re-filters the product list to match the selected
       criteria; multiple checkboxes within and across groups can be combined.

     - Sort by Price dropdown — options: "Low to High" (products re-order by ascending
       price) and "High to Low" (products re-order by descending price).

     - Sort by Name dropdown — options: "Ascending" (A->Z by product name) and "Descending"
       (Z->A by product name).

     - Sort by Brand dropdown — options: "All Brands" plus each individual brand name as
       listed in the app (e.g. Nike, Reebok, etc.); selecting a brand filters the list to
       that brand only, "All Brands" shows every brand.

     - Product listing — grid/list of product tiles matching the current search term and any
       active filter/sort selections; each tile shows enough info to identify the product
       (name, price, image, etc. as rendered by the app).

     - Add to Cart button — present on every product tile; clicking it adds that product to
       the cart.

3. KEY INTERACTIVE ELEMENTS

   Breadcrumb "Home" link — navigates back to homepage (but in the website it is just text)
   Breadcrumb "Search Store" label — static, identifies current page, does not navigate
   Total Items count — numeric, reflects the number of rendered product tiles at all times
     (initial load, after filtering, after sorting)
   Filter checkboxes (GENDER, CATEGORIES, Discount) — each checkbox re-filters the product
     list when checked/unchecked; combinable across and within groups
   Sort by Price dropdown — "Low to High", "High to Low"
   Sort by Name dropdown — "Ascending", "Descending"
   Sort by Brand dropdown — "All Brands", and each named brand
   Product tiles — rendered per the current search term + active filters/sort
   Add to Cart button (per product tile) — adds that specific product to the cart

   Also in scope for this round, but ONLY as named in BR7 (persistence) — the Logo, the
   Cart/Basket icon, and the Footer AS THEY APPEAR ON THIS PAGE. Do not re-test the Top
   Menu, Sign In/Sign Up buttons, or any other homepage element.

   THIS LIST NAMES THE ELEMENTS IN SCOPE. SECTION 6 NAMES THE TECHNIQUES EACH MUST BE
   TESTED WITH.

4. BUSINESS RULES

   BR1 — A guest (unauthorised) user or an authenticated user can both perform a product
         search and land on the Search Results page; reaching this page does not itself
         require login.

   BR2 — When a filter checkbox (GENDER, CATEGORIES, or Discount) is checked or unchecked,
         the product listing must re-arrange/re-filter to show only products matching the
         currently selected checkbox criteria; unchecking must remove that criterion's
         effect.

   BR3 — The Basket/Cart icon shows 0 when the cart is empty and increases by 1 each time
         "Add to Cart" is clicked on a product (tested across multiple sequential additions,
         not just a single add). This action is available to both guest and authenticated
         users; however, only an authenticated user can see the Cart icon reflecting the
         count — a guest user does not see a Cart icon at all, even after adding items.

   BR4 — Search only accepts a valid, complete product/category name; a half (partial) name
         or an empty submission must NOT return results. This BR governs the search-input
         behaviour on the homepage (validated in the prior round); within THIS round it
         applies only to the resulting "zero matching products" empty state that the Search
         Results page must display when a technically well-formed but non-matching term is
         searched.

   BR5 — (Carried over from the homepage round — governs Sign-In field validation.) Not
         applicable in this round: the Search Results page contains no Sign In fields or
         actions. No test case in this register maps to BR5.

   BR6 — (Carried over from the homepage round — governs Sign-Up field validation.) Not
         applicable in this round: the Search Results page contains no Sign Up fields or
         actions. No test case in this register maps to BR6.

   BR7 — Any element whose Section 2/3 description states it is displayed "on all pages,"
         "after login," "after logout," or otherwise persists across a page or session
         transition must render identically and correctly in every state named. Within THIS
         round this covers only the Logo, Cart/Basket icon, and Footer as they appear
         specifically on the Search Results page (confirming the persistence property
         already established for the homepage still holds here) — it does NOT extend to
         re-testing the Top Menu, Sign In/Sign Up buttons, or any other homepage element not
         named in Section 2/3 of this round. This rule also governs cross-browser and
         incognito consistency for those elements.

   BR8 — All named cross-links and static/promotional text (Footer's 4 navigating links and
         3 promotional lines, and the Breadcrumb's "Home" link) must be present and
         correctly targeted on the Search Results page.

   NEW IN v2 — added because eight of the seventeen new techniques had no rule to map to.
   These continue this page's own numbering from BR8; they are NOT the same numbers as
   prompt_1_v5's equivalent rules.

   BR9  — DATA INTEGRITY. Anything the application persists or derives must be readable back
          unchanged: every stored field exactly as written, no truncation, no type coercion,
          no silent reordering or loss. Every derived value on this page — the Total Items
          count, the cart count, any subtotal — must remain arithmetically consistent with
          the data it derives from, after every filter, sort, add and remove operation. A
          sort must re-order the same set of tiles, never lose one and never duplicate one.

   BR10 — STATE MACHINE AND CONCURRENT ACCESS. The application must move only through valid
          state transitions (filter unapplied -> applied -> unapplied; sort default ->
          applied -> re-applied with a different option; cart 0 -> n -> 0; guest ->
          authenticated while remaining on or returning to this page), must reach the correct
          state on re-entry, and must behave predictably when two actors — two tabs, two
          browsers, or one rapid double-click on Add to Cart — act on the same stored state.

   BR11 — CLIENT-SIDE SECURITY. User-supplied input must not execute when rendered back —
          this specifically includes the search term, which arrives from outside the page
          and may be echoed into the results heading or breadcrumb. A client-side filter or
          gate must not be bypassable by editing the URL parameter directly. Stored cart
          data must not be trivially forgeable from the client. Failure paths must not leak
          a stack trace, path or version.

   BR12 — RECOVERY AND GRACEFUL DEGRADATION. After a failed action, a blocked resource, a
          storage failure, a refresh, or a browser-back, the application must return to a
          usable, correctly-stated state rather than a broken or misleading one. This
          includes what happens to active filters and sort selections on refresh and on
          browser-back, and what the page does when it is opened with no search term, an
          empty search term, or a malformed query parameter.

   BR13 — INTERFACE CONTRACT. Every page that reads a stored key or a URL parameter must
          agree with every page that writes it — same key or parameter name, same casing,
          same value shape. The homepage writes the search term and this page reads it; this
          page writes cart entries and the cart page reads them. A malformed or
          externally-modified value must be handled rather than crashing the page.

   BR14 — COMPLIANCE. Where the application states a policy or presents a policy document,
          observed behaviour must match it; where consent is required before storing data,
          it must be obtained. On this page the surface is the Footer's policy links and the
          fact that an Add to Cart click writes to client storage.

   BR15 — DISCOVERABILITY AND SEO. This page must carry a descriptive, distinct title and
          the metadata and crawlable link structure needed for it to be indexed as intended.
          A search results page is a conventional candidate for a robots directive — test
          what directive is actually present, not what ought to be. Product tiles must be
          checked for whether they are real crawlable `<a href>` elements or script-driven
          `<div>`s.

   BR16 — ACCESSIBILITY (WCAG 2.1 Level AA), scoped to the elements named in Section 2/3:
          (a) KEYBOARD OPERABILITY: every filter checkbox, every sort dropdown and every
              Add to Cart button must be reachable with Tab in a logical order, show a
              visible focus indicator, and be operable with Enter/Space/arrow keys as
              appropriate. A complete filter -> sort -> add-to-cart journey must be
              completable with the keyboard alone. Focus must not be lost or reset to the
              top of the document when the listing re-renders after a filter or sort.
              (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7)
          (b) LABELS AND NAMES: each filter checkbox must have a programmatically associated
              label; each sort dropdown must have an accessible name, not merely adjacent
              text; and every Add to Cart button must have an accessible name that
              distinguishes WHICH product it adds — a listing of N buttons all named only
              "Add to Cart" is a defect, since a screen-reader user navigating by button
              cannot tell them apart. (WCAG 1.3.1, 3.3.2, 4.1.2)
          (c) IMAGES: every product tile image and the Logo must have a non-empty,
              meaningful alt attribute. (WCAG 1.1.1)
          (d) CONTRAST: visible text of the Breadcrumb, Total Items count, filter labels,
              sort dropdowns, product name and price, Add to Cart button, and Footer links
              and promotional lines must meet at least 4.5:1 against its background (3:1 for
              large-scale text). (WCAG 1.4.3)
          (e) STATUS AND CHANGE ANNOUNCEMENT: when a filter or sort changes the listing, the
              new Total Items count must be conveyed to assistive technology — a silent
              re-render leaves a screen-reader user unaware the result set changed. Test for
              a live region or equivalent. Where none exists, that absence is the finding.
              (WCAG 4.1.3, 3.3.1)
          (f) PAGE TITLE AND STRUCTURE: the page must have a descriptive, distinct `<title>`
              and a usable heading hierarchy including an `<h1>`. (WCAG 2.4.2, 1.3.1)

   Usability, Analytics and Localisation cases have NO STATING BUSINESS RULE and must be
   flagged in the "Unmapped but in-scope behaviors" note per Rule 8, not force-mapped.

5. USER TYPES

   - Guest user (not logged in) — can search, reach the Search Results page, view products,
     use filters/sort, and click Add to Cart, but cannot see a Cart icon or proceed to
     checkout.
   - Authenticated user (logged in) — can do everything a guest can, plus sees the Cart icon
     reflecting item count and can proceed toward checkout.
   - A SECOND, SEPARATE ACCOUNT is required for the BR10 shared-browser cases.
   - Account type: not specific.
   - Browsers: Chrome, Edge, Firefox, Safari, and one private/incognito window.
   - Tooling: DevTools Application > Local Storage for BR9/BR10/BR13 cases; DevTools Network
     for blocked-resource and Analytics cases; DevTools Console for leakage cases; DevTools
     Elements for SEO and Accessibility cases; a screen reader (NVDA or VoiceOver) for the
     BR16(b)/(e) cases; a contrast checker for BR16(d); two tabs and two browsers for
     concurrency cases.

6. TEST CASE TECHNIQUES — ALL NINETEEN ARE IN SCOPE

   Every element in Section 2/3 must be tested with every technique below that applies to
   it. Where a technique does not apply to an element, or the application does not implement
   the thing the technique probes, RECORD A ZERO-CASE PER RULE 20 — do not invent filler to
   populate a section.

   READ THIS BEFORE GENERATING. On an application of this size several of these techniques
   will legitimately produce very few cases, or none. Analytics and parts of Compliance are
   the likely zero sections, because a local client-only demo has no tracking layer and no
   consent layer. Localisation, by contrast, is expected to be PRODUCTIVE on this page and
   not a zero section, because unlike the homepage this page renders prices — so currency
   symbol, thousands separator and decimal handling are all observable here. A zero grounded
   in a named grep is a correct and valuable result. A fabricated case to fill a section is
   not.

   (1) POSITIVE — the element performing its stated function with valid input in the stated
       state. Per Constraint 5, each named filter checkbox, each sort option and each brand
       gets its own positive case.

   (2) NEGATIVE — invalid, missing or malformed input or state. On this page the negative
       surface is: the zero-matching-results empty state (BR4); a filter combination that
       legitimately matches no product; a filter applied when the result set is already
       empty; and the page reached with a missing or malformed search parameter. One case
       per distinct invalid class, even where two classes produce the same rendered result.

   (3) EQUIVALENCE CLASS — partition each input's value space into classes the code treats
       identically, then test one representative per class and state the partitions
       explicitly. Derive the classes from the source's actual branching in the filter and
       sort functions, not from intuition. The partitionable value spaces on this page are:
       the Discount ranges (each range is a class, plus the below-lowest-range class and any
       product with no discount at all); the Brand dropdown ("All Brands" versus a named
       brand versus a brand with zero matching products in the current result set); and the
       product set itself as partitioned by each GENDER and CATEGORIES checkbox. Enumerate
       every valid class as well as every invalid one — a partition with no representative
       is an untested class.

   (4) BOUNDARY VALUE — apply boundary-value analysis ONLY where a limit is explicitly
       stated in Section 2/4 or is verifiable in the source (a numeric comparison in the
       filter JS, a discount threshold, a sort comparator). DO NOT INVENT LIMITS. The
       source-verifiable boundaries on this page are expected to be:
         - each Discount range's lower and upper edge — a product exactly at the threshold,
           one just below, one just above, since an inclusive/exclusive comparison error here
           is invisible in a happy-path test;
         - the Total Items count at 0, at 1, and at n, since a count label is a common place
           for singular/plural and zero-state errors;
         - the price sort comparator given two products of IDENTICAL price — a stable-sort
           question, and the edge where ascending and descending must both still contain
           every tile;
         - the name sort comparator given names differing only by case, by leading
           whitespace, or by a leading digit or symbol, since a naive comparator orders
           these unexpectedly.
       For each such limit generate cases at the limit, one step below, and one step above,
       where each side is meaningful. Where an element has no source-verifiable limit,
       generate zero boundary cases for it and say so per Rule 20.

   (5) DECISION TABLE — where two or more conditions combine to determine which outcome
       fires. Build the truth table from the source's ACTUAL EVALUATION ORDER, then generate
       one case per reachable combination and mark the unreachable ones. The decision points
       on this page are:
         (a) FILTER x SORT — is a filter active? x is a sort active? -> which product set in
             which order is rendered. Establish from the source whether applying a sort
             preserves the active filter and whether applying a filter preserves the active
             sort; a register that tests each in isolation will miss the combination where
             one silently clears the other.
         (b) MULTI-GROUP FILTER — GENDER checked? x CATEGORIES checked? x Discount checked?
             -> is the result an intersection (AND) or a union (OR)? State which the source
             actually implements, then generate one case per reachable combination, including
             the combination that yields zero products.
         (c) BRAND x FILTER — brand dropdown set to a named brand? x a CATEGORIES checkbox
             checked? -> does the brand selection narrow within the filtered set, or replace
             it?
         (d) ADD TO CART x USER TYPE — user authenticated? x cart non-empty? -> is a Cart
             icon rendered, and does it show a count? This is the table BR3 describes, and
             its guest row is the one most likely to be wrong.

   (6) STATE TRANSITION — the application's state machine. Derive the states from the actual
       persisted keys and the actual DOM state, then test each valid transition, each
       attempted invalid transition, and re-entry into a state already occupied. The
       machines here are: filter unapplied -> applied -> unapplied (does unchecking fully
       restore the original set, or leave a residue?); sort default -> option A -> option B
       -> back to default (is there a default option to return to?); cart count 0 -> n -> 0;
       and guest -> authenticated, entered from this page, with the question of whether the
       page state and cart survive the transition.

   (7) DATA INTEGRITY — whether what was written is what is read back, and whether derived
       values stay consistent. Inspect storage, do not trust the UI. Test that the Total
       Items count equals the actual rendered tile count after initial load, after each
       filter, and after each sort; that a sort re-orders the same set with no tile lost or
       duplicated (compare the multiset of product names before and after); that a cart
       entry written from this page holds every field exactly as rendered on the tile — name,
       price, identifier — with no truncation or type coercion; and that the cart count
       stays arithmetically equal to the number of stored cart entries across repeated adds.

   (8) END-TO-END — multi-step journeys chaining more than one Business Rule in a realistic
       flow. At least one journey must terminate in a PERSISTED-STATE ASSERTION — inspect the
       cart storage key and confirm its contents — not merely a navigation, so the journey
       proves the data landed and not just that the page changed. The canonical journey for
       this page is: guest searches, applies a filter, sorts by price, adds an item, then
       signs in and confirms the cart persisted and the icon now appears.

   (9) CONCURRENCY — two actors on the same stored state. There is no server tier, so the
       concurrency surface is client-side: two browser tabs both on the Search Results page
       with the same product added from each; the same account in two different browsers;
       and a rapid double-click on a single Add to Cart button. Test whether the second
       actor sees stale state, and whether a double-click produces a double write.

   (10) RECOVERY — returning to a usable state after a failure or an interruption. Test:
        whether active filters and the active sort survive a page refresh; whether they
        survive a browser-back from a product or cart page; what the page renders when
        opened with the search parameter removed entirely, set to an empty value, or set to a
        malformed value; what happens on an Add to Cart click with client storage disabled;
        and whether a blocked image or script leaves the listing usable or broken.

   (11) SECURITY — client-side only, per BR11. Test: a script payload placed in the search
        term (both via the homepage search bar and by editing the URL parameter directly) and
        whether it is ever rendered back into the breadcrumb, a results heading, or a
        "no results for X" message without escaping; whether the filter or sort state can be
        forced to an out-of-range value by URL or DOM edit; whether a hand-edited cart entry
        in storage is accepted without validation; and whether any failure path leaks a stack
        trace, path or version to the console.

   (12) COMPLIANCE — stated policy versus observed behaviour, per BR14. Test whether the
        Footer's Privacy Policy and Terms of use items resolve to real documents FROM THIS
        PAGE, and whether the application obtains any consent before an Add to Cart click
        writes to client storage. Where no consent mechanism exists, that absence is the
        finding.

   (13) ANALYTICS — whether any event or tracking call fires on the key actions of this page:
        page load with a search term, filter apply, sort apply, and Add to Cart. Grep the
        source for `gtag`, `dataLayer`, `analytics`, `fetch`, `sendBeacon` and
        `XMLHttpRequest`. Report the grep result explicitly: if no tracking layer exists,
        record a zero-case naming exactly what was searched for, and do not invent events.
        Note that a search results page is the single most conventional place for a search
        event to fire, so its absence is worth recording specifically rather than generically.

   (14) USABILITY — friction and clarity, expressed OBJECTIVELY. Each case must have a
        verifiable pass condition, not an opinion. Testable here: whether the zero-results
        state tells the user what to do next or merely that nothing was found; whether an
        active filter is visibly indicated as active and whether there is any way to clear
        all filters in one action; whether the Total Items count label is correct for a count
        of exactly 1; the number of interactions needed to filter, sort and add one product
        against the minimum the UI allows; and whether the currently selected sort option
        remains visibly selected after the listing re-renders.

   (15) COMPATIBILITY — the 4 named browsers plus incognito. This now covers two tiers: the
        BR7 persistence elements (Logo, Cart icon, Footer) as in the previous round, AND —
        new in v2 — the filter, sort and Add to Cart interaction paths in each browser, plus
        any browser-native behaviour the application depends on: native `<select>` dropdown
        rendering, native checkbox rendering, `alert()` dialogs, and localStorage
        availability in a private window.

   (16) LOCALISATION — locale-dependent presentation. Grep for `Intl`, `toLocaleString`,
        `lang=`, and any locale or i18n module. THIS PAGE IS THE PRODUCTIVE ONE FOR THIS
        TECHNIQUE because it renders prices: test the currency symbol and its position, the
        thousands separator, decimal places, whether the price sort operates on a number or
        on the formatted string (a string sort of "1,000" versus "999" is a classic defect),
        text direction, and whether user-visible strings are hardcoded to one language. Where
        no locale layer exists, record a zero-case — but report the hardcoded-string and
        hardcoded-currency findings as the substance of that section.

   (17) SEO — per BR15. Test this page's `<title>` for presence, descriptiveness and
        distinctness from the homepage and every other page; the presence of a meta
        description, canonical and robots directive, and what the robots directive actually
        says for a search results URL; whether the same search reached by two different
        parameter orderings or casings produces duplicate indexable URLs; the heading
        hierarchy including whether an `<h1>` exists; and whether product tiles are real
        crawlable `<a href>` elements or script-driven `<div>`s.

   (18) INTERFACE CONTRACT — the contract between components. There is no server API, so the
        contract has two parts here: (a) the URL/storage handoff by which the homepage passes
        the search term to this page — confirm the parameter or key name and casing agree on
        both sides, and that this page handles the value being absent, empty or malformed;
        and (b) the client storage schema — a cart entry written by this page must be read
        correctly by the cart page, with the same key name, casing and value shape, and a
        hand-edited or malformed value must be handled rather than crashing the page.

   (19) ACCESSIBILITY — WCAG 2.1 Level AA, per BR16. Each clause is tested per element group
        where it applies, and the label clause is tested per named control. Where the source
        shows an unlabelled checkbox, a dropdown without an accessible name, N identically
        named Add to Cart buttons, a missing `alt`, or a silent re-render with no status
        announcement, the Expected Result is the BR16 requirement and the current state is
        recorded as a defect — not the pass condition.

================================================================================
CONSTRAINTS
================================================================================

1. Analyse the source code and the locally accessible Search Results page only (the page
   reached after a valid search term is submitted from the homepage). Do not re-generate
   test cases for the homepage, Sign In page, or Sign Up page — those were covered in the
   prior round. Every case must be grounded in what the code actually does.

2. SECTION 2 AND SECTION 3 SCOPE THE ELEMENTS; SECTION 6 SCOPES THE TECHNIQUES. Do not test
   elements outside Section 2/3. Within those elements, apply every applicable technique in
   Section 6. A description that names only a happy path does not put the other techniques
   out of scope for that element. In particular, the previous round's instruction not to test
   "interaction states, transitions, or UI behaviors not explicitly described" still bars new
   ELEMENTS and invented behaviours (hover states, pagination, close-on-outside-click), but
   no longer bars applying a Section 6 technique to a named element.

3. Do not assume hidden functionality or behaviours that cannot be verified from the Search
   Results page or its source code.

4. If functionality cannot be verified from the provided context, do not invent scenarios.
   Record a zero-case per Rule 20 instead.

5. EVERY ENUMERATION IN THIS PROMPT IS A FLOOR, NOT A CEILING. Where an element has more
   distinct cases than a technique's wording names, generate them all.

6. Test each explicitly named variant, filter option, sort option, brand, decision-table
   combination, state transition and technique as its own test case. Do not consolidate, even
   where two cases hit the same underlying code path or produce a similarly-shaped result.
   This applies specifically to:
     (a) each individual filter checkbox under GENDER, CATEGORIES, and Discount — one
         apply-and-verify test case per checkbox, plus at least one combined-filter case (one
         checkbox from two different groups applied together);
     (b) each Sort by Price option (Low to High, High to Low) as its own test case;
     (c) each Sort by Name option (Ascending, Descending) as its own test case;
     (d) each Sort by Brand option (All Brands, and each individually named brand) as its own
         test case;
     (e) the guest-user Add to Cart flow and the authenticated-user Add to Cart flow as two
         separate test cases (per BR3's differing Cart-icon-visibility outcome);
     (f) the zero-matching-results empty state (BR4) as its own test case, distinct from any
         homepage-level negative search input case already covered in the prior round;
     (g) each reachable row of each decision table in technique 5;
     (h) each equivalence class in technique 3 and each boundary edge in technique 4.
   The only consolidation permitted is where two inputs are genuinely identical in kind and
   value space with no distinguishing characteristic named in Section 2/3 (e.g. do not create
   two separate cases both just called "apply a GENDER filter").

7. WHERE THE APPLICATION DOES NOT IMPLEMENT SOMETHING A TECHNIQUE PROBES, THAT ABSENCE IS
   THE FINDING. Generate the case that proves it and state in the Expected Result both what
   correct behaviour would be and what the source actually does, instructing the tester to
   log the actual behaviour as a defect. Never describe missing behaviour as though it
   worked.

================================================================================
INCLUDE, BUT ONLY WHERE THE ABOVE CONSTRAINTS PERMIT
================================================================================

- All nineteen techniques in Section 6, applied per element
- Guest user and authenticated user scenarios
- Cross-browser, incognito and cache-clear scenarios per BR7 and technique 15
- Session-transition and filter/sort-state-transition scenarios per technique 6
- Multi-step end-to-end journeys per technique 8
- Up to 2 KEYBOARD-ONLY end-to-end journeys of the form "complete a full named journey using
  the keyboard alone" (e.g. filter -> sort -> add to cart with no pointer), since those chain
  BR16(a) with a functional path

================================================================================
DON'T CREATE THIS FOR NOW
================================================================================

- SERVER-SIDE security, API and database cases — this application has no server tier, so
  keep techniques 11, 13 and 18 client-side
- Performance and load-timing scenarios (still excluded, unchanged from the previous round)
- Viewport, responsive-layout and touch-target scenarios
- Pagination, infinite scroll, or "load more" scenarios (not named in Section 2/3)
- Returning user scenarios (Recently Viewed)
- Re-testing of Sign In / Sign Up field validation (BR5/BR6 — out of scope this round)
- Re-testing of the Top Menu, Sign In/Sign Up buttons, or homepage-only elements not named
  in Section 2/3 of this round
- Content testing of destination pages — verify only that navigation lands on the stated URL
- Any case for an element not named in Section 2/3

Prioritise business-critical user journeys. Within that, prioritise techniques 11
(Security), 7 (Data Integrity), 5 (Decision Table) and 19 (Accessibility) — the first two
carry the highest severity, and the third systematically finds the filter/sort interaction
gaps that single-condition cases miss.

Include cross-feature, multi-step end-to-end journeys that chain more than one Business Rule
in a single flow, simulating realistic user behaviour rather than isolated element checks. Do
not create more than 5 unless the feature context requires more to cover every Business Rule
at least once.

Avoid true duplicates only. Two test cases are duplicates only if they test the exact same
element, the exact same input/option, and the exact same expected outcome — not merely
because they exercise a similar code path. Per Constraint 6, distinct named filters, sort
options, brands, decision-table rows, state transitions, equivalence classes, boundary edges
and techniques are NOT duplicates.

================================================================================
RULES
================================================================================

8. BUSINESS RULE MAPPING. Each test case maps to exactly one Business Rule, except
   End-to-End journey cases, which may list several. A case may only map to a rule whose
   stated text directly and unambiguously governs the behaviour tested — do not stretch a
   rule's wording to cover a feature it does not explicitly describe. BR5 and BR6 are carried
   over for numbering continuity only and MUST HAVE ZERO TEST CASES MAPPED TO THEM in this
   round — state this explicitly in the summary table with a one-line reason. Usability,
   Analytics and Localisation cases have no stating rule: flag them in the "Unmapped but
   in-scope behaviors" note rather than force-mapping or silently dropping them. State
   explicitly in the summary table any rule with zero mapped cases, with a one-line reason.

9. TEST CASE FORMAT. A Markdown table with these ten columns, in this exact order:

   TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule

   - TC ID: sequential, zero-padded, register-wide — "TC-001", "TC-002" ... in the order the
     sections appear under Rule 12. Do not restart numbering per section and do not use
     per-module prefixes (no "FLT-01", "SRT-02"). If this round's register is appended to an
     existing series, continue from the last ID used there rather than restarting at TC-001 —
     STATE THE STARTING NUMBER ASSUMED.
   - Module: the Rule 12 section this case belongs to.
   - Scenario type: THE TECHNIQUE FROM SECTION 6, named exactly — one of: Positive, Negative,
     Equivalence Class, Boundary (accept), Boundary (reject), Boundary (discrepancy),
     Decision Table, State Transition, Data Integrity, End-to-End, Concurrency, Recovery,
     Security, Compliance, Analytics, Usability, Compatibility, Localisation, SEO, Interface
     Contract, Accessibility. This replaces the previous round's "positive or negative".
     Boundary cases take one of the three Boundary sub-values so an accept edge, a reject
     edge and a rule-contradicting edge are distinguishable at a glance.
   - Scenario: one sentence stating the behaviour under test and why it matters. For a
     Decision Table case, name the condition combination. For a State Transition case, name
     the from-state and to-state. For an Equivalence Class case, name the partition.
   - Precondition: required user type, account type, and the exact application state before
     step 1 — including which search term was used to land on this page, which filters and
     sort are already active, the ACTUAL CONTENTS of the relevant storage keys (not merely
     whether they exist), the starting page and browser, and — where the case involves more
     than one tab or browser — which is which.
   - Test Data: the concrete literal values used, each on its own line, so the case can be
     executed without guessing. Never placeholders like "<a brand>" or "<valid term>". Show
     search terms, filter checkbox labels, sort option values, brand names, payloads, padded
     strings and case variants exactly as typed, including whitespace.
   - Steps: 3-8 numbered, executable actions a tester with no prior feature knowledge could
     follow exactly as written, naming where to verify every non-visual outcome — the
     DevTools pane, the storage key, the console, the URL bar (e.g. "Open DevTools >
     Application > Local Storage and inspect the `cartData` key").
   - Expected Result: one or more numbered, objectively verifiable checkpoints. Where the
     application is expected to fail the check, state what correct behaviour would be, then
     what the source actually does, then instruct the tester to record it as a defect.
   - Priority: High / Medium / Low by business-critical impact. Add to Cart, filter/sort
     correctness, cart-persistence, Security and Data Integrity cases are High; breadcrumb,
     static count display, SEO metadata and cosmetic checks are typically Low/Medium.
   - Business Rule: per Rule 8.

   WORKED EXAMPLE (follow this level of concreteness for every test case):

   | TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule |
   |---|---|---|---|---|---|---|---|---|---|
   | TC-001 | Sort by Price | Positive | Verify selecting "Low to High" re-orders the product listing in ascending price order, since an incorrect comparator silently misprices the whole listing | Guest user; searched "Shoes" from `index.html`; on the Search Results page with the default (unsorted) listing displayed; no filter checkboxes checked; `cartData` key absent or `[]`; Chrome | Search term: "Shoes"<br>Sort option: "Low to High" | 1. Navigate to the Search Results page for search term "Shoes"<br>2. Record the name and price of every displayed product tile in its current order<br>3. Open the "Sort by Price" dropdown<br>4. Select "Low to High"<br>5. Observe the re-ordered product listing<br>6. Compare the new order's prices against the recorded values | 1. Product tiles re-render in the listing<br>2. Each product's price is less than or equal to the price of the product immediately after it, for the entire visible list<br>3. The multiset of product names after sorting is identical to the multiset recorded in step 2 — no tile lost, none duplicated<br>4. The Total Items count is unchanged | High | BR2 |

10. TEST CASE STANDARDS. Preconditions must state the search term used, the active
    filter/sort state, exact storage contents and the starting browser. Test Data must be
    directly executable. Steps must name the verification location for every non-visual
    outcome. Expected Results must be specific, observable and objectively verifiable,
    expressed as one outcome or as a numbered list of SIMULTANEOUSLY-REQUIRED checkpoints —
    never using the list to smuggle in unrelated or optional outcomes; every listed
    checkpoint must be a mandatory pass/fail condition of the same scenario. Every case must
    be unique per Constraint 6.

11. FOR DECISION TABLE CASES SPECIFICALLY: before the cases, include the decision table
    itself — conditions as rows, combinations as columns, the resulting action per column,
    and a marker on any combination the code makes unreachable. Then generate one case per
    reachable column. State the source's evaluation order, since it determines which of
    filter and sort wins when both are applied, and whether a later selection clears an
    earlier one.

12. GROUP TEST CASES UNDER THESE SECTIONS, in this exact order, using this exact naming:

        Breadcrumb
        Total Items Count
        Filter Section
        Sort by Price
        Sort by Name
        Sort by Brand
        Product Listing
        Add to Cart
        Persistence Checks (Logo, Cart Icon & Footer on Search Results Page)
        Guest User Flows
        Authenticated User Flows
        Equivalence Classes
        Boundary — Discount Ranges
        Boundary — Total Items Count
        Boundary — Price Sort Comparator
        Boundary — Name Sort Comparator
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
        Interface Contract (Search Parameter & Client Storage Schema)
        Accessibility — Keyboard Navigation & Focus
        Accessibility — Forms & Labels
        Accessibility — Images & Alt Text
        Accessibility — Contrast
        Accessibility — Status & Change Announcement
        Accessibility — Page Title & Structure
        Cross-Feature End-to-End Journeys
        Keyboard End-to-End Journeys

    Note: "Persistence Checks" remains its own section (distinct from Guest/Authenticated
    User Flows) because it is the only place BR7 is exercised in this round, and it must not
    be folded into the element-specific sections above it. "Guest User Flows" and
    "Authenticated User Flows" contain only cross-cutting session-level checks that are not
    already a single element's dedicated test (e.g. "guest sees no cart icon after adding an
    item" belongs in Guest User Flows; "cart count increments correctly for an authenticated
    user" belongs in Add to Cart).

    A SECTION WITH NOTHING SOURCE-GROUNDED TO TEST STILL APPEARS IN THE SUMMARY TABLE WITH A
    COUNT OF 0 AND A ONE-LINE REASON. Do not delete the section and do not invent a case to
    fill it.

13. Do not invent fields, buttons, pages, workflows, or Business Rules beyond BR1-BR16 above.

14. ALL NINETEEN TECHNIQUES IN SECTION 6 ARE IN SCOPE IN THIS ROUND, including Security,
    Boundary Value and Accessibility. This supersedes the previous round's Rule 11, which
    excluded security and accessibility, and the previous round's "Don't create" exclusion of
    boundary scenarios. Still excluded: server-side security, API, database and performance
    cases.

15. Generate manually executable UI-level test cases only. Tools assist verification; they do
    not replace a human-verifiable checkpoint.

16. Do not duplicate scenarios, per Constraint 6's duplicate definition.

17. Ensure every explicitly named element in Section 2 and Section 3 is covered by at least
    one case in every applicable Section 6 technique, or carries a zero-case statement for
    that technique. No element outside those sections is covered.

18. Ensure every test case maps to a Business Rule per Rule 8, or appears in the "Unmapped
    but in-scope behaviors" note.

19. Use clear, concise, and professional QA language.

20. ZERO-CASE STATEMENTS ARE MANDATORY. After the register, list every
    element-and-technique pair for which zero cases were generated, each with one line
    stating exactly what was searched for — name the attribute, the function, the grep
    pattern — and what was found absent or unreachable. A zero count must read as evidence
    grounded in the source, not as an omission. This is what keeps the seventeen new sections
    honest rather than padded. At minimum, state the grep result for: `gtag`, `dataLayer`,
    `analytics`, `fetch`, `sendBeacon`, `XMLHttpRequest` (technique 13); `Intl`,
    `toLocaleString`, `i18n`, `locale` (technique 16); `maxlength` and any numeric comparison
    in the filter JS (technique 4); `aria-`, `<label`, `alt=`, `role=` (technique 19); and
    `cookie`, `consent` (technique 12).

21. BEFORE THE TEST CASE TABLE, INCLUDE:
    (a) a CRITICAL FINDINGS section — numbered, recording every fact established by reading
        the source that a tester needs first, each with a file and, where possible, line
        reference, and DISTINGUISHING COMPLIANT FINDINGS FROM DEFECTS. At minimum: how the
        search term reaches this page (URL parameter name and casing, or storage key) and
        what happens when it is absent, empty or malformed; the exact matching logic in the
        search/filter/sort functions and their evaluation order; whether multi-group filters
        intersect or unite; whether the price sort operates on a number or a formatted
        string; whether applying a sort preserves an active filter and vice versa; the exact
        storage keys the Add to Cart handler writes, their casing and value shape, and which
        pages read them; how the Total Items count is computed and whether it is derived from
        the rendered set or from a separate variable; whether the search term is echoed into
        the DOM and whether it is escaped; this page's `<title>`, heading structure and
        robots directive; whether product tiles and the Breadcrumb "Home" segment are real
        anchors; and whether any tracking, locale or consent code exists;
    (b) the DECISION TABLES required by Rule 11;
    (c) a summary table of case count per Rule 12 section, including every 0-count section
        with its reason;
    (d) a summary table of case count per Business Rule BR1-BR16, EXPLICITLY SHOWING 0 FOR
        BR5 AND BR6 with a one-line note explaining why, plus a total-occurrences row;
    (e) a summary table of case count per Section 6 technique, showing all nineteen with 0
        where applicable — this is the primary coverage artefact for this round;
    (f) an ELEMENT x TECHNIQUE MATRIX — Section 2/3 elements as rows (Breadcrumb, Total Items
        count, each filter group, each sort dropdown, product tiles, Add to Cart button,
        Logo, Cart icon, Footer), the nineteen techniques as columns — holding the covering
        TC IDs, a zero-case marker, or a dash where the technique does not apply to that
        element.

22. REPRODUCIBILITY CHECK. After generating the register, verify that every case traces to a
    named element in Section 2/3 and a technique in Section 6, that every decision-table case
    traces to a row of a stated table, that every expected-to-fail case states both the
    requirement and the observed behaviour, and that no section was padded with a case not
    grounded in the source. Confirm a second independent run of this prompt against the same
    context would reproduce the same cases, the same zero-cases and the same defects. Remove
    any case that fails this check.

23. PRE-OUTPUT COVERAGE SELF-AUDIT. Before finalising, build the element x technique matrix
    from Rule 21(f) and confirm every applicable cell holds either a TC ID or a zero-case
    marker. Build a checklist of every element and behaviour explicitly named in Section 2
    and Section 3 — including the Breadcrumb's two segments, the Total Items count, every
    filter checkbox in every group, every sort dropdown and each of its options, every named
    brand, the product tiles, the Add to Cart button, and every BR7 persistence claim as it
    applies to this page — and confirm each checklist item has at least one corresponding
    test case. Where a cell or a checklist item is empty, add the missing case or the missing
    zero-case statement BEFORE OUTPUT rather than presenting an incomplete register. Do not
    silently omit a named element or a technique for the sake of brevity.

================================================================================
END OF PROMPT
================================================================================
