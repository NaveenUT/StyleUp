# CLAUDE.md — Self-healing locator playbook

You are fixing **broken Playwright locators** after a source-code change.
Read this file fully before editing anything. These rules override convenience.

## Repo layout
- App source and Playwright tests live in the **same git repo** (this folder).
- Tests / page objects are under: `automation/tests/` and `automation/pages/`  (adjust if different).
- App under test runs at: `http://localhost:5501`  (Styleup).
- Machine-readable last run: `test-results/results.json`.

## What you are allowed to change
- ONLY locator definitions, and prefer editing them in **page-object files**
  (`tests/pages/**`), not inline in spec files.
- Nothing else.

## What you must NEVER change
- Assertions, `expect(...)` values, test titles, test logic, waits/timeouts,
  test data, or app source code.
- If a test fails on an assertion or an app behaviour, that is a **candidate real
  bug** — do not touch it. Report it and stop for that test.

## Only heal selector-resolution failures
Heal a test ONLY when its error is one of:
- "waiting for locator ... " / Timeout waiting for a locator
- locator "resolved to 0 elements"
- "strict mode violation" (locator now matches multiple elements)
- element not found / not attached because the selector no longer matches

If the failure is an assertion mismatch, wrong text/price, navigation error,
network/500, or a real behavioural change — DO NOT heal. Flag it.

## How to find the correct new locator (in this order)
The developer changed the element in the source, so the new element IS in the
current source. Find it there first.
1. **Read / analyse the source (primary)** — take the failing test's old locator,
   identify the *same element* in the current source by its purpose and context
   (e.g. the search input inside the nav, by nearby text / label / structure), and
   read its new class / id / attributes / role. Update the locator to match.
2. **grep to pinpoint** — search the source files for the surrounding markup or
   nearby static text to locate that element quickly and confirm the new selector
   actually exists in source (never invent one).
3. **live DOM (fallback — ONLY if source ≠ rendered)** — if this app transforms
   class names at build time (CSS Modules, styled-components, hashed/dynamic
   classes) so the class in source is NOT what renders, then use the Playwright MCP
   tools to open `http://localhost:5501` and read the *rendered* DOM, because
   Playwright matches the rendered page, not the source. For plain HTML/CSS/JS this
   step is unnecessary — the source class is the rendered class.

If several elements look similar and you can't tell which one the old locator
meant, treat it as low confidence and flag it (see the confidence gate).

## Heal toward resilient locators (do not just swap one brittle class for another)
Preference order when writing the replacement:
1. `getByRole(...)` (with name) — best
2. `getByLabel(...)` / `getByPlaceholder(...)` / `getByText(...)`
3. `getByTestId(...)` if a `data-testid` exists
4. CSS/class selector — last resort only
If a `data-testid` would clearly prevent future breakage, note it in the report
as a suggestion (do not edit app source to add it yourself).

## Confidence gate
If you are not confident the new locator maps to the *same element the test
intended*, STOP and flag it. A wrong "fix" that makes a test pass is worse than a
red test. Never guess.

## Output
After editing, write/append a heal report to `heal-report.md` with, per test:
- test file + title
- old locator → new locator
- why (which diff line / which DOM evidence)
- confidence (high / medium)
Leave all edits **staged but uncommitted** (or on a `heal/*` branch). A human
reviews before merge. Do not push to main.
