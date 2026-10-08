AUTOMATIC CONVERSION TO PLAYWRIGHT SCRIPTS
(v3 — source-code-aware + framework-compliant)

Role: As a Senior Automation Engineer with 10 years of experience, automate the
E-commerce website using the MANDATED Playwright + TypeScript framework defined in the
"TECHNOLOGY STACK", "MANDATED FRAMEWORK STRUCTURE", and "FRAMEWORK ARCHITECTURE" sections
below. Every generated file must land in the prescribed folder, follow the Page Object
Model, and consume the prescribed fixtures. Do NOT generate standalone Playwright scripts
in the default/flat layout.

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
  - Section         → determines the sub-folder under `tests/` and the spec file the
                       generated test belongs in, and which `pages/` class owns its locators

Do NOT invent steps, elements, or outcomes beyond what the document test case states.
If a document step is ambiguous, flag it explicitly in a comment rather than assuming intent.

================================================================================
PLACEHOLDER RESOLUTION — DO THIS BEFORE ANY FILE IS NAMED
================================================================================
The framework definition below is application-agnostic. Resolve these placeholders once,
state the resolved values at the top of the output, and use them consistently everywhere:

  <project-root>  → the repository root folder name
  <app>           → the application-scope tag token (short, lower-case)
  <Page>          → PascalCase page name, one per page in scope
  <feature>       → lower-case test folder name, derived from the Section
  <Feature>       → PascalCase spec file name, derived from the Section

If an existing repository is in scope, read its current folder names, class names, prefix
convention, and application tag from the repository itself and adopt them. Only fall back
to the generic names below when the folder does not yet exist.

================================================================================
TECHNOLOGY STACK — FIXED, NOT NEGOTIABLE
================================================================================
| Tool             | Purpose                              |
|------------------|--------------------------------------|
| Playwright       | Browser automation framework         |
| TypeScript       | Strongly typed JavaScript            |
| Node.js          | Runtime environment                  |
| dotenv           | Environment variable management      |
| Monocart Reporter| Rich HTML test reporting             |

Do not introduce any additional test runner, assertion library, BDD layer, or reporter.
Do not substitute JavaScript for TypeScript. All generated files are `.ts`.

================================================================================
MANDATED FRAMEWORK STRUCTURE — ALL GENERATED FILES MUST FIT THIS LAYOUT
================================================================================
This layout is application-agnostic. `<project-root>`, `<Page>`, and `<feature>` are
placeholders to be resolved from the application under test and the Phase 1 register —
they are not literal names.

<project-root>/
├── pages/
│   ├── BasePage.ts                 # Base class shared by all pages
│   ├── LoginPage.ts                # Login page actions & locators
│   ├── HomePage.ts                 # Home page actions & locators
│   └── <Page>Page.ts               # One class per page in scope
│
├── tests/
│   └── <feature>/
│       └── <Feature>.spec.ts       # One spec per Section
│
├── fixtures/
│   └── customFixtures.ts           # Extended Playwright fixtures
│
├── utils/
│   ├── config.ts                   # Central configuration
│   └── waitHelpers.ts              # Reusable wait utilities
│
├── test-data/
│   └── testData.ts                 # Test input data
│
├── .env                            # Local secrets (excluded from Git)
├── .env.example                    # Template for environment variables
├── .gitignore
├── playwright.config.ts
├── tsconfig.json
└── package.json

NAMING CONVENTIONS:
  - Page class file  → `<Page>Page.ts`, PascalCase, suffix `Page` (LoginPage, CartPage,
                        CheckoutPage, ProductDetailsPage)
  - Page class name  → matches its filename exactly
  - Spec file        → `<Feature>.spec.ts`, PascalCase feature name
  - Test folder      → `tests/<feature>/`, lower-case, derived from the Section
  - Fixture name     → camelCase of the page class (`LoginPage` → `loginPage`)
  - If the existing repository already applies a project prefix to page and spec files
    (e.g. `<PRJ>_LoginPage.ts`), follow the prefix already in use consistently; do not
    introduce a prefix where none exists, and do not mix prefixed and unprefixed names.

PLACEMENT RULES — apply to every artefact produced:

  - Locators and page-specific actions        → `pages/<Page>Page.ts`
  - New page in scope                         → new class in `pages/`, extending BasePage
  - Test bodies (test.describe / test blocks) → `tests/<feature>/<Feature>.spec.ts`
  - Page-object instantiation & setup wiring  → `fixtures/customFixtures.ts`
  - Timeouts, URLs, env-var reads             → `utils/config.ts`
  - Retry / wait / polling helpers            → `utils/waitHelpers.ts`
  - Usernames, search terms, expected strings → `test-data/testData.ts`
  - Credentials, base URL, global timeout     → `.env`, mirrored in `.env.example`

The `Section` field of each test case determines the sub-folder under `tests/` and the
spec filename. All test cases in the same Section share one spec file.

================================================================================
FRAMEWORK ARCHITECTURE — PAGE OBJECT MODEL
================================================================================
BasePage
│
└── setup() → Navigates to BASE_URL
    │
    ├── LoginPage
    │   └── Login actions and validations
    │
    ├── HomePage
    │   └── Post-login actions and validations
    │
    └── <Page>Page
        └── Actions and validations for that page

One page class per page in scope. Every class sits at the same level in the hierarchy —
extend `BasePage`, never another page class.

DESIGN PRINCIPLES — enforced on every generated file:
  - All page classes extend `BasePage`
  - Locators are declared and maintained INSIDE page classes only
  - Business actions are implemented as reusable, named methods on the page class
  - Tests interact ONLY with page methods
  - Direct locator usage inside test files is forbidden
  - `BasePage.setup()` performs navigation to `BASE_URL`; page classes do not re-implement it

--------------------------------------------------------------------------------
CUSTOM FIXTURES
--------------------------------------------------------------------------------
Custom fixtures extend Playwright's base `test` and handle page initialisation
automatically. Spec files import `test` from `fixtures/customFixtures.ts` — never from
`@playwright/test` directly.

| Fixture      | Purpose                                          |
|--------------|--------------------------------------------------|
| loginPage    | Creates LoginPage and executes setup()           |
| homePage     | Creates HomePage and executes setup()            |
| <page>Page   | Creates <Page>Page and executes setup()          |

Usage:
  test('Sample Test', async ({ loginPage, homePage }) => {
    // Use page objects directly
  });

Benefits this preserves — do not undo them:
  - Eliminates repetitive page object instantiation
  - Centralised setup management
  - Cleaner and more maintainable test cases

When a new page class is added, a matching fixture MUST be added to
`fixtures/customFixtures.ts` in the same pattern, and the fixture table above extended
in the output.

--------------------------------------------------------------------------------
CONFIGURATION & ENVIRONMENT VARIABLES
--------------------------------------------------------------------------------
Environment-specific values are maintained in `.env` and read through `utils/config.ts`.

| Variable      | Description        |
|---------------|--------------------|
| BASE_URL      | Application URL    |
| APP_USERNAME  | Login username     |
| APP_PASSWORD  | Login password     |
| TIMEOUT       | Global timeout     |

Example (values are placeholders — substitute the actual application's):
  BASE_URL=https://<application-host>/<landing-path>/
  APP_USERNAME=<username>
  APP_PASSWORD=<password>
  TIMEOUT=60000

Note: `APP_USERNAME` is used instead of `USERNAME` to avoid conflicts with Windows system
environment variables. Preserve this naming — do not "correct" it to `USERNAME`.

If a Precondition requires a credential or URL not already in `.env`, add the variable to
BOTH `.env.example` and the config module, and reference it by name. Never inline a
credential, base URL, or timeout literal in a page class or spec file.

--------------------------------------------------------------------------------
TEST ORGANISATION & TAGGING
--------------------------------------------------------------------------------
Tests are grouped in `test.describe`, with shared setup in `beforeEach`:

  test.describe('<Section name>', () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.setup();
    });

    test(
      '<TC-ID>: <Scenario> @<app> @regression @smoke',
      async ({ homePage }) => {
        // Test steps
      }
    );
  });

Tags are embedded WITHIN the test title (not in a tag option object) and used for
selective execution:

| Tag         | Purpose                                              |
|-------------|------------------------------------------------------|
| @<app>      | Application-scope tag — all tests for this app        |
| @demo       | Demo and showcase tests                              |
| @smoke      | Critical sanity validation                           |
| @regression | Full regression suite                                |

`@<app>` is a single short lower-case token identifying the application under test
(e.g. `@styleup`, `@shop`). Choose it once, state it at the top of the output, and use it
unchanged across every generated file. If the repository already uses an application tag,
reuse that one rather than inventing a new one.

Tag assignment rule for converted test cases:
  - Every generated test carries the application tag (`@<app>`) and `@regression`
  - Add `@smoke` only where the Phase 1 test case is a critical happy path
  - Add `@demo` only where the test case is explicitly nominated for showcase
  - The test title format is: `'<TC-ID>: <Scenario> @<app> @regression [@smoke] [@demo]'`

Execute by tag:
  npx playwright test --grep @smoke
  npx playwright test --grep @regression
  npx playwright test --grep @<app>

--------------------------------------------------------------------------------
REPORTING
--------------------------------------------------------------------------------
Two reports are generated per execution — both must remain configured in
`playwright.config.ts`:

| Reporter              | Output Location            |
|-----------------------|----------------------------|
| Playwright HTML Report| playwright-report/         |
| Monocart Report       | monocart-report/index.html |

Monocart features to preserve: detailed execution steps, failure screenshots, execution
duration, trace integration, enhanced visualisation. Use `test.step()` around each mapped
Phase 1 step so the step detail surfaces in the report.

--------------------------------------------------------------------------------
NPM COMMANDS
--------------------------------------------------------------------------------
| Command                 | Description                          |
|-------------------------|--------------------------------------|
| npm test                | Execute all tests in headless mode   |
| npm run test:headed     | Execute tests with browser visible   |
| npm run test:debug      | Run tests in debug mode              |
| npm run test:<feature>  | Execute one feature folder's tests   |
| npm run report          | Open Playwright HTML report          |
| npm run report:monocart | Open Monocart report                 |

If a new feature folder is added under `tests/`, propose the matching `npm run test:<feature>`
script rather than instructing the user to type a raw `npx` command.

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

FRAMEWORK COMPLIANCE PROHIBITIONS
  ✗ NEVER place a locator, selector, or `page.locator()` call inside a spec file
  ✗ NEVER instantiate a page object with `new` inside a test — use the fixture
  ✗ NEVER import `test` or `expect` from `@playwright/test` in a spec file —
    import from `fixtures/customFixtures.ts`
  ✗ NEVER create a page class that does not extend `BasePage`
  ✗ NEVER re-implement navigation to BASE_URL inside a page class — `setup()` owns it
  ✗ NEVER add a page class without adding its matching fixture
  ✗ NEVER hardcode a URL, username, password, or timeout value in a page class or spec —
    read it from `.env` via `utils/config.ts`
  ✗ NEVER rename `APP_USERNAME` / `APP_PASSWORD` to `USERNAME` / `PASSWORD`
  ✗ NEVER inline test input data in a spec — put it in `test-data/testData.ts`
  ✗ NEVER use `page.waitForTimeout()` as a synchronisation mechanism — use
    `utils/waitHelpers.ts` or a web-first assertion
  ✗ NEVER put tags in a `{ tag: [...] }` option object — tags belong in the test title
  ✗ NEVER emit a file outside the mandated structure, and never invent a new top-level
    folder (no `helpers/`, `common/`, `src/`, or `support/`)
  ✗ NEVER commit or reference `.env` contents in generated code or output
  ✗ NEVER remove or replace the Monocart or Playwright HTML reporter configuration
  ✗ NEVER write a test that depends on another test's execution order or leftover state

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

⚠ PLACEMENT: every verification block below sits in the PAGE CLASS
  (`pages/<Page>Page.ts`) immediately above the locator it documents — never in a spec
  file. Spec files contain no locators and therefore no verification blocks. Where the
  examples show a bare `const`, the real declaration is a private readonly class member
  or a locator getter on the page class.

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

4. A File Manifest — every file to be created or modified, with its exact path in the
   mandated structure and a one-line reason:

   Path                                  | New/Modified | Reason
   pages/CartPage.ts                     | New          | Owns cart locators + actions
   fixtures/customFixtures.ts            | Modified     | Adds cartPage fixture
   tests/cart/Cart.spec.ts               | New          | TC-041..TC-058
   test-data/testData.ts                 | Modified     | Adds cart search terms
   .env.example                          | Modified     | Adds APP_USERNAME_ADMIN

5. For EACH page in scope, a PAGE CLASS in `pages/` containing:
   - File header comment (page name, route, verification mode(s) used, source files
     analysed, pages inspected, date generated)
   - `export class <Page>Page extends BasePage`
   - Locator declarations as private readonly members, each preceded by its verification
     block, grouped logically within the class
   - Business action methods named after the business step they perform
     (e.g. `filterByCustomerName(name: string)`), each returning a Promise
   - Assertion-helper methods where an Expected Result checks page-owned state
   - No `test()`, no `expect()` on cross-page concerns, no hardcoded URLs or credentials

6. The updated `fixtures/customFixtures.ts` — one fixture per page class, each
   instantiating the page object and executing `setup()`, following the existing pattern.

7. For EACH Section, a SPEC FILE at `tests/<feature>/<Name>.spec.ts` containing:
   - File header comment (Section, Test Case IDs covered, Business Rule(s), target
     website, date generated, verification mode(s) used)
   - `import { test, expect } from '../../fixtures/customFixtures';` — never from
     `@playwright/test`
   - A single `test.describe` for the Section, with shared Preconditions in `beforeEach`
   - One `test()` block per Phase 1 test case, titled
     `'<TC-ID>: <Scenario> @<app> @regression [@smoke] [@demo]'`
   - Each mapped Phase 1 step wrapped in a `test.step()` whose name is the business-language
     step text, calling page methods only
   - One hard assertion per stated fact from the Expected Result
   - Documented state seeding where a Precondition is seeded rather than driven
   - Zero locators, zero `page.locator()` calls, zero `new <Page>Page()` instantiations

8. A locator summary table as a comment block at the bottom of EACH PAGE CLASS
   (not the spec file):

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

9. A Discrepancy Log listing every ⚠ SOURCE DISCREPANCY and ⚠ SOURCE/DOM DIVERGENCE
   raised across all page classes and spec files, with TC ID, file:line, and a one-line
   description.

10. Optionally, a Test Attribute Recommendations list: elements that had no stable
    locator in source, with the suggested `data-test-id` to add. This is advisory only —
    the generated scripts must run against the current code, not the recommended code.

11. A Framework Compliance Checklist, confirmed line by line before the output is
    considered complete:

    [ ] Every new page class extends BasePage
    [ ] Every locator lives in a page class, none in a spec file
    [ ] Every page class has a matching fixture in fixtures/customFixtures.ts
    [ ] No spec file imports from '@playwright/test'
    [ ] No spec file contains `new <Page>Page(`
    [ ] No hardcoded URL, username, password, or timeout outside .env / utils/config.ts
    [ ] Every test title carries @<app> and @regression, plus @smoke/@demo where applicable
    [ ] Every mapped Phase 1 step is wrapped in a test.step()
    [ ] All test cases from one Section are in one spec file under tests/<feature>/
    [ ] Test data is referenced from test-data/testData.ts, not inlined
    [ ] Wait logic uses utils/waitHelpers.ts, not raw waitForTimeout
    [ ] Both Playwright HTML and Monocart reporters remain configured
    [ ] .env.example updated for every new variable introduced
