#!/usr/bin/env node
// Self-healing Playwright loop.
// Run tests -> if selector-type failures -> invoke Claude Code to heal -> re-run
// the failed tests -> repeat until green or the retry cap is hit.
//
// Usage:  node heal.mjs
// Requires: Playwright JSON reporter writing to RESULTS_FILE (see playwright.config).
//           The app under test running at http://localhost:5501 (or a webServer config).
//           Claude Code CLI installed and authenticated.

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

// ---------------------------- config ----------------------------
const MAX_RETRIES = 3;
const RESULTS_FILE = "test-results/results.json";
const MAX_TURNS = 30; // cap Claude Code's agentic turns per heal

// Error messages that mean "locator no longer matches" -> safe to heal.
// Playwright's call-log wording depends on the locator factory used — a raw
// page.locator() call logs "waiting for locator(...)", but getByRole/getByLabel/
// getByPlaceholder/getByText/getByTestId/getByAltText/getByTitle each log
// "waiting for <methodName>(...)" instead. Since healing upgrades locators toward
// those semantic methods, the pattern must recognize all of them, not just
// page.locator() — otherwise a locator this script itself heals today becomes
// unrecognizable as "healable" the next time it breaks.
const SELECTOR_PATTERNS = [
  /waiting for (locator|getBy\w+)\(/i,
  /resolved to 0 elements/i,
  /strict mode violation/i,
  /locator\.\w+: Timeout/i,
  /element is not attached to the DOM/i,
  /no element matches selector/i,
];
// ----------------------------------------------------------------

const isWin = process.platform === "win32";
const npx = isWin ? "npx.cmd" : "npx";

// Extra argv passed after `npm run heal --` (e.g. a spec file or --grep pattern),
// so healing also works when scoped to a single test script instead of the full suite.
const EXTRA_ARGS = process.argv.slice(2);

function runPlaywright(lastFailedOnly) {
  const args = ["playwright", "test"];
  if (lastFailedOnly) args.push("--last-failed");
  else args.push(...EXTRA_ARGS);
  console.log(`\n▶ ${npx} ${args.join(" ")}`);
  // The configured html reporter auto-opens the report on failure and then blocks
  // the process (serving it) until interrupted — which would hang this script right
  // after the first failing run, before it ever reaches the heal step. Suppress just
  // for these spawned runs; a normal `npm test` still opens the report as configured.
  const r = spawnSync(npx, args, {
    stdio: "inherit",
    shell: isWin,
    env: { ...process.env, PLAYWRIGHT_HTML_OPEN: "never" },
  });
  return r.status === 0;
}

// Walk the Playwright JSON report and collect failing specs + their error text.
function collectFailures() {
  if (!existsSync(RESULTS_FILE)) return [];
  let report;
  try {
    report = JSON.parse(readFileSync(RESULTS_FILE, "utf8"));
  } catch {
    return [];
  }
  const failures = [];
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

const isSelectorFailure = (errors) =>
  errors.some((msg) => SELECTOR_PATTERNS.some((re) => re.test(msg)));

function invokeClaudeHeal(failures) {
  const list = failures
    .map((f) => `- ${f.file} › ${f.title}`)
    .join("\n");
  const prompt = [
    "Playwright tests are failing because source locators changed.",
    `Read CLAUDE.md and the JSON report at ${RESULTS_FILE}, then heal ONLY the`,
    "selector-resolution failures per that playbook. Do not touch assertions,",
    "test logic, or app source. Edit locators in page objects, prefer",
    "getByRole/getByTestId. Find the new locator by reading the current SOURCE",
    "(the changed element is there) and grepping for it; only open the live DOM via",
    "Playwright MCP if the app hashes/transforms class names at build time. Append a",
    "heal-report.md entry per fix. Failing tests:",
    list,
  ].join(" ");

  console.log("\n🩹 Invoking Claude Code to heal locators…");
  // Prompt is piped via stdin, not passed as a CLI arg: on Windows, spawnSync's
  // shell:true just joins argv with plain spaces (no per-arg quoting), so a long
  // prompt containing spaces/quotes (test titles can have embedded ") gets shredded
  // and swallows flags like --add-dir that follow it.
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

// ------------------------------ loop ------------------------------
if (runPlaywright(false)) {
  console.log("\n✅ All tests passed. Nothing to heal.");
  process.exit(0);
}

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  const failures = collectFailures();
  if (failures.length === 0) {
    console.log("\n✅ No failures in report — treating as green.");
    process.exit(0);
  }

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

  console.log(`\n— Heal attempt ${attempt}/${MAX_RETRIES} —`);
  invokeClaudeHeal(healable);

  if (runPlaywright(true)) {
    console.log("\n✅ Previously-failed tests now pass. See heal-report.md.");
    process.exit(0);
  }
}

console.log(`\n🛑 Still failing after ${MAX_RETRIES} attempts. Escalating to a human.`);
process.exit(1);
