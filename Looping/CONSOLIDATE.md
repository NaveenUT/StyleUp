# CONSOLIDATE.md — merge the five per-page results into one

Runs **once, after all five page-loops have stopped** (each at 90% or a safety limit). This is
a merge-and-report step. **It generates no new single-page cases** — the only new cases it
writes are cross-page journeys that no single-page loop could produce.

---

## Inputs

Five registers and five coverage files, one per page:

```
REGISTER_home_auth.md   COVERAGE_home_auth.md
REGISTER_search.md      COVERAGE_search.md
REGISTER_cart.md        COVERAGE_cart.md
REGISTER_address.md     COVERAGE_address.md
REGISTER_payment.md     COVERAGE_payment.md
```

Each `COVERAGE_*.md` carries a `## Round-by-round trace` — that is where the per-page loop
count and the score-after-each-round come from. This step lifts those numbers up so the whole
funnel's looping is visible in one place.

---

## Step 1 — Pre-merge checks (fail loud)

1. **Every page-loop actually finished.** Open each `COVERAGE_*.md`; confirm a final score, a
   stop reason (90% reached, or a named safety limit), **and a `## Round-by-round trace` with at
   least one row**. If any is missing or mid-round, stop and say which page is incomplete.
2. **ID prefixes are unique and correct.** Each register must use only its own prefix
   (`HOMEAUTH-`, `SEARCH-`, `CART-`, `ADDRESS-`, `PAYMENT-`). A bare `TC-` or a wrong prefix in
   any file is a bug from that loop — report it, do not silently fix.

```bash
for p in HOMEAUTH SEARCH CART ADDRESS PAYMENT; do
  echo "$p: $(grep -cE "^\| ${p}-TC-[0-9]+" REGISTER_*.md | paste -sd+ | bc) cases"
done
grep -hoE "^\| TC-[0-9]+" REGISTER_*.md && echo "WARNING: bare TC- ids found — a loop did not prefix"
```

---

## Step 2 — Merge the registers

Concatenate all five into `REGISTER_ALL.md`, grouped by page with a section header per page.
IDs are already unique, so **do not renumber**. Preserve every case verbatim — append-only
applies across the merge too.

Keep a short manifest at the top:

```markdown
# Combined Manual Test Case Register — Styleup (7 pages)
| Page | Prefix | Cases | File of origin |
|---|---|---|---|
| Home / Sign Up / Sign In | HOMEAUTH | <n> | REGISTER_home_auth.md |
| Search | SEARCH | <n> | REGISTER_search.md |
| Cart | CART | <n> | REGISTER_cart.md |
| Address | ADDRESS | <n> | REGISTER_address.md |
| Payment | PAYMENT | <n> | REGISTER_payment.md |
| Cross-page journeys | JRN | <n> | added in Step 4 |
| **Total** | | **<N>** | |
```

---

## Step 3 — De-duplicate cross-cutting cases

Ownership should already prevent double-counting, but verify: if two registers contain a case
testing the **same element + same technique + same test data**, that is a duplicate that
escaped the ownership map. Keep the one on the owning page (per `CROSSCUT_OWNERSHIP.md`), delete
the other, and log the removal in a `## Duplicates removed` table with both IDs and the reason.
Never delete a case that is merely *similar* — only exact element+technique+data matches.

---

## Step 4 — Add the cross-page journeys

These are the End-to-End cases no single-page loop can write, because each one spans pages:

- Guest → search a product → blocked at gated category → sign in → land on results
- Sign up → sign in → add to cart → address → payment → OTP → order confirmation
- Add to cart → abandon → return → cart state persisted (or not) from `localStorage`
- Apply a coupon/discount at cart → verify it survives into payment total
- Wrong password at sign-in mid-checkout → recovery path back into the funnel

Number them `JRN-TC-001…` and append to `REGISTER_ALL.md`. Grep the merged register first so a
journey a page-loop already happened to cover is not duplicated.

---

## Step 5 — Combined score

The combined score is **summed from the five per-page coverage files, not recomputed from
scratch** — each page already resolved its own FULL/PARTIAL/MISSED/ABSENT with source greps.

```
combined_score = Σ(FULL + 0.5 × PARTIAL) over 5 pages
                 ────────────────────────────────────
                 Σ(in-scope − absent) over 5 pages
```

Write `COVERAGE_ALL.md`:

```markdown
# Combined Coverage — Styleup (7 pages)

Score: <x>%   Σ(FULL + 0.5×PARTIAL) / Σ(in-scope − absent)
= ( <ΣF> + 0.5 × <ΣP> ) / ( <Σi> − <Σa> )

## Score by page  — a combined figure can hide a weak page, so this table is the real result
| Page | Module(s) | In scope | Absent | Counted | FULL | PARTIAL | MISSED | Rounds | Score | Stop reason |
|---|---|---|---|---|---|---|---|---|---|---|
| Home / Sign Up / Sign In | HOM/REG/LOG | | | | | | | | | |
| Search | SRC/PLP | | | | | | | | | |
| Cart | CRT | | | | | | | | | |
| Address | CHK/SHP | | | | | | | | | |
| Payment | PAY | | | | | | | | | |
| **All pages** | | | | | | | | **—** | | |

## Coverage progression per page  — how many loops each page took, and the score after each
> Lifted straight from each page's `## Round-by-round trace`. A blank cell means the page had
> already stopped by that round. `Rounds` is the count of non-blank cells — i.e. how many times
> that page looped. This table is the clear picture of the looping.
| Page | R1 | R2 | R3 | R4 | R5 | Rounds | Final | Stop reason |
|---|---|---|---|---|---|---|---|---|
| Home / Sign Up / Sign In | | | | | | | | |
| Search | | | | | | | | |
| Cart | | | | | | | | |
| Address | | | | | | | | |
| Payment | | | | | | | | |

## Pages below target
| Page | Score | Rounds used | Highest-risk gap still open | Why it stopped short of 90% |
|---|---|---|---|---|

## Absent features across the funnel (dropped, with proof)
| Master ID | Page | Feature | Grep that proved it |
|---|---|---|---|
```

---

## Step 6 — Report

State the combined score with its formula, then immediately show **both** the per-page score
table and the coverage-progression table — the progression table is what tells you, at a
glance, that (say) Cart cleared 90% in 2 rounds while Address needed all 5 and still stopped at
78%. If any page stopped below 90%, lead with that — an 88% combined number that hides a 62%
Address page is a worse outcome than knowing exactly which page to reopen. Name the single
highest-risk uncovered case across the whole funnel as the recommended next action, and say how
many rounds it would likely take to close (a page still moving >2 points per round is worth
reopening; one that flat-lined is not).

---

## Rules that do not bend

- Merge is append-only — no renumbering, no rewording, no deletion except proven exact duplicates
- The combined score is summed from per-page files, never hand-waved
- **Rounds-taken and per-round scores are read from each page's trace, never estimated**
- Never claim 100%, and never let a strong page's average hide a weak page — the per-page table
  and the progression table are both mandatory
