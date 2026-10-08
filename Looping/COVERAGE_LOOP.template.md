# COVERAGE_LOOP.template.md — per-page runbook for Claude Code

Generate manual test cases for **one page**, score them against the master register, and
keep closing gaps until coverage reaches **90% or higher** — or a safety limit stops the loop.

This template is run **once per page**. Everything specific to the page lives in the
`## THIS RUN` block below; everything under `## The process` is identical across all pages.
The orchestrator fills in one head and hands the filled file to a subagent.

---

## THIS RUN   ← the only block that changes per page

```
PAGE            = <e.g. Sign Up>
SOURCE_FILES    = <space-separated, exact on-disk casing — e.g. signup.html>
CORE_MODULES    = <master prefixes for this page — e.g. REG>
CORE_CASES      = <count — e.g. 24>
PROMPT          = <generation prompt filename — e.g. prompt_1_v5.md>
ID_PREFIX       = <page prefix for TC IDs — e.g. SIGNUP>
REGISTER        = <output — e.g. REGISTER_signup.md>
COVERAGE        = <output — e.g. COVERAGE_signup.md>
CROSSCUT_OWNED  = <master IDs of cross-cutting cases THIS page owns, from the ownership map.
                   May be empty. e.g. ACC-014 ACC-019 SEC-007>
```

> **Never score a cross-cutting case that is not in CROSSCUT_OWNED.** Ownership is decided
> once, centrally, in `CROSSCUT_OWNERSHIP.md`. This prevents the same ACC/SEC/SEO case being
> counted by two pages and corrupting the combined denominator.

---

## Files

| File | Role |
|---|---|
| `{PROMPT}` | Generation prompt. Defines the test case format and techniques. |
| `Manual_TestCase_Dump.md` | Master register, 797 cases. **360 KB — never read whole, grep it.** |
| `src/` | Application source. Read only `{SOURCE_FILES}` for this run. |
| `{REGISTER}` | Output — the test cases. Created in step 1, appended to after. |
| `{COVERAGE}` | Output — the score, the uncovered list, **and the append-only round-by-round trace**. Rewritten each round, **but the round trace must carry every prior row forward** — see Step 2. |

---

## Step 0 — Sanity check the master (do this once, fail loud)

Before scoring anything, prove the master is readable in the format the greps expect:

```bash
grep -cE "^\| {CORE_MODULES}-[0-9]+" Manual_TestCase_Dump.md
```

- If this prints the expected `{CORE_CASES}` (± a few), continue.
- If it prints `0`, **STOP and report**: "Manual_TestCase_Dump.md did not match the
  `^| {CORE_MODULES}-NNN` row format — greps would misread every case as ABSENT. Halting so
  the denominator is not corrupted." Do not proceed. Do not guess.

Also verify every source file exists at the exact casing given:

```bash
for f in {SOURCE_FILES}; do test -f "src/$f" && echo "OK $f" || echo "MISSING $f"; done
```

Any `MISSING` line halts the run with that filename — a missing file silently becomes a false
ABSENT verdict, which is the one failure this loop must never make.

---

## The process

> **Round counter.** This loop is a numbered sequence of rounds. Round 1 is the first
> generate-and-score pass; every return trip through Step 4 → Step 2 is the next round. The
> whole point of this runbook is that at the end you can say, in one line per round, *how many
> times this page looped and what each loop bought you.* That lives in the
> **`## Round-by-round trace`** table in `{COVERAGE}` — keep it faithfully.

### Step 1 — Generate  *(this is Round 1)*

Follow `{PROMPT}` against `{SOURCE_FILES}` in `src/`. Write the register to `{REGISTER}`.
Every TC ID uses the page prefix: `{ID_PREFIX}-TC-001`, `{ID_PREFIX}-TC-002`, …
Never use a bare `TC-001` — page-prefixed IDs are what make the five registers merge without
collision.

### Step 2 — Score against the master

Grep the master for this page's in-scope cases only:

```bash
# core module(s) for this page
grep -E "^\| {CORE_MODULES}-[0-9]+" Manual_TestCase_Dump.md

# cross-cutting cases THIS page owns (skip if CROSSCUT_OWNED is empty)
# grep each ID in CROSSCUT_OWNED, e.g.:
#   grep -E "^\| (ACC-014|ACC-019|SEC-007)" Manual_TestCase_Dump.md
```

Give every in-scope master case exactly one verdict:

| Verdict | Meaning |
|---|---|
| **FULL** | A register case covers it. Name the `{ID_PREFIX}-TC` ID. |
| **PARTIAL** | Partly covered, and the missing part **can** be tested against this source. |
| **MISSED** | No register case covers it. |
| **ABSENT** | The master expects a feature this application does not have. **Prove it with a grep against `{SOURCE_FILES}`.** Drops out of the count entirely. |

**ABSENT is what makes 90% reachable** — OTP, password reset, Remember Me, CAPTCHA, wishlist,
carousel, etc. Counting those as failures caps the score near 45% and the loop never finishes.
Prove each absence with a grep, drop it, never look at it again. **But never mark ABSENT on a
hunch — the grep is mandatory,** and it must run against a source file confirmed to exist in
Step 0.

```
score = (FULL + 0.5 × PARTIAL) / (in-scope cases − ABSENT cases)
```

Write `{COVERAGE}`. **The header and the round-by-round trace are mandatory** — the trace is
how many-rounds-and-how-much-coverage-per-round becomes visible:

```markdown
# Coverage — {PAGE} — after Round <n>

**Rounds so far:** <n>   **Current score:** <x>%   **Status:** <running | STOPPED: reason>

Score: <x>%   ( FULL + 0.5 × PARTIAL ) / ( in-scope − absent )
= ( <f> + 0.5 × <p> ) / ( <i> − <a> )

## Round-by-round trace   — the answer to "how many loops, how much each loop bought"
> APPEND-ONLY. `{COVERAGE}` is rewritten every round, so you MUST reproduce every earlier
> row here and add exactly one new row for the round you just finished. Losing earlier rows
> defeats the entire purpose of this table. One row = one loop.

| Round | Cases before | New cases added | Cases after | Counted (in-scope − absent) | FULL | PARTIAL | MISSED | Score | Δ vs prev | What this round targeted |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | <n> | <n> | | | | | <x>% | — | initial generation |
| 2 | | | | | | | | | +<Δ> | <e.g. High-risk credential gaps> |
| … | | | | | | | | | | |

## Counts  (current round only)
| Bucket | Core ({CORE_MODULES}) | Cross-cutting (owned) | Total |
|---|---|---|---|
| In scope | | | |
| Absent (dropped) | | | |
| Counted | | | |
| FULL | | | |
| PARTIAL | | | |
| MISSED | | | |

## Not covered
| Master ID | Verdict | What is missing | Risk |
|---|---|---|---|

## Absent features — dropped from the count
| Master ID | Feature | Grep that proves it |
|---|---|---|

## Cross-cutting cases owned by this page
| Master ID | Included? | Reason |
|---|---|---|
```

### Step 3 — If the score is 90% or above

Stop. In the header set **Status: STOPPED: reached 90%** and make sure the final round's row is
in the trace. Report the final score with the formula **and the number of rounds it took**. Done.

### Step 4 — If the score is below 90%   *(each pass here is the next round)*

1. Show the uncovered list, highest risk first. Risk is **High** for credentials, stored
   state, money or destructive actions; **Medium** for navigation or visible correctness;
   **Low** for cosmetic.
2. **Re-read only `{SOURCE_FILES}` for those specific gaps** — not the whole app. Look for the
   element, branch, handler, storage key or error path the missing case needs. If the feature
   genuinely is not there, the verdict was wrong: change it to **ABSENT** and drop it.
3. Write the new cases into `{REGISTER}` in `{PROMPT}`'s format, continuing the
   `{ID_PREFIX}-TC` numbering. **Never renumber, reword or delete an existing case.**
4. Before writing each case, grep `{REGISTER}` to check it is not already covered. Same
   element + same technique + same test data is a duplicate — skip it and say which case
   already covers it.
5. **Increment the round number, append one new row to `## Round-by-round trace`** (carrying
   all earlier rows forward), then go back to step 2.

---

## Safety limits — so the loop always ends

Stop and report even if below 90% when any of these happens. **Whichever fires, name it in the
header Status and as the final round's stop reason:**

- **5 rounds** completed
- A round adds **fewer than 5 new cases**
- The score moves **less than 2 points** in a round (the `Δ vs prev` column makes this obvious)
- Everything still uncovered is **Low** risk

---

## Ask, do not decide

1. **If 90% cannot be reached because `{PROMPT}` forbids the cases** (its "Don't create this
   for now" list — e.g. Performance, Viewport/Responsive). State the ceiling plainly and ask
   whether to lift the exclusion or score those cases out of scope.
2. **A genuinely borderline cross-cutting ownership call.** Ownership is normally fixed in
   `CROSSCUT_OWNERSHIP.md`; if a case there is marked "borderline", ask rather than assuming.

---

## Rules that do not bend

- Append only — an existing case is never renumbered, reworded or deleted
- **The `## Round-by-round trace` is append-only too — every round adds exactly one row and
  keeps all prior rows; it is never truncated to the current round**
- Never drop a case from the count without a grep proving the feature is absent
- Never score a source file that Step 0 could not find
- Never claim 100% — always show numerator, denominator and formula
- Report the score honestly even when it is below target, and always state how many rounds it took
