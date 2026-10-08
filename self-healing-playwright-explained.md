# Self-Healing Playwright Setup — Line-by-Line Explanation

This document walks through the two files that make up your self-healing
Playwright locator system:

1. **`heal.mjs`** — the Node.js orchestration script (the "loop")
2. **`CLAUDE.md`** — the playbook that tells Claude Code *how* to heal a
   locator when `heal.mjs` invokes it

Together they form a closed loop: run tests → detect selector failures →
hand them to Claude Code with strict rules → re-run → repeat until green
or a retry cap is hit.

---

## Part 1 — `heal.mjs`

### Header comment (lines 1–9)

```js
#!/usr/bin/env node
// Self-healing Playwright loop.
// Run tests -> if selector-type failures -> invoke Claude Code to heal -> re-run
// the failed tests -> repeat until green or the retry cap is hit.
```
- Line 1: shebang — lets the file be run directly as `./heal.mjs` on
  Unix-like systems (the `.mjs` extension already tells Node to treat it
  as an ES module).
- Lines 2–9: plain-English summary of the whole script, plus its
  prerequisites — a Playwright JSON reporter writing to
  `test-results/results.json`, the app running on `localhost:5501`, and
  the Claude Code CLI installed and logged in.

### Imports (lines 11–12)

```js
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
```
- `spawnSync` — runs external commands (`npx playwright test`, `claude`)
  synchronously, blocking until they finish. Synchronous is deliberate
  here: the script is a strict sequential loop (test → heal → test), so
  there's no benefit to async, and it keeps control flow simple.
- `readFileSync` / `existsSync` — used to read and check for the
  Playwright JSON report file.

### Config constants (lines 14–17)

```js
const MAX_RETRIES = 3;
const RESULTS_FILE = "test-results/results.json";
const MAX_TURNS = 30;
```
- `MAX_RETRIES` — the loop will attempt at most 3 heal-and-rerun cycles
  before giving up and escalating to a human.
- `RESULTS_FILE` — where Playwright's JSON reporter writes results;
  this is what the script parses to find failures.
- `MAX_TURNS` — caps how many agentic tool-use "turns" Claude Code is
  allowed to take in a single heal invocation, so a confused agent can't
  loop indefinitely.

### `SELECTOR_PATTERNS` (lines 19–34)

```js
const SELECTOR_PATTERNS = [
  /waiting for (locator|getBy\w+)\(/i,
  /resolved to 0 elements/i,
  /strict mode violation/i,
  /locator\.\w+: Timeout/i,
  /element is not attached to the DOM/i,
  /no element matches selector/i,
];
```
- This is the classifier: a list of regexes matched against Playwright
  error messages to decide "is this a broken-locator failure (healable)
  or a real bug (not healable)?"
- The comment above it (lines 20–26) explains a subtle but important
  detail: Playwright's error wording differs depending on which locator
  *factory* was used. A raw `page.locator()` logs `"waiting for
  locator(...)"`, while semantic methods like `getByRole`, `getByLabel`,
  `getByTestId`, etc. log `"waiting for getByRole(...)"` and so on. The
  first regex, `waiting for (locator|getBy\w+)\(/i`, was written broadly
  enough to catch **both** forms. This matters because the playbook
  (`CLAUDE.md`) upgrades brittle CSS locators into semantic `getByRole`/
  `getByTestId` locators over time — if the regex only matched
  `page.locator()`, then a locator this script already healed once would
  become **invisible** to the healable-failure check the next time it
  broke, since its error message would now read `"waiting for
  getByRole(...)"` instead.
- The remaining five patterns catch strict-mode violations (locator now
  matches multiple elements), zero-match resolutions, general locator
  timeouts, detached elements, and "no element matches" — all symptoms
  of a selector that no longer matches the DOM, as opposed to an
  assertion or app-behavior failure.

### Platform / argv setup (lines 37–42)

```js
const isWin = process.platform === "win32";
const npx = isWin ? "npx.cmd" : "npx";
const EXTRA_ARGS = process.argv.slice(2);
```
- `isWin` / `npx` — on Windows, npm-installed binaries are `.cmd`
  wrapper scripts, so the script picks `npx.cmd` there and plain `npx`
  everywhere else.
- `EXTRA_ARGS` — anything typed after `node heal.mjs` (e.g. a spec file
  path or a `--grep` pattern) is captured here, so you can run
  `node heal.mjs tests/login.spec.ts` and have the healing loop scoped
  to just that file instead of the whole suite.

### `runPlaywright(lastFailedOnly)` (lines 44–59)

```js
function runPlaywright(lastFailedOnly) {
  const args = ["playwright", "test"];
  if (lastFailedOnly) args.push("--last-failed");
  else args.push(...EXTRA_ARGS);
  ...
  const r = spawnSync(npx, args, {
    stdio: "inherit",
    shell: isWin,
    env: { ...process.env, PLAYWRIGHT_HTML_OPEN: "never" },
  });
  return r.status === 0;
}
```
- Builds the `npx playwright test` command. On the very first run it
  passes through any `EXTRA_ARGS` (a scoped run); on retries it instead
  passes `--last-failed`, so only the tests that just failed are re-run
  — much faster than rerunning the full suite each cycle.
- `stdio: "inherit"` — Playwright's own console output (progress,
  errors) streams straight to your terminal.
- `env: { PLAYWRIGHT_HTML_OPEN: "never" }` — the comment above (lines
  49–52) explains why: the configured HTML reporter normally
  auto-opens the report in a browser on failure and then blocks the
  process to *serve* that report, which would hang the script forever
  right after the first failing run. This env var is set only for these
  spawned runs so a normal `npm test` still behaves as configured, while
  the healing loop never gets stuck waiting on a browser tab.
- Returns `true` only if Playwright's exit code was `0` (all tests
  passed).

### `collectFailures()` (lines 61–84)

```js
function collectFailures() {
  if (!existsSync(RESULTS_FILE)) return [];
  ...
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      if (spec.ok) continue;
      const errors = [];
      for (const t of spec.tests ?? [])
        for (const res of t.results ?? [])
          for (const e of res.errors ?? []) if (e.message) errors.push(e.message);
      failures.push({ file: spec.file, title: spec.title, errors });
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const s of report.suites ?? []) walk(s);
  return failures;
}
```
- Guards against a missing or corrupt results file (returns `[]` rather
  than crashing).
- Playwright's JSON report is a **tree**: top-level `suites`, each
  containing nested `suites` and `specs`. `walk()` recurses through that
  tree.
- For every `spec` that isn't `ok`, it drills into `tests → results →
  errors` to pull out each error's `message` string, and records
  `{ file, title, errors }` — everything the classifier and the Claude
  Code prompt will need.
- The `?? []` fallbacks throughout make the walk resilient to slightly
  different/missing shapes in the JSON (e.g. a spec with no `tests`
  array).

### `isSelectorFailure(errors)` (lines 86–87)

```js
const isSelectorFailure = (errors) =>
  errors.some((msg) => SELECTOR_PATTERNS.some((re) => re.test(msg)));
```
- A failing spec can have multiple error messages; this returns `true`
  if **any** of them matches **any** pattern in `SELECTOR_PATTERNS` —
  i.e., "this failure looks like a broken locator, not a real bug."

### `invokeClaudeHeal(failures)` (lines 89–122)

```js
function invokeClaudeHeal(failures) {
  const list = failures.map((f) => `- ${f.file} › ${f.title}`).join("\n");
  const prompt = [ ... ].join(" ");
  ...
  const r = spawnSync(
    "claude",
    [
      "-p",
      "--add-dir", "..",
      "--allowedTools", "Bash(grep*),Read,Edit",
      "--permission-mode", "acceptEdits",
      "--max-turns", String(MAX_TURNS),
    ],
    { input: prompt, stdio: ["pipe", "inherit", "inherit"], shell: isWin }
  );
  return r.status === 0;
}
```
- Builds a bullet list of the failing `file › title` pairs, then a
  prompt instructing Claude Code to read `CLAUDE.md` and the JSON
  report, heal **only** selector-resolution failures per that playbook,
  avoid touching assertions/logic/app source, prefer
  `getByRole`/`getByTestId`, read source before falling back to the
  live DOM, and append an entry to `heal-report.md` per fix. This is
  effectively a compressed pointer into the `CLAUDE.md` rules, repeated
  here so Claude Code has the key constraints even before it opens the
  file.
- The comment (lines 106–109) explains a Windows-specific bug avoidance:
  the prompt is sent over **stdin** rather than as a CLI argument.
  On Windows, `spawnSync`'s `shell: true` just concatenates argv with
  plain spaces (no per-argument quoting), so a long prompt string
  containing spaces or embedded double-quotes (test titles often have
  them) would get shredded by the shell and could swallow/break flags
  like `--add-dir` that come after it. Piping it via `input` sidesteps
  shell-quoting entirely.
- CLI flags passed to `claude`:
  - `-p` — run in "print"/non-interactive mode (headless, scriptable).
  - `--add-dir ..` — grants Claude Code access to the parent directory
    (since app source and tests live in the same repo, per `CLAUDE.md`,
    it may need to read source that's a level up from where tests run).
  - `--allowedTools "Bash(grep*),Read,Edit"` — a tight allow-list: only
    `grep`-family bash commands, file reads, and file edits. Notably
    *no* general shell execution, no write/delete beyond edits, and no
    browser/MCP tools by default — locking the agent to source-reading
    and locator-editing.
  - `--permission-mode acceptEdits` — auto-accepts edit operations
    within that allow-list (no per-edit confirmation prompt), since this
    runs unattended in a loop.
  - `--max-turns 30` — the turn cap discussed above.
- `stdio: ["pipe", "inherit", "inherit"]` — stdin is piped (to carry the
  prompt in), while stdout/stderr are inherited so Claude Code's output
  streams to your terminal live.

### Main loop (lines 124–159)

```js
if (runPlaywright(false)) {
  console.log("\n✅ All tests passed. Nothing to heal.");
  process.exit(0);
}
```
- First, run the full suite (or the scoped `EXTRA_ARGS` subset). If it's
  all green, exit immediately — there's nothing to heal.

```js
for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  const failures = collectFailures();
  if (failures.length === 0) {
    console.log("\n✅ No failures in report — treating as green.");
    process.exit(0);
  }
```
- Otherwise, enter the retry loop (up to `MAX_RETRIES` times). Each
  iteration re-parses the results file. If somehow there are no recorded
  failures (edge case), treat it as success.

```js
  const healable = failures.filter((f) => isSelectorFailure(f.errors));
  const nonHealable = failures.filter((f) => !isSelectorFailure(f.errors));

  if (nonHealable.length) {
    console.log("\n⚠ These failures are NOT locator-type — likely real bugs. Not healing:");
    for (const f of nonHealable) console.log(`   • ${f.file} › ${f.title}`);
  }
  if (healable.length === 0) {
    console.log("\n🛑 No healable (selector) failures. Handing off to a human.");
    process.exit(1);
  }
```
- Splits failures into `healable` (selector-type) and `nonHealable`
  (everything else — likely real bugs). Non-healable failures are
  logged but never sent to Claude Code — this is the script-level
  enforcement of the "never touch real bugs" rule from `CLAUDE.md`.
- If nothing is healable, the script stops and exits with code `1`
  (failure) rather than looping pointlessly.

```js
  console.log(`\n— Heal attempt ${attempt}/${MAX_RETRIES} —`);
  invokeClaudeHeal(healable);

  if (runPlaywright(true)) {
    console.log("\n✅ Previously-failed tests now pass. See heal-report.md.");
    process.exit(0);
  }
}
```
- Invokes Claude Code on just the healable failures, then re-runs
  **only** the previously failed tests (`--last-failed`, via
  `runPlaywright(true)`). If they now pass, exit successfully. If not,
  the `for` loop continues to the next attempt (which re-collects
  failures from the fresh results file — so if some tests healed and
  others didn't, only the still-broken ones get retried).

```js
console.log(`\n🛑 Still failing after ${MAX_RETRIES} attempts. Escalating to a human.`);
process.exit(1);
```
- If all `MAX_RETRIES` attempts are exhausted without success, the
  script gives up and exits with failure code `1`, signaling a human
  needs to step in (e.g. in CI, this would fail the pipeline rather than
  silently merging a bad "fix").

---

## Part 2 — `CLAUDE.md`

This is the playbook that governs *what Claude Code is and isn't allowed
to do* when `heal.mjs` invokes it. It's read directly by the agent (the
`invokeClaudeHeal` prompt explicitly says "Read CLAUDE.md").

### Title and framing (lines 1–4)
```md
# CLAUDE.md — Self-healing locator playbook
You are fixing **broken Playwright locators** after a source-code change.
Read this file fully before editing anything. These rules override convenience.
```
- Sets scope immediately: this is *only* about locator repair, not
  general test maintenance. "These rules override convenience" is a
  guardrail against the agent taking shortcuts.

### Repo layout (lines 6–11)
- States that app source and tests share one repo, gives expected paths
  (`automation/tests/`, `automation/pages/`), the app's local URL
  (`http://localhost:5501`, the Styleup app), and where to find the
  machine-readable last test run (`test-results/results.json` — the
  same file `heal.mjs` parses).

### What you are allowed to change (lines 13–16)
```md
- ONLY locator definitions, and prefer editing them in **page-object files**
  (`tests/pages/**`), not inline in spec files.
- Nothing else.
```
- Narrows the agent's write scope to locator strings, and expresses a
  preference for editing them where they're centrally defined (page
  objects) rather than scattered inline in test specs — keeping changes
  reviewable and consistent with the Page Object Model pattern.

### What you must NEVER change (lines 18–22)
```md
- Assertions, `expect(...)` values, test titles, test logic, waits/timeouts,
  test data, or app source code.
- If a test fails on an assertion or an app behaviour, that is a **candidate real
  bug** — do not touch it. Report it and stop for that test.
```
- An explicit blocklist protecting test integrity: the agent cannot
  weaken assertions to make a test "pass," cannot rewrite test logic,
  and cannot touch application source at all. Assertion/behavioral
  failures are treated as *real bugs to report*, not things to fix or
  paper over.

### Only heal selector-resolution failures (lines 24–31)
```md
Heal a test ONLY when its error is one of:
- "waiting for locator ... " / Timeout waiting for a locator
- locator "resolved to 0 elements"
- "strict mode violation" (locator now matches multiple elements)
- element not found / not attached because the selector no longer matches

If the failure is an assertion mismatch, wrong text/price, navigation error,
network/500, or a real behavioural change — DO NOT heal. Flag it.
```
- This is the human-readable mirror of `SELECTOR_PATTERNS` in
  `heal.mjs` — the same classification logic, expressed as instructions
  for the agent rather than a regex. Keeping both in sync matters: if
  one is updated without the other, the script's pre-filter and the
  agent's own judgment could disagree.

### How to find the correct new locator (lines 33–46)
```md
The developer changed the element in the source, so the new element IS in the
current source. Find it there first.
1. Read / analyse the source (primary) — ...
2. grep to pinpoint — ...
3. live DOM (fallback — ONLY if source ≠ rendered) — ...
```
- Establishes a strict priority order for locating the replacement
  element:
  1. **Read the current source** for the same element by purpose/context
     (e.g., "the search input inside the nav").
  2. **Grep** for nearby markup/static text to confirm the new selector
     actually exists — explicitly warning "never invent one."
  3. **Only** fall back to inspecting the live rendered DOM (via
     Playwright MCP tooling) if the app transforms class names at build
     time (CSS Modules, styled-components, hashed classes), where the
     source class and the rendered class genuinely differ. For an app
     like Styleup — plain HTML/CSS/JS — this step is called out as
     unnecessary, since source and rendered markup match.
- The last line of this section — "If several elements look similar and
  you can't tell which one the old locator meant, treat it as low
  confidence and flag it" — foreshadows the confidence gate below.

### Heal toward resilient locators (lines 48–54)
```md
1. `getByRole(...)` (with name) — best
2. `getByLabel(...)` / `getByPlaceholder(...)` / `getByText(...)`
3. `getByTestId(...)` if a `data-testid` exists
4. CSS/class selector — last resort only
```
- A preference ladder for the *replacement* locator's style, favoring
  Playwright's accessibility-tree-based, semantic locators over brittle
  CSS/class selectors — the same locators that `heal.mjs`'s
  `SELECTOR_PATTERNS` regex was specifically widened to still recognize
  later. If a `data-testid` would clearly help, the agent is told to
  *suggest* it in the report rather than add it to app source itself
  (respecting the "never touch app source" rule above).

### Confidence gate (lines 56–58)
```md
If you are not confident the new locator maps to the *same element the test
intended*, STOP and flag it. A wrong "fix" that makes a test pass is worse than a
red test. Never guess.
```
- The core safety principle of the whole system: a false-positive heal
  (one that makes a test pass by matching the *wrong* element) is worse
  than an honest failure, because it hides a real problem behind a green
  checkmark. The agent is told to stop and flag rather than guess.

### Output (lines 60–67)
```md
After editing, write/append a heal report to `heal-report.md` with, per test:
- test file + title
- old locator → new locator
- why (which diff line / which DOM evidence)
- confidence (high / medium)
Leave all edits **staged but uncommitted** (or on a `heal/*` branch). A human
reviews before merge. Do not push to main.
```
- Requires an auditable trail for every heal: what changed, why, and
  how confident the agent was. And critically, all edits stay
  **uncommitted / on a branch** — a human reviews and merges. The
  playbook never lets the agent push directly to `main`, keeping a
  person in the loop even though the day-to-day healing is automated.

---

## How the two files fit together

| Stage | Handled by |
|---|---|
| Run the test suite | `heal.mjs` → `runPlaywright()` |
| Parse results, split real bugs vs. broken locators | `heal.mjs` → `collectFailures()` / `isSelectorFailure()` |
| Decide *how* to fix a broken locator | `CLAUDE.md` (read by Claude Code) |
| Enforce scope (locators only, no app/test-logic edits) | Both — `heal.mjs`'s `--allowedTools` restricts *what tools* the agent can use; `CLAUDE.md` restricts *what it should do* with them |
| Re-run and retry | `heal.mjs` loop, up to `MAX_RETRIES` |
| Human review before merge | `CLAUDE.md`'s output rule (staged/branch only) |

`heal.mjs` is the mechanical, deterministic wrapper: it decides *when*
to call the agent and *which* failures are even eligible. `CLAUDE.md` is
the judgment layer: it governs the agent's reasoning once invoked —
where to look for the new locator, what style to prefer, and when to
refuse rather than guess.
