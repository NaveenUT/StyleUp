# ORCHESTRATOR.md — run all five page-loops, then consolidate

The top-level runbook. It dispatches five independent page-loops (isolated contexts, so no
page dilutes another), waits for all to stop, then runs the merge. One command from you drives
the whole thing.

---

## Why subagents

Each page-loop must run in its **own context** — that is the entire reason for splitting five
prompts instead of combining them. If they shared one context, page 5 would generate against a
context already full of pages 1–4 and lose depth. Claude Code subagents give each loop a clean
context while keeping this a single invocation.

---

## Prerequisites (check before dispatching)

- [ ] `src/` present; all source files exist at the casing in `RUN_HEADS.md`
- [ ] `Manual_TestCase_Dump.md` present and matches `^| PREFIX-NNN` row format (each loop's
      Step 0 re-checks this and halts if not)
- [ ] All five prompts normalised to on-disk lowercase filenames (`address.html`, `otp.html`,
      `payment.html`)
- [ ] `CROSSCUT_OWNERSHIP.md` filled in, and each page's owned IDs copied into its run head

If any box is unchecked, stop and tell me which — do not dispatch a loop that will produce a
false ABSENT.

---

## Step 1 — Build the five page runbooks

For each of the five heads in `RUN_HEADS.md`, create a runbook file by pasting that head into a
copy of `COVERAGE_LOOP.template.md`:

```
COVERAGE_LOOP_home_auth.md
COVERAGE_LOOP_search.md
COVERAGE_LOOP_cart.md
COVERAGE_LOOP_address.md
COVERAGE_LOOP_payment.md
```

---

## Step 2 — Dispatch five subagents in parallel

Launch one subagent per runbook. Each subagent's instruction is exactly:

> Read `COVERAGE_LOOP_<page>.md` and run its process until coverage is 90% or a safety limit
> stops it. Read only the source files named in the THIS RUN block. Write `REGISTER_<page>.md`
> and `COVERAGE_<page>.md`, keeping the `## Round-by-round trace` append-only (one row per
> loop). Report your final score, the formula, your stop reason, **the number of rounds it
> took, and the score after each round** (copied from your trace table).

They do not talk to each other and do not touch each other's files. Registers use distinct ID
prefixes, so parallel writes never collide.

---

## Step 3 — Collect and gate

When all five have returned, confirm each produced a `COVERAGE_<page>.md` with a final score, a
stop reason, **and a populated `## Round-by-round trace`**. Any subagent that halted at Step 0
(bad master format or missing source) surfaces here — fix the cause and re-dispatch only that
one page, not all five.

Print the interim table — the `Rounds` and `Score path` columns are what make the looping
legible at this stage:

```
| Page | Rounds | Score path (R1→…→final) | Final | Stop reason | Cases |
|---|---|---|---|---|---|
| Home / Sign Up / Sign In | 3 | 64% → 79% → 91% | 91% | reached 90% | 78 |
| … | | | | | |
```

---

## Step 4 — Consolidate

Run `CONSOLIDATE.md` against the five register/coverage pairs. Produce `REGISTER_ALL.md` and
`COVERAGE_ALL.md`, including its **coverage-progression-per-page** table.

---

## Step 5 — Final report

Report the combined score with its formula, then the mandatory per-page table **and the
per-page coverage-progression table** (rounds taken + score after each round). Lead with any
page below 90% and name the single highest-risk uncovered case across the funnel.

---

## To run

```
Read ORCHESTRATOR.md. Check the prerequisites; if all pass, build the five page runbooks,
dispatch them as subagents until each hits 90% or its safety limit, then run CONSOLIDATE.md
and give me the combined score with the per-page breakdown AND the per-page round-by-round
progression (how many loops each page took and the score after each loop).
```

---

## If subagents are unavailable in your setup

Run the five loops **sequentially** in one session instead — same runbooks, same outputs, one
after another. You lose parallelism but keep the two things that matter: isolated per-page
scope (start each with a fresh read of only its source) and page-prefixed IDs. Each page still
keeps its own append-only round trace, so the progression report is identical. Then run
`CONSOLIDATE.md`. Slower, identical result.
