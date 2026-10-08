AUTOMATIC CONVERSION TO PLAYWRIGHT SCRIPTS

Role: As a Senior Automation Engineer with 10 years of experience, automate the E-commerce website using playwright default framework 

Task: Convert every test case generated in document into complete, production-ready
Playwright TypeScript automation scripts. For EACH test case, first map it into a
structured Test Case Definition, then generate the script following the mandatory
Verification Protocol for the selected Verification Mode. No step in either phase
may be skipped.

Mapping rules (apply to EACH test case from Phase 1 before writing any code):
  - ID              → used as the test's tag/identifier and title (e.g. test('TC-004: ...'))
  - Scenario        → Test case title
  - Preconditions   → determines guest vs. authenticated setup, account type, and any required
                       prior state before the test steps begin
  - Steps           → convert each business-language step into concrete UI actions,
                       verified against the source code or the live DOM — never guessed
                       from the step's wording
  - Expected Result → convert into one hard assertion (expect()) per stated fact —
                       never combine unrelated checks into one expect()
  - Business Rule   → carried into the file header comment for traceability only —
                       never used to alter script logic. If a test case lists multiple
                       Business Rules (Cross-Feature End-to-End Journeys), include all of them
  - Section         → determines which spec file the generated test belongs in

Do NOT invent steps, elements, or outcomes beyond what the document test case states.
If a document step is ambiguous, flag it explicitly in a comment rather than assuming intent.

================================================================================
VERIFICATION MODE SELECTION — DECIDE THIS FIRST
================================================================================
Before any locator is written, declare which mode applies. The mode is decided per
ELEMENT, not per test case — a single spec file may legitimately contain locators
verified under different modes.

  Mode A — SOURCE CODE ANALYSIS   (use when the application source code is available)
  Mode B — LIVE DOM INSPECTION    (use when source is unavailable, or as the mandatory
                                   cross-check for the element classes listed in the
                                   Cross-Check Matrix below)
  Mode C — UNVERIFIED FALLBACK    (use only when neither A nor B can be completed;
                                   must be flagged for manual review before merge)

Selection rule:
  1. Source code available?  → Mode A is the primary source of truth.
  2. Does the element fall into a class that requires a DOM cross-check
     (see Cross-Check Matrix)?  → run Mode B in addition to Mode A.
  3. Source unavailable for that area (third-party widget, vendor bundle,
     component-library internals)?  → Mode B only.
  4. Neither achievable?  → Mode C, with the reason documented.

Mode A is preferred where available because it yields the exact attribute values,
the exact message strings, the exact evaluation order, and the exact storage schema —
none of which have to be inferred. It is NOT a licence to skip verification: reading
the wrong file is the source-code equivalent of inspecting the wrong page.

--------------------------------------------------------------------------------
CROSS-CHECK MATRIX — when Mode A alone is sufficient, and when Mode B is also required
--------------------------------------------------------------------------------
| Element origin                                              | Mode A alone | Mode B also required |
|-------------------------------------------------------------|--------------|----------------------|
| Static attribute in a plain .html file                        | Sufficient   | No                   |
| Attribute passed through unchanged in JSX/Vue/Angular         |              |                      |
| (id, data-test-id, aria-label, role, placeholder, alt)        | Sufficient   | Recommended          |
| Attribute built inside a JS template literal / innerHTML /    |              |                      |
| document.createElement chain (e.g. navbar.js)                 | Not enough   | YES                  |
| Attribute produced by a build/compile step (CSS Modules,      |              |                      |
| styled-components, hashed classNames, Tailwind JIT output)    | Not enough   | YES                  |
| Attribute assembled from a variable or expression at runtime  |              |                      |
| (`data-test-id={`item-${id}`}`)                               | Not enough   | YES                  |
| Element rendered only after an action or in a conditional     |              |                      |
| branch (post-login navbar, error banner, modal)               | Not enough   | YES — in post-action |
|                                                               |              | state                |
| Element rendered by a third-party component library or        |              |                      |
| injected by a vendor script                                   | N/A          | YES — Mode B only    |
| Element behind a route the source shows but the build does    |              |                      |
| not ship (dead code, feature-flagged branch)                  | Not enough   | YES                  |

If a row says "YES", a Mode A record alone is NOT acceptable — the locator must carry
a [SOURCE + DOM VERIFIED] block.

================================================================================
SOURCE CODE INVENTORY — REQUIRED BEFORE ANY SCRIPT IS WRITTEN
================================================================================
When Mode A is in use, produce this inventory first and include it in the output:

  - Repository root path and how the application is served (e.g. `http://localhost:5501`,
    static file server / Vite dev server / production build)
  - Framework and version (plain HTML+JS, React 19 + Vite, etc.)
  - Build tooling, if any, and whether tests run against SOURCE or a BUILT artifact
  - Routing mode and its effect on URL assertions
    (BrowserRouter → `/cart`; HashRouter → `/#/cart`; plain multi-page → `/cart.html`)
    ⚠ URL assertions MUST match the routing mode actually in use — read the router
      configuration, do not assume
  - File map: for every page in scope, the file(s) that render it, plus the JS/TS files
    that mutate its DOM or hold its business logic
  - Storage schema: every localStorage / sessionStorage / cookie key the app reads or
    writes, with the exact key spelling and the exact value shape
  - Any seeded, hardcoded, or fixture accounts present in the source

Every statement in the inventory must cite `file:line`. Anything not confirmed by a read
or a grep is recorded as "not found" — never as an assumption.

================================================================================
SOURCE CODE ANALYSIS PROTOCOL — MANDATORY IN MODE A
================================================================================
This protocol applies to EVERY locator and EVERY behavioural fact needed to execute the
mapped steps, without exception. No locator may be written until the corresponding
source analysis is complete.

Step S1 — Identify the file that actually renders the element:
  - Determine which page the element lives on from the mapped Test Case Definition
  - Locate the rendering file by grepping the repository for the element's visible text,
    its attribute value, or its handler name — do NOT navigate the file tree by guesswork
  - For a component-based app, follow the import chain from the route definition down to
    the component that owns the element
  - NEVER read File A's markup to obtain locators for a page rendered by File B
  - Record the resolved path as `path/to/file.ext:line`

Step S2 — Read the markup exactly as authored:
  - Open the file and read the target node's markup CHARACTER FOR CHARACTER
  - Copy the raw source snippet verbatim into the verification block
  - Do NOT normalise quotes, casing, hyphenation, or singular/plural forms

Step S3 — Resolve dynamically generated markup:
  - If the element is emitted from a template literal, `innerHTML` assignment, or
    `createElement` chain, read the TEMPLATE, not a rendered guess
  - If any part of the attribute is interpolated, record the interpolation expression and
    resolve what it evaluates to for the specific test data in use
  - Any interpolated attribute triggers a mandatory Mode B cross-check (see matrix)

Step S4 — Trace the behaviour, not just the markup:
  - Locate the event handler bound to the element and read it end to end
  - Record: evaluation order of validations, short-circuit points, the exact message
    strings, the exact redirect targets, and every storage read/write it performs
  - Copy message strings and storage keys verbatim, including typos, spacing, and casing
    — assert the string the code actually produces, never a corrected version

Step S5 — Confirm the element ships:
  - Confirm the file is actually loaded by the page under test (script/link tag, import
    chain, or route registration) — source that exists but is never loaded is not in scope
  - If tests run against a build output, confirm the attribute survives the build
  - Never read a minified bundle, `dist/`, or vendor artifact as the source of truth

Step S6 — Handle conditional and state-dependent elements:
  - Record the exact condition that renders the element, quoting the guarding expression
  - Document that condition as the Pre-condition in the verification block
  - Cross-check in Mode B in the post-condition state (matrix row applies)

Step S7 — Reuse across test cases in the same batch:
  - If multiple test cases target the same element in the same file, analyse and verify
    that locator ONCE, then reuse it — do not re-derive it per test case
  - Reuse is per file+element, never per element name across different files

================================================================================
BEHAVIOURAL LOGIC EXTRACTION — MODE A ONLY
================================================================================
Where source is available, the following facts must be taken from the code rather than
inferred, and each must cite `file:line`:

  - Exact alert / toast / inline-error strings, character for character
  - Exact redirect targets after success and after failure
  - Validation evaluation order and short-circuit behaviour — this determines WHICH
    message a multi-invalid-field submission can actually produce
  - Guard conditions on protected routes and what happens when the guard fails
  - Storage keys, their exact spelling, their value shape, and when they are written,
    trimmed, or cleared
  - Conditional render branches, so a "not visible" assertion targets the right absence

⚠ Scope boundary: this extraction informs HOW a fact is asserted (the exact string, the
  exact key, the exact URL). It NEVER changes WHAT is asserted. The set of assertions is
  fixed by the Phase 1 Expected Result and may not be expanded, reduced, or re-scoped.

================================================================================
DOM INSPECTION PROTOCOL — MANDATORY IN MODE B
================================================================================
Applies to every locator resolved under Mode B, and to every Mode A locator whose row in
the Cross-Check Matrix requires it.

Step D1 — Identify the correct page for each element:
  - Determine which page each element lives on from the mapped Test Case Definition
  - Use Playwright MCP to navigate to that EXACT page
  - If the page requires authentication, complete the full login flow FIRST in the
    same MCP session before navigating to it
  - NEVER inspect Page A's DOM to obtain locators for Page B

Step D2 — Inspect the live rendered DOM:
  - Use Chrome DevTools MCP to inspect the rendered DOM on the correct page
  - Read every attribute value CHARACTER FOR CHARACTER as it appears in the live DOM

Step D3 — Extract and record:
  - Copy the raw outer HTML snippet of the target node directly from the DevTools panel
  - Record the EXACT attribute value — do NOT retype it from memory

Step D4 — Confirm before writing:
  - Confirm the attribute exists before writing it into the script
  - If you cannot confirm it exists, apply the DOM NOT VERIFIED fallback instead

Step D5 — Handle dynamic or conditional elements:
  - Perform the required action in the MCP session first, then inspect the DOM in the
    post-action state, and document the pre-condition in the verification comment

Step D6 — Reuse across test cases in the same batch:
  - If multiple test cases target the same element on the same page, inspect and verify
    that locator ONCE, then reuse it — do not re-guess or re-derive it per test case

AUTHENTICATION FLOW FOR DOM INSPECTION
  1. Navigate to the login page using Playwright MCP
  2. Complete the full login sequence in the SAME MCP browser session
  3. Confirm login was successful before inspecting any authenticated page
  4. Navigate to the authenticated page in the SAME session
  5. Use the matching test account if account type matters
  6. Re-authenticate if the MCP session is lost between calls
  7. If authentication cannot be completed, fall back to Mode A for that page where the
     source is available; otherwise apply the Mode C fallback for ALL locators on that
     page and document the reason

================================================================================
PRECONDITION SETUP FROM SOURCE — PERMITTED, WITH LIMITS
================================================================================
Because Mode A yields the exact storage schema, a Precondition may be established
deterministically instead of by driving the UI — for example seeding the authenticated
state via `page.addInitScript()` using the exact keys and value shape read from source.

  ✓ Permitted for PRECONDITIONS only
  ✓ Must cite the `file:line` the schema was read from
  ✓ Must be stated in a comment so a reviewer can see the state was seeded, not earned
  ✗ NEVER use seeding to satisfy a Step
  ✗ NEVER use seeding to satisfy an Expected Result
  ✗ NEVER seed for a test case whose own Steps exercise the login or registration flow —
    those must run through the real UI

================================================================================
ABSOLUTE PROHIBITIONS
================================================================================
  ✗ NEVER construct an attribute value by combining a guessed prefix with visible text
  ✗ NEVER assume singular/plural form of any attribute value — always read the exact value
  ✗ NEVER assume naming patterns carry over between elements, sections, pages, or files
  ✗ NEVER reuse a locator pattern or prefix observed on one page for a different page
  ✗ NEVER write any attribute value from memory or prior knowledge of the website
  ✗ NEVER treat a source-code read as verified without citing `file:line`
  ✗ NEVER take an interpolated, computed, or build-transformed attribute from source
    without a live DOM cross-check
  ✗ NEVER read a minified bundle, `dist/` output, or vendor artifact as source of truth
  ✗ NEVER assert a corrected version of a message string — assert what the code emits,
    typos included
  ✗ NEVER assume a URL shape — read the routing mode from the router configuration
  ✗ NEVER use absolute XPath
  ✗ NEVER use generated or dynamic CSS class names
  ✗ NEVER use positional selectors (.nth(), .first(), .last()) unless no unique locator
    exists — flag it for manual review if used
  ✗ NEVER batch multiple locators under a single verification block
  ✗ NEVER expand a Phase 1 test case's scope beyond its stated Steps and Expected Result
  ✗ NEVER silently reconcile a conflict between source and the Phase 1 Expected Result —
    apply the Discrepancy Handling rule below

================================================================================
LOCATOR PRIORITY ORDER
================================================================================
  1. data-test-id attribute
  2. aria-label attribute
  3. getByRole() with accessible name
  4. getByLabel()
  5. getByPlaceholder()
  6. getByText() — only if no structural or attribute locator exists

  Avoid: absolute XPath, generated CSS classes, positional selectors unless unavoidable.

  Mode A note: if the source shows the application has NO stable test attribute on the
  target element, do not invent one and do not fabricate a selector against a class the
  build will rewrite. Fall down the priority order and record the gap — a recommendation
  to add `data-test-id` may be listed in the output, but the generated script must work
  against the code as it exists today.

================================================================================
LOCATOR VERIFICATION BLOCK — REQUIRED FOR EVERY LOCATOR
================================================================================
Use the block matching the mode actually applied.

Mode A — source verified, no cross-check required:

  // Raw source: <input type="email" id="signin-email" placeholder="Email">
  // [SOURCE VERIFIED] file: src/pages/signin.html:41 | attribute: id="signin-email"
  // Pre-condition: [state required for element to exist, or "none"]
  // Source: [TC-ID] — [Business Rule(s)]
  const emailField = page.locator('#signin-email');

Mode A + B — source verified and cross-checked against the live DOM
(mandatory for interpolated, compiled, conditional, or JS-injected markup):

  // Raw source: navbar.innerHTML = `<button data-test-id="logout-btn">Log Out</button>`
  // [SOURCE VERIFIED] file: src/js/navbar.js:37 | attribute: data-test-id="logout-btn"
  // [DOM VERIFIED]    page: /index.html | rendered attribute matches source exactly
  // Pre-condition: loginStatus === "true" — navbar.js:31 branch
  // Source: [TC-ID] — [Business Rule(s)]
  const logoutButton = page.locator('[data-test-id="logout-btn"]');

Mode B — DOM verified, source unavailable for this element:

  // Raw DOM: <div data-test-id="exact-attribute-value" role="region" ...>
  // [DOM VERIFIED] page: /path | attribute: data-test-id="exact-attribute-value"
  // Source unavailable: [reason — vendor bundle / third-party widget / etc.]
  // Pre-condition: [state required for element to exist, or "none"]
  // Source: [TC-ID] — [Business Rule(s)]
  const elementName = page.locator('[data-test-id="exact-attribute-value"]');

Mode C — unverifiable by either route:

  // Raw source: [NOT RETRIEVED — reason]
  // Raw DOM:    [NOT RETRIEVED — reason]
  // [NOT VERIFIED] fallback: getByRole used
  // ⚠ MUST be validated against live DOM before merging to main branch
  // Source: [TC-ID] — [Business Rule(s)]
  const elementName = page.getByRole('heading', { name: 'Element Name' });

================================================================================
DISCREPANCY HANDLING — SOURCE vs. PHASE 1 vs. LIVE DOM
================================================================================
Phase 1 registers deliberately record observed-defective behaviour as the Expected Result.
Source analysis will therefore sometimes appear to contradict Phase 1 when in fact it
confirms the defect. Resolve conflicts as follows — never silently:

  1. The assertion always encodes the Phase 1 Expected Result. Do not "fix" it.
  2. If the source shows behaviour that differs from the Phase 1 Expected Result, add:

       // ⚠ SOURCE DISCREPANCY
       // Phase 1 expects: [quoted expected result]
       // Source shows:    [quoted behaviour] — file:line
       // Assertion follows Phase 1. Raise for triage before merge.

  3. If the live DOM differs from the source (stale build, feature flag, cached bundle),
     the LIVE DOM wins for the locator, and the divergence is recorded:

       // ⚠ SOURCE/DOM DIVERGENCE — locator taken from live DOM
       // Source: [snippet] — file:line
       // DOM:    [snippet] — page: /path

  4. Never resolve a discrepancy by editing the Phase 1 register, by dropping the test,
     or by weakening the assertion (no soft assertions, no try/catch around an expect()).

================================================================================
OUTPUT FORMAT
================================================================================
Produce, in this order:

1. The Phase 1 deliverable: full manual test case register with summary tables

2. The Source Code Inventory (Mode A only), as specified above

3. A Verification Mode Register — one row per distinct element:

   Element | Page/Route | Mode | Source ref (file:line) | DOM checked? | Locator

4. For EACH Phase 1 test case, a Playwright TypeScript test containing:
   - File header comment (Test Case ID, Scenario, Business Rule(s), target website,
     date generated, verification mode(s) used, source files analysed, pages inspected)
   - Imports matching the existing framework conventions
   - Environment variable declarations if required by Preconditions
   - Locator declarations grouped by page, each with its verification block
   - Full test body: step-by-step actions, login flow or documented state seeding if
     needed, one hard assertion per stated fact, conditional element checks with
     pre-condition comments

5. Test cases from the same Section combined into a single spec file (e.g. basket.spec.ts),
   each test case as its own test() block

6. A locator summary table as a comment block at the bottom of EACH spec file:

/*
LOCATOR SUMMARY
Element          | Page      | Mode  | Status              | Source ref        | Locator used                       | Source TC
[Element name]   | [/path]   | A     | SOURCE VERIFIED     | signin.html:41    | #signin-email                      | TC-004
[Element name]   | [/path]   | A+B   | SOURCE + DOM VERIF. | navbar.js:37      | [data-test-id="logout-btn"]        | TC-016
[Element name]   | [/path]   | B     | DOM VERIFIED        | n/a               | [aria-label="Cart"]                | TC-042
[Element name]   | [/path]   | C     | NOT VERIFIED        | n/a               | getByRole('heading', {name:'...'}) | TC-007
Locators marked NOT VERIFIED must be confirmed against the live DOM before this file is
merged. Locators marked SOURCE VERIFIED whose element class requires a DOM cross-check
per the Cross-Check Matrix must not be merged until that cross-check is recorded.
*/

7. A Discrepancy Log listing every ⚠ SOURCE DISCREPANCY and ⚠ SOURCE/DOM DIVERGENCE
   raised across all spec files, with TC ID, file:line, and a one-line description.

8. Optionally, a Test Attribute Recommendations list: elements that had no stable
   locator in source, with the suggested `data-test-id` to add. This is advisory only —
   the generated scripts must run against the current code, not the recommended code.
