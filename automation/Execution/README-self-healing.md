# Self-healing Playwright locators

When a source-code change renames an element (e.g. `nav-search-field` →
`searchfield`), the tests that use that locator fail. This setup makes Claude Code
detect those failures, fix the locators, and re-run the failed tests — while
leaving real bugs alone.

## How it works
1. `heal.mjs` runs the Playwright suite.
2. It reads the JSON report and looks at each failure's error message.
3. Only **selector-resolution** failures (locator resolved to 0 elements, timeout
   waiting for a locator, strict-mode violation) are healed. Assertion / behaviour
   failures are printed and left untouched — they may be real bugs.
4. For healable failures it calls `claude -p` with `CLAUDE.md` as the playbook.
   Claude finds the new locator, updates it in the page objects, and writes a
   `heal-report.md`.
5. It re-runs `--last-failed`. Repeats up to the retry cap, then stops.

Fixes land **staged/uncommitted** with a report for you to review — nothing is
pushed automatically.

## Finding the new locator
- **Primary — read the source.** The changed element is in the current source, so
  Claude reads it, matches the element by purpose/context, and updates the locator.
  For plain HTML/CSS/JS this is all that's needed.
- **Fallback — live DOM.** Only used if the app transforms class names at build
  time (CSS Modules, styled-components, hashed classes) so the source class isn't
  what renders. Claude opens the running app via the Playwright MCP server and
  reads the rendered DOM. Requires the MCP setup below.

## Guardrails
- Heals selector failures only; never edits assertions, test logic, or app source.
- Edits locators in page objects, preferring `getByRole` / `getByTestId` over raw
  classes so the fix is more resilient than what it replaced.
- Confidence gate: if it can't tell which element the old locator meant, it flags
  instead of guessing.
- Retry cap (default 3), then escalates to a human.

## Files
| File | Where | Purpose |
|------|-------|---------|
| `CLAUDE.md` | repo root | The healing playbook Claude reads each run. Edit the paths at the top to match your `tests/` layout. |
| `heal.mjs` | repo root | The orchestrator loop. |
| `README-self-healing.md` | repo root | This file. |

## Setup
1. Put `CLAUDE.md` and `heal.mjs` in the repo root (same folder as source + tests).

2. Edit the paths near the top of `CLAUDE.md` to match your real structure
   (test folder, page-object folder, app URL).

3. Add the JSON reporter to `playwright.config.ts`:
   ```ts
   reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
   use: { baseURL: 'http://localhost:5501' },
   ```

4. Add a script to `package.json`:
   ```json
   "scripts": { "heal": "node heal.mjs" }
   ```

5. (For the live-DOM fallback) connect the Playwright MCP server to Claude Code:
   ```
   claude mcp add playwright npx @playwright/mcp@latest
   ```

## Run
Start the app at `http://localhost:5501`, then:
```
npm run heal
```

## Tuning
In `heal.mjs`:
- `MAX_RETRIES` — heal attempts before escalating (default 3).
- `RESULTS_FILE` — must match the reporter's `outputFile`.
- `MAX_TURNS` — caps Claude Code's tool calls per heal.
- `SELECTOR_PATTERNS` — the error patterns treated as "healable". Widen or narrow
  to control what counts as a locator failure vs a real bug.
