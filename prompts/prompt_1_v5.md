# Homepage / Sign In / Sign Up — Functional Test Case Generation Prompt (v5)

> **What changed from v4.** Seventeen additional test-case types are now in scope: Equivalence
> Class, Boundary Value, Decision Table, State Transition, Data Integrity, End-to-End,
> Concurrency, Recovery, Security, Compliance, Analytics, Usability, Compatibility,
> Localisation, SEO, Interface Contract and Accessibility. Adding them required four edits to
> v4, not just an addition: the Scenario type column now holds a technique from a defined list
> rather than "positive or negative"; Rule 11's ban on security AND accessibility testing is
> lifted; Rule 12's "functional UI test cases only" is widened; and BR8–BR15 are added,
> because eight of the new types had no Business Rule to map to. A new Section 6 defines every
> type and how to ground it in this application's source.
>
> **Because Accessibility and Boundary are now in scope here, this prompt supersedes the
> separate boundary/accessibility round for these three pages.** Run one or the other, not
> both, or the two registers will duplicate each other.

Role: Act as a QA Test Architect in functional test design for healthcare, medical, and
e-commerce websites. Analyse the source code and localhost website from a QA perspective and
generate comprehensive, high-quality test cases based only on the provided context.

Task: Analyse the source code and the locally accessible website
`http://localhost:5501/index.html`, together with the Sign In and Sign Up pages it links to.
Generate test cases across **all nineteen techniques named in Section 6** — the original
Positive and Negative paths plus the seventeen added types.

Website:
http://localhost:5501/index.html  (Homepage)
http://localhost:5501/signin.html  (Sign In)
http://localhost:5501/signup.html  (Sign Up)

---

## Feature context

  1. **Page URL & Environment**
     URL: http://localhost:5501/index.html
     Environment: local  |  Domain: no domain specific
     Persistence: browser `localStorage` only. Read the actual key names and their exact
     casing from the source before writing any case that depends on them.

  2. **Page sections visible on the Homepage**

     **Home page:**
       - **Top Menu:** Logo (redirects to home page when clicked; must render identically on
         every page, after login, after logout, after session timeout, after a hard cache
         clear, and in each of Chrome, Edge, Firefox and Safari, and in a private/incognito
         window)
         MEN, WOMEN, KIDS, HOME & LIVING options
         Search Bar (only accepts a valid, complete, exact product name, e.g. "Shoes"; must
         reject partial/half names and empty submissions; displays placeholder text "Search
         for products, brands and more" when empty)
         Sign In and Sign Up buttons (visible only when logged out)
         After sign in, Cart Icon displays showing current item count, and a Logout
         button/link replaces Sign In/Sign Up; Logout ends the session (clears the login
         flag) and returns the user to the home page in its logged-out state
       - **Footer:**

             Online Shopping        Useful Links
             Men                    Contact Us
             Women                  Blog
             Kids                   About Us
             Home                   Terms of use
             Living                 Tracking Order
             Beauty                 Shipping
             Gift cards             Returns
                                    Cancellation
                                    SiteMap
                                    Privacy Policy

         Only four links navigate: Contact Us, Blog, About Us, Terms of use. All other footer
         text items are static/non-navigating and should be verified as such. The footer also
         displays three fixed promotional lines — "Online Shopping Made Easy at StyleUp",
         "Best Online Shopping Site in India for Fashion", "Shop Online at StyleUp with
         Complete Convenience" — and both the 4 links and this promotional text must be
         present and identical on every page and in both the logged-in and logged-out state.

     **Sign In page:** Email field (placeholder "Enter Email"), Password field (placeholder
       "Enter Password"), Sign In submit, "Terms of Services" link → terms-of-use page,
       "Sign Up" link → sign up page. Valid credentials → successful login, redirect to home.
       Invalid credentials → alert "Incorrect Id or password".

     **Sign Up page:** Full Name field (placeholder "Enter your full name"), Email field
       (placeholder "Enter Email"), Password field (placeholder "Enter Password"), Sign Up
       submit, Terms of service link → terms-of-use page, "Sign In" link → sign in page.
       Valid inputs → successful registration. Invalid email (no "@" or no ".com") → alert
       "Enter correct Email". Password under 8 characters, or password of only spaces → alert
       "Weak Password: Enter atleast 8 characters". Empty/missing full name → alert "Enter
       correct name".

  3. **Key Interactive Elements**
     Logo — redirect to home page; persists identically across pages, login/logout, session
       timeout, cache clear, 4 named browsers, and incognito mode
     MEN / WOMEN / KIDS / HOME & LIVING — navigate to their pages (login-gated)
     Search — product search with a valid, complete name; placeholder text when empty
     Sign In button — navigates to sign in page, from each named origin page (home, Contact
       Us, Blog, About Us, Terms of Use, PDP)
     Sign Up button — same, from each named origin page
     Sign In page fields — Email, Password, submit, Terms link, Sign Up link
     Sign Up page fields — Full Name, Email, Password, submit, Terms link, Sign In link
     Logout — ends session, returns to logged-out home page
     Cart/Basket icon — visible only post-login, reflects item count (0, +1 per add tested
       across at least 2 additions, −1 per remove), persists across pages while logged in,
       disappears on logout
     Footer — the 4 navigating links, the static remainder, the 3 promotional text lines, and
       the "displayed identically on every page and in both login states" property

     **This list names the elements in scope. Section 6 names the techniques each must be
     tested with.**

  4. **Business Rules**
     BR1 — Unauthorised (guest) user can only view the home page and access the 4 working
       footer links; no other page or section is reachable.
     BR2 — A user must be logged in to reach the Men, Women, Kids, or Home & Living sections;
       this gate must hold regardless of entry path (menu click, direct URL, bookmark,
       browser history).
     BR3 — The Basket/Cart icon shows 0 when the cart is empty, increases by 1 each time a
       product is added (tested across multiple sequential additions), decreases by 1 each
       time a product is removed; visible only after sign-in and disappears on logout.
     BR4 — Search only accepts a valid, complete product/category name; a half (partial) name
       or an empty submission must NOT return results.
     BR5 — Sign-in must succeed only with a valid, registered email/password combination; any
       other combination must be rejected with a clear error message and must not create a
       session.
     BR6 — Sign-up must succeed only when all required fields (Full Name, Email, Password) are
       valid and complete; each missing or invalid field must be rejected with its own
       specific, distinct error message and must not create an account.
     BR7 — Any element whose Section 2/3 description states it is displayed "on all pages,"
       "after login," "after logout," or otherwise persists across a page or session
       transition must render identically and correctly in every state named. This rule also
       governs cross-browser and incognito consistency for those elements.

     **New in v5 — added because seven of the fourteen new techniques had no rule to map to:**

     BR8 — **Data integrity.** Anything the application persists must be readable back
       unchanged: every field exactly as entered, no truncation, no type coercion, no
       silent reordering or loss, and any derived value (a count, a total) must remain
       arithmetically consistent with the data it derives from.
     BR9 — **State machine and concurrent access.** The application must move only through
       valid state transitions (guest → authenticated → guest; cart 0 → n → 0), must reach
       the correct state on re-entry, and must behave predictably when two actors — two
       tabs, two browsers, or one rapid double-submit — act on the same stored state.
     BR10 — **Client-side security.** User-supplied input must not execute when rendered
       back; credentials must not be recoverable in plaintext from the client;
       authentication responses must not disclose whether an identity exists; repeated
       failed attempts must be constrained; failure paths must not leak internal detail; and
       a client-side access gate must not be bypassable by an alternative entry path.
     BR11 — **Recovery and graceful degradation.** After a failed action, a blocked
       resource, a storage failure, a refresh or a browser-back, the application must return
       to a usable, correctly-stated state rather than a broken or misleading one.
     BR12 — **Interface contract.** Every page that reads a stored key must agree with every
       page that writes it — same key name, same casing, same value shape — and a malformed
       or externally-modified value must be handled rather than crashing the page.
     BR13 — **Compliance.** Where the application states a policy or presents a
       policy document, observed behaviour must match it; where consent is required before
       storing data, it must be obtained.
     BR14 — **Discoverability and SEO.** Each page must carry a descriptive, distinct title
       and the metadata and crawlable link structure needed for it to be indexed correctly.
     BR15 — **Accessibility (WCAG 2.1 Level AA)**, scoped to the pages and elements named in
       Section 2:
         (a) **Keyboard operability:** every interactive element named in Section 2 must be
             reachable with Tab in a logical order, show a visible focus indicator, and be
             activatable with Enter (and Space where appropriate) — the full sign-in and
             sign-up journeys must be completable with the keyboard alone.
             (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7)
         (b) **Labels and names:** each form field must have a programmatically associated
             label or accessible name; a placeholder alone does not satisfy this.
             (WCAG 1.3.1, 3.3.2, 4.1.2)
         (c) **Images:** the Logo and any other Section 2-named image must have a non-empty,
             meaningful alt attribute. (WCAG 1.1.1)
         (d) **Contrast:** visible text of the Top Menu, Search placeholder, Sign In/Sign Up
             buttons and form labels, and Footer links and promotional lines must meet at
             least 4.5:1 against its background (3:1 for large-scale text). (WCAG 1.4.3)
         (e) **Error identification:** each validation failure must be perceivable and must
             identify what went wrong, not merely that something did. (WCAG 3.3.1)
         (f) **Page titles and structure:** each page must have a descriptive, distinct
             `<title>` and a usable heading hierarchy. (WCAG 2.4.2, 1.3.1)

     Usability, Analytics and Localisation cases have **no stating Business Rule** and must
     be flagged in the "Unmapped but in-scope behaviors" note per Rule 6, not force-mapped.

  5. **User types**
     - Guest user (not logged in) — can access only the home page and the 4 working footer
       links; cannot order.
     - Authenticated user (logged in) — can browse gated sections and order.
     - A **second, separate account** is required for the BR9 shared-browser cases.
     - Account type: not specific.
     - Browsers: Chrome, Edge, Firefox, Safari, and one private/incognito window.
     - Tooling: DevTools Application > Local Storage for BR8/BR9/BR12 cases; DevTools Network
       for the blocked-resource cases; DevTools Console for leakage cases; two tabs and two
       browsers for concurrency cases.

  6. **TEST CASE TECHNIQUES — all nineteen are in scope**

     Every element in Section 2/3 must be tested with every technique below that applies to
     it. Where a technique does not apply to an element, or the application does not
     implement the thing the technique probes, **record a zero-case per Rule 20** — do not
     invent filler to populate a section.

     **Read this before generating.** On an application of this size several of these
     techniques will legitimately produce very few cases, or none. Analytics, Localisation
     and parts of Compliance are the likely zero sections, because a local client-only demo
     has no tracking layer, no locale layer and no consent layer. A zero grounded in a named
     grep is a correct and valuable result. A fabricated case to fill a section is not.

     **(1) Positive** — the element performing its stated function with valid input in the
       stated state.

     **(2) Negative** — invalid, missing or malformed input. For any form with N required
       fields, generate a case for **each single-field-empty permutation** plus one
       all-empty — N+1 cases, not one representative. One case per distinct invalid class,
       even where two classes produce the same message.

     **(3) Equivalence Class** — partition each input's value space into classes the code
       treats identically, then test one representative per class and state the partitions
       explicitly. Derive the classes from the source's actual branching, not from intuition.
       For the Sign Up email field, for example, the code's own checks define the partitions;
       enumerate every valid class as well as every invalid one, since a partition with no
       representative is an untested class.

     **(4) Boundary Value** — apply boundary-value analysis **only** where a limit is
       explicitly stated in Section 2/4 or is verifiable in the source (a `maxlength`
       attribute, a length check in the JS, an exact-match string comparison). For each such
       limit generate cases at the limit, one step below, and one step above, where each side
       is meaningful. Also test the character-class edges the limit implies — a length rule
       satisfied entirely by whitespace, a comparison given a padded or differently-cased
       value. **Do not invent limits:** where a field has no source-verifiable limit, generate
       zero boundary cases for it and say so per Rule 20.

     **(5) Decision Table** — where two or more conditions combine to determine which
       outcome fires. Build the truth table from the source's **actual evaluation order**,
       then generate one case per reachable combination and mark the unreachable ones. The
       decision points on these pages are: the Sign Up gate (name valid? × email valid? ×
       password valid? → which alert fires and in what precedence), the Sign In gate (email
       matches a stored record? × password matches that record? → session or alert), and the
       navbar render (login flag × which page → which navbar variant appears).

     **(6) State Transition** — the application's state machine. Derive the states from the
       actual persisted keys, then test each valid transition, each attempted invalid
       transition, and re-entry into a state already occupied. The machines here are: guest
       → authenticated → guest, and cart count 0 → n → 0.

     **(7) Data Integrity** — whether what was written is what is read back. Inspect
       storage, do not trust the UI. Test that a registered record holds every field exactly
       as typed; that a cart count and any derived total stay consistent with the underlying
       items after add, remove and repeat operations; and that nothing is truncated or
       coerced on the way in or out.

     **(8) End-to-End** — multi-step journeys chaining more than one Business Rule in a
       realistic flow. At least one journey must terminate in a **persisted-state
       assertion**, not merely a navigation, so the journey proves the data landed and not
       just that the page changed.

     **(9) Concurrency** — two actors on the same stored state. There is no server tier, so
       the concurrency surface is client-side: two browser tabs of the same page, the same
       account in two different browsers, and a rapid double-submit of a single form. Test
       whether the second actor sees stale state, and whether a double-submit produces a
       double write.

     **(10) Recovery** — returning to a usable state after a failure. Test: whether entered
       data survives a failed submit; a blocked or broken resource; a storage write failure
       with storage disabled; browser-back after a redirect; and a refresh part-way through
       a form.

     **(11) Security** — client-side only, per BR10. Test: a script payload in each field
       that is stored, and whether it is ever rendered back; the exact form credentials take
       in storage; whether failure messages distinguish an unknown identity from a wrong
       secret; whether repeated failed attempts are throttled; whether any failure path
       leaks a stack trace, path or version to the console; and whether the access gate can
       be reached around by direct URL or by an alternative link.

     **(12) Compliance** — stated policy versus observed behaviour, per BR13. Test whether
       the Privacy Policy and Terms of use items resolve to real documents; whether the
       application obtains any consent before writing to client storage; and whether any
       statement those documents make about data handling matches what the code does. Where
       no consent mechanism exists, that absence is the finding.

     **(13) Analytics** — whether any event or tracking call fires on the key actions.
       Grep the source for `gtag`, `dataLayer`, `analytics`, `fetch`, `sendBeacon` and
       `XMLHttpRequest`. Report the grep result explicitly: if no tracking layer exists,
       record a zero-case naming exactly what was searched for, and do not invent events.

     **(14) Usability** — friction and clarity, expressed **objectively**. Each case must
       have a verifiable pass condition, not an opinion. Testable here: whether each error
       message names the specific field that failed; whether a field's visible label or
       placeholder is sufficient to know what to enter; the number of steps needed to
       complete each named journey against the minimum the UI allows; and whether any
       destructive or irreversible action is confirmed before it executes.

     **(15) Compatibility** — the 4 named browsers plus incognito. Beyond the BR7 persistence
       elements, also test each named form's submit path in each browser, and any
       browser-native behaviour the application depends on — `alert()` dialogs, native input
       types, and localStorage availability.

     **(16) Localisation** — locale-dependent presentation. Grep for `Intl`, `toLocaleString`,
       `lang=`, and any locale or i18n module. Test currency symbol, number and date
       formatting, text direction, and whether user-visible strings are hardcoded to one
       language. Where no locale layer exists, record a zero-case — but report the
       hardcoded-string finding as the substance of that section.

     **(17) SEO** — per BR14. Test each page's `<title>` for presence, descriptiveness and
       distinctness from the other pages; the presence of a meta description, canonical and
       robots directive; the heading hierarchy including whether an `<h1>` exists; and
       whether navigation elements are real crawlable `<a href>` elements or
       script-driven `<div>`s. This technique is productive on these pages precisely because
       the navigation implementation is worth checking.

     **(18) Interface Contract** — the contract between components. There is no server API,
       so the contract is the **client storage schema**. Test that a key written by one page
       is read correctly by another; that key names and casing agree across every reader and
       writer; that the value shape each reader expects matches what the writer produces; and
       that a hand-edited or malformed value is handled rather than crashing the page.

     **(19) Accessibility** — WCAG 2.1 Level AA, per BR15. Each clause is tested per page
       where it applies, and the label clause is tested per named field. Where the source
       shows a placeholder-only field or a missing `alt`, the Expected Result is the BR15
       requirement and the current state is recorded as a defect — not the pass condition.

---

## Constraints

1. Analyse the source code and the local host website Homepage, together with the Sign In and
   Sign Up pages it links to. Every case must be grounded in what the code actually does.

2. **Section 2 and Section 3 scope the elements; Section 6 scopes the techniques.** Do not
   test elements outside Section 2/3. Within those elements, apply every applicable technique
   in Section 6. A description that names only a happy path does not put the other techniques
   out of scope for that element.

3. Do not assume hidden functionality or behaviours that cannot be verified from these pages
   or their source code.

4. If functionality cannot be verified from the provided context, do not invent scenarios.
   Record a zero-case per Rule 20 instead.

5. **Every enumeration in this prompt is a floor, not a ceiling.** Where an element has more
   distinct cases than a technique's wording names, generate them all.

6. Test each explicitly named variant, origin page, input category, decision-table
   combination, state transition and technique as its own test case. Do not consolidate, even
   where two cases hit the same code path or produce the same message. The only consolidation
   permitted is where two inputs are genuinely identical in kind and value space with no
   distinguishing characteristic named.

7. **Where the application does not implement something a technique probes, that absence is
   the finding.** Generate the case that proves it and state in the Expected Result both what
   correct behaviour would be and what the source actually does, instructing the tester to log
   the actual behaviour as a defect. Never describe missing behaviour as though it worked.

## Include, but only where the above constraints permit
- All nineteen techniques in Section 6, applied per element
- Guest user and authenticated user scenarios
- Cross-browser, incognito and cache-clear scenarios per BR7 and technique 15
- Session-transition scenarios per technique 6
- Multi-step end-to-end journeys per technique 8

## Don't create this for now
- **Server-side** security, API and database cases — this application has no server tier, so
  keep techniques 11, 13 and 18 client-side
- Performance and load-timing scenarios
- Viewport, responsive-layout and touch-target scenarios
- Returning user scenarios (Recently Viewed)
- Content testing of destination pages — verify only that navigation lands on the stated URL
- Any case for an element not named in Section 2/3

Include up to 2 **keyboard-only** end-to-end journeys of the form "complete a full named
journey using the keyboard alone", since those chain BR15(a) with a functional path.

Prioritise business-critical user journeys. Within that, prioritise techniques 11 (Security),
7 (Data Integrity), 5 (Decision Table) and 19 (Accessibility) — the first two carry the highest severity, and the
third systematically finds validation gaps single-condition cases miss.

Include cross-feature, multi-step end-to-end journeys that chain more than one Business Rule
in a single flow, simulating realistic user behaviour rather than isolated element checks. Do
not create more than 5 unless the feature context requires more to cover every Business Rule
at least once.

Avoid true duplicates only. Two test cases are duplicates only if they test the exact same
element, the exact same input, and the exact same expected outcome. Distinct named variants,
origin pages, input categories, decision-table rows, state transitions and techniques are NOT
duplicates.

---

## Rules

8. **Business Rule Mapping.** Each test case maps to exactly one Business Rule, except
   End-to-End journey cases, which may list several. A case may only map to a rule whose
   stated text directly and unambiguously governs the behaviour tested — do not stretch a
   rule's wording. Usability, Analytics and Localisation cases have no stating rule: flag them
   in the "Unmapped but in-scope behaviors" note. State explicitly in the summary table any
   rule with zero mapped cases, with a one-line reason.

9. **Test Case Format.** A Markdown table with these ten columns, in this exact order:
   TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule

   - **TC ID:** sequential, zero-padded, register-wide — "TC-001", "TC-002" … in the order the
     sections appear under Rule 12. Do not restart numbering per section and do not use
     per-module prefixes. If appended to an existing series, continue from the last ID used
     and state the starting number assumed.
   - **Module:** the Rule 12 section this case belongs to.
   - **Scenario type:** **the technique from Section 6**, named exactly — one of: Positive,
     Negative, Equivalence Class, Boundary (accept), Boundary (reject), Boundary
     (discrepancy), Decision Table, State Transition, Data Integrity, End-to-End,
     Concurrency, Recovery, Security, Compliance, Analytics, Usability, Compatibility,
     Localisation, SEO, Interface Contract, Accessibility. This replaces v4's "positive or
     negative". Boundary cases take one of the three Boundary sub-values so an accept edge, a
     reject edge and a rule-contradicting edge are distinguishable at a glance.
   - **Scenario:** one sentence stating the behaviour under test and why it matters. For a
     Decision Table case, name the condition combination. For a State Transition case, name
     the from-state and to-state.
   - **Precondition:** required user type, account type, and the exact application state
     before step 1 — including the **actual contents** of the relevant storage keys, not
     merely whether they exist; the starting page and browser; and, where the case involves
     more than one tab or browser, which is which.
   - **Test Data:** the concrete literal values used, each on its own line, so the case can be
     executed without guessing. Never placeholders like "<valid email>". Show payloads, padded
     strings and case variants exactly as typed, including whitespace.
   - **Steps:** 3–8 numbered, executable actions a tester with no prior feature knowledge
     could follow exactly as written, naming where to verify every non-visual outcome — the
     DevTools pane, the storage key, the console, the URL bar.
   - **Expected Result:** one or more numbered, objectively verifiable checkpoints. Where the
     application is expected to fail the check, state what correct behaviour would be, then
     what the source actually does, then instruct the tester to record it as a defect.
   - **Priority:** High / Medium / Low by business-critical impact. Security, Data Integrity,
     login and gating cases are High; static display, SEO metadata and cosmetic checks are
     typically Low/Medium.
   - **Business Rule:** per Rule 8.

10. **Test Case Standards.** Preconditions must state exact storage contents and the starting
    browser. Test Data must be directly executable. Steps must name the verification location
    for every non-visual outcome. Expected Results must be specific, observable and
    objectively verifiable, expressed as one outcome or as a numbered list of
    simultaneously-required checkpoints — never using the list to smuggle in optional
    outcomes. Every case must be unique per Constraint 6.

11. **For Decision Table cases specifically:** before the cases, include the decision table
    itself — conditions as rows, combinations as columns, the resulting action per column, and
    a marker on any combination the code makes unreachable. Then generate one case per
    reachable column. State the source's evaluation order, since it determines which alert
    fires when more than one condition fails at once.

12. **Group Test Cases Under These Sections, in this exact order, using this exact naming:**

        Top menu
        Search
        Logo
        Sign In
        Sign Up
        Cart/Basket
        Footer
        Guest User Flows
        Authenticated User Flows
        Equivalence Classes
        Boundary — Sign Up Password
        Boundary — Sign Up Email
        Boundary — Sign Up Full Name
        Boundary — Search Input
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
        Interface Contract (Client Storage Schema)
        Accessibility — Keyboard Navigation & Focus
        Accessibility — Forms & Labels
        Accessibility — Images & Alt Text
        Accessibility — Contrast
        Accessibility — Error Identification
        Accessibility — Page Titles & Structure
        Cross-Feature End-to-End Journeys
        Keyboard End-to-End Journeys

    Note: Cart/Basket and Footer are their own sections (do not fold them into Guest/
    Authenticated User Flows) because they are named, testable elements in Section 2/3 with
    their own dedicated Business Rules and deserve direct traceability. "Guest User Flows" and
    "Authenticated User Flows" contain only cross-cutting session-level checks that are not
    already a single element's dedicated test.

    A section with nothing source-grounded to test **still appears in the summary table with a
    count of 0 and a one-line reason.** Do not delete the section and do not invent a case to
    fill it.

13. Do not invent fields, buttons, pages, workflows, or Business Rules beyond BR1–BR15 above.

14. **All nineteen techniques in Section 6 ARE in scope in this round**, including Security,
    Boundary Value and Accessibility. This supersedes v4's Rule 11, which excluded security,
    performance and accessibility, and v4's "Don't create" exclusion of boundary scenarios.
    Still excluded: server-side security, API, database and performance cases.

15. Generate manually executable UI-level test cases only. Tools assist verification; they do
    not replace a human-verifiable checkpoint.

16. Do not duplicate scenarios, per Constraint 6's duplicate definition.

17. Ensure every explicitly named element in Section 2 and Section 3 is covered by at least
    one case in every applicable Section 6 technique, or carries a zero-case statement for
    that technique. No element outside those sections is covered.

18. Ensure every test case maps to a Business Rule per Rule 8, or appears in the "Unmapped but
    in-scope behaviors" note.

19. Use clear, concise, and professional QA language.

20. **Zero-case statements are mandatory.** After the register, list every
    element-and-technique pair for which zero cases were generated, each with one line stating
    exactly what was searched for — name the attribute, the function, the grep pattern — and
    what was found absent or unreachable. A zero count must read as evidence grounded in the
    source, not as an omission. This is what keeps the fourteen new sections honest rather
    than padded.

21. **Before the test case table, include:**
    (a) a **Critical Findings** section — numbered, recording every fact established by
        reading the source that a tester needs first, each with a file and, where possible,
        line reference, and **distinguishing compliant findings from defects**: each
        validation function's checks and their evaluation order; the exact storage keys, their
        casing and value shape, and which pages read and write each; what form credentials
        take in storage; whether any tracking, locale or consent code exists; each page's
        `<title>` and heading structure; and whether navigation elements are real anchors;
    (b) the **decision tables** required by Rule 11;
    (c) a summary table of case count per Rule 12 section, including every 0-count section
        with its reason;
    (d) a summary table of case count per Business Rule BR1–BR15, plus a total-occurrences
        row;
    (e) a summary table of case count per Section 6 technique, showing all nineteen with 0
        where applicable — this is the primary coverage artefact for this round;
    (f) an **element × technique matrix** — Section 2/3 elements as rows, the nineteen
        techniques as columns — holding the covering TC IDs, a zero-case marker, or a dash
        where the technique does not apply to that element.

22. **Reproducibility check.** After generating the register, verify that every case traces to
    a named element in Section 2/3 and a technique in Section 6, that every decision-table
    case traces to a row of a stated table, that every expected-to-fail case states both the
    requirement and the observed behaviour, and that no section was padded with a case not
    grounded in the source. Confirm a second independent run of this prompt against the same
    context would reproduce the same cases, the same zero-cases and the same defects. Remove
    any case that fails this check.

23. **Pre-output coverage self-audit.** Before finalising, build the element × technique matrix
    from Rule 21(f) and confirm every applicable cell holds either a TC ID or a zero-case
    marker. Where a cell is empty, add the missing case or the missing zero-case statement
    before output rather than presenting an incomplete register. Do not silently omit a named
    element or a technique for the sake of brevity.
