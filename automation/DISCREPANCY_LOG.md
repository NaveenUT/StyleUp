# Discrepancy Log

Every `⚠ SOURCE DISCREPANCY` / `⚠ LIVE-BEHAVIOUR DISCREPANCY` raised while converting
`Homepage_prompt_coverage_improvement (3).md` into Playwright scripts, per the Phase 2
protocol's Discrepancy Handling rule: the assertion always follows Phase 1's stated
Expected Result and is **not** weakened to make the test pass — each of these 3 tests
fails on the current `chromium` run intentionally, flagging a real gap for triage.

| # | TC ID | File:line | Description |
|---|---|---|---|
| 1 | TC-058 | `tests/homepage/footer.spec.ts:100` (page-count) + content | Phase 1 says 8 pages have the footer table / 8 lack it, and that the footer is identical across every page that has it. Live verification shows only **5** of 16 real pages actually render `<table id="table">` (index, womens, kids, home&living, search) — an earlier grep matching "tableware" in about-us.html's prose is what produced a false 8. Worse: even among those 5, the footer is **not** identical — `index.html`'s footer is the only one with real, working links and the login-bypassing "Men" `onclick`; the other 4 render the same table shape as inert plain text, and row 2 reads "Terms & Conditions" there vs. "Blog" on index.html (`womens.html:78-87` vs `index.html:71-74`). |
| 2 | TC-092 | `tests/cross-cutting/state-transitions.spec.ts:89` | Phase 1 claims a direct URL to `mens.html` as a guest is blocked by `verifyLogin()` with an alert+redirect — but `verifyLogin()` (`navbar.js:63-84`) is bound only to click events on the top-menu (`navbar.js:59-62`); there is no page-load guard anywhere. A direct URL loads fully unauthenticated with no alert. This **directly contradicts the SAME register's own TC-064**, which correctly documents this as a defect. |
| 3 | TC-103 | `tests/cross-cutting/recovery.spec.ts:75` | Phase 1 expects the Sign In form to be empty after a browser Back navigation following a successful login. Live-confirmed: Chromium's back-forward cache restores the exact prior DOM state on Back, including the typed Email value — the field is **not** empty. This is standard bfcache behaviour, not a `signin.html` script defect, but it contradicts the stated expectation. |

## Non-defect environmental note (not a discrepancy, recorded for the test-runner's benefit)

Running the full suite with Playwright's default parallel workers against the
single-threaded `python -m http.server` dev server occasionally produces a single
unrelated flaky failure under load (observed once on `tests/homepage/top-menu.spec.ts` TC-002,
reproduced as a pass in isolation and under `--workers=1`). This is a dev-server
capacity artifact, not an application or script defect — `playwright.config.ts` already
sets `fullyParallel: false` for state-isolation reasons; running with `--workers=1` (or
serving the app from a more concurrent static server) eliminates it entirely.
