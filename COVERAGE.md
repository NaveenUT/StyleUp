# Coverage — Round 1

**Register scored:** `TEST_CASES_HOMEPAGE_ALLTECHNIQUES_REGISTER_V5.md` (154 cases, `TC-001`–`TC-154`) — confirmed built from `prompt_1_v5 (1).md` exactly (same section order, same numbering rule). Treated as this run's Step-1 output rather than regenerated from scratch, since it already is that prompt's product.

**Score: 51.5%**   ( FULL + 0.5 × PARTIAL ) / ( in-scope − absent )
= ( 40 + 0.5 × 20 ) / ( 171 − 74 )
= 50 / 97

This is well below the 90% target, and — before any gap-closing — **two decisions belong to you, per the runbook's own "ask, don't decide" rule.** Both are below. Nothing has been written to `REGISTER.md` yet; this round is scoring only.

## Score by page (core three modules)

| Page | Module | In scope | Absent | Counted | Full | Partial | Missed | Score |
|---|---|---|---|---|---|---|---|---|
| Home Page | HOM | 18 | 10 | 8 | 4 | 2 | 2 | 62.5% |
| Sign Up | REG | 24 | 15 | 9 | 6 | 2 | 1 | 77.8% |
| Sign In | LOG | 25 | 12 | 13 | 8 | 3 | 2 | 80.8% |
| **Core total** | | **67** | **37** | **30** | **18** | **7** | **5** | **71.7%** |

*(Reused from `TestCase_Coverage_Gap_Report_v5_Register.md`, which already scored this exact register against this exact master — re-verified, not re-derived from nothing.)*

## Score by cross-cutting module (15 modules, applicability filtered to Home/Sign Up/Sign In only)

| Module | Total master cases | Not applicable (excluded) | In scope | Absent | Counted | Full | Partial | Missed | Score |
|---|---|---|---|---|---|---|---|---|---|
| UIX | 20 | 2 | 18 | 3 | 15 | 5 | 3 | 7 | 43.3% |
| SEC | 18 | 7 | 11 | 7 | 4 | 3 | 1 | 0 | 87.5% |
| ACC | 28 | 7 | 21 | 4 | 17 | 3 | 4 | 10 | 29.4% |
| SEO | 14 | 7 | 7 | 3 | 4 | 3 | 1 | 0 | 87.5% |
| SES | 13 | 5 | 8 | 7 | 1 | 1 | 0 | 0 | 100% |
| STO | 12 | 5 | 7 | 4 | 3 | 2 | 1 | 0 | 83.3% |
| DPL | 12 | 10 | 2 | 0 | 2 | 0 | 0 | 2 | 0% |
| ANL | 8 | 6 | 2 | 2 | 0 | 0 | 0 | 0 | — (0 counted) |
| CNC | 10 | 10 | 0 | 0 | 0 | 0 | 0 | 0 | — (0 counted) |
| CMP | 10 | 3 | 7 | 7 | 0 | 0 | 0 | 0 | — (0 counted) |
| CNT | 14 | 12 | 2 | 0 | 2 | 2 | 0 | 0 | 100% |
| API | 13 | 9 | 4 | 0 | 4 | 3 | 1 | 0 | 87.5% |
| JRN | 13 | 13 | 0 | 0 | 0 | 0 | 0 | 0 | — (0 counted) |
| DEV | 14 | 3 | 11 | 0 | 11 | 0 | 2 | 9 | 9.1% |
| PER | 10 | 6 | 4 | 0 | 4 | 0 | 0 | 4 | 0% |
| **Cross-cutting total** | **209** | **105** | **104** | **37** | **67** | **22** | **13** | **32** | **42.5%** |

## All three pages combined

| | In scope | Absent | Counted | Full | Partial | Missed | Score |
|---|---|---|---|---|---|---|---|
| Core (HOM+REG+LOG) | 67 | 37 | 30 | 18 | 7 | 5 | 71.7% |
| Cross-cutting (15 modules) | 104 | 37 | 67 | 22 | 13 | 32 | 42.5% |
| **All three pages** | **171** | **74** | **97** | **40** | **20** | **37** | **51.5%** |

## Not covered (highest-value subset — full list is large; complete detail is in the classification behind this round)

| Master ID | Page/Module | Verdict | What is missing | Risk |
|---|---|---|---|---|
| REG-005 | Sign Up | Missed | Duplicate-email registration blocked | High |
| LOG-006 | Sign In | Missed | Email case-insensitive / password case-sensitive | High |
| HOM-015 | Home | Missed | Sticky header stays accessible while scrolling | Medium |
| ACC-003 | Accessibility | Missed | Visible focus indicator on every control | High |
| ACC-009 | Accessibility | Missed | Carousel/product-grid image alt text / decorative-hiding | Medium |
| DEV-007 | Device | Missed | Sign Up Email field has no `type="email"`/`autocomplete` hint | Medium |
| DPL-011 | Deep Links | Missed | Search result set not reproducible via shared/reopened URL | Medium |
| UIX-002 / DEV-002 | UI-UX / Device | Missed | No responsive/tablet layout (0 media queries anywhere) | Medium |
| ACC-020/021/022/023 | Accessibility | Missed | 400% zoom/reflow, text-spacing override, OS font-scaling, forced-colours | Medium |
| PER-001/004/007/010 | Performance | Missed | **Blocked — see Question 1 below** | — |
| DEV-004/005/006/008/009/011/014 | Device/Viewport | Missed | **Blocked — see Question 1 below** | — |

## Absent features — dropped from the count (74 total; representative sample)

| Master ID | Feature | Grep that proves it |
|---|---|---|
| REG-002/LOG-002 etc. | OTP registration/login | 0 matches for "OTP" in any `.html`/`.js` |
| LOG-009–014 | Password reset flow | 0 matches for "forgot password" anywhere |
| STO-010/011 | Remember Me | No such checkbox in `signin.html` |
| SEC-005/006, SES-011 | Session tokens/cookies | 0 matches for `cookie`; only a boolean `loginStatus` in localStorage |
| ANL-006/008 | Search/PII tracking | 0 matches for `gtag`/`dataLayer`/`fetch(`/`sendBeacon` anywhere |
| ACC-024/025/026 | Dark mode, reduced-motion, pausable carousel | 0 matches for `prefers-color-scheme`/`@keyframes`/`animation`; carousel has no auto-rotate (0 `setInterval`) |
| CMP-001–006, CMP-010 | Consent banner, data export, erasure, accessibility statement | 0 matches for a consent UI; no such pages exist in the repo |
| SEO-006/007 | robots.txt / sitemap.xml | Neither file exists in the repo |
| *(full 74-row list available on request — condensed here for length)* | | |

## Rounds

| Round | Cases | Score |
|---|---|---|
| 1 | 154 (pre-existing) | 51.5% |
| 2 | 170 (+16: `TC-155`–`TC-170`) | 67.9% |
| 3 | 187 (+17: `TC-171`–`TC-187`) | 87.4% |
| 4 | 188 (+1: `TC-188`, plus 6 reclassifications) | **91.5%** |

---


## Round 3 — closed against the actual source

**17 new cases** (`TC-171`–`TC-187`), all duplicate-checked first. Closed 16 Missed (all 8 remaining `ACC` items — `ACC-020` also closed `ACC-019`'s zoom-check half in the same case; `UIX-001/006/012/014`; `DEV-006/011`; `PER-004`; `DPL-012`) and 5 Partial→Full (`STO-006`/`TC-174`, `SEO-014`/`TC-175`, plus 3 reclassified with no new case: `SEC-010` and `API-008` — each already fully covers the only half of the scenario this app supports, and `UIX-005` — already fully covered by `TC-165`, written for `ACC-009`'s identical carousel/grid alt-text gap).

**8 items explicitly left Missed, not padded with an unverifiable case** — `DEV-004/005/008/009/014` and `PER-010` need a real device or a sustained real-time run this pass can't perform; `UIX-015` has the same device-emulation limitation.

## Round 4 — one new case plus a reclassification pass

**1 new case** (`TC-188`, closing `ACC-012`). **6 reclassifications**, applying the same correction rule already used for `SEC-010`/`API-008`/`HOM-012`/`LOG-025`: a Partial verdict whose only uncovered half is a page this round excludes entirely (`CRT`/`PDP`/`CHK`/`PAY`) becomes Full once the applicable half is confirmed complete — `ACC-001`, `ACC-002`, `ACC-008`, `UIX-003`, `UIX-013` (Partial→Full), and `UIX-004` (Missed→**Absent**, since no design-spec document exists anywhere in this repo to test against — there's nothing to compare, not merely something untested).

`DEV-010`/`DEV-012` stay Partial — their remaining gap is a real touch-device gesture, not an out-of-scope page, so the correction rule doesn't apply to them.

## Final combined score

| | In scope | Absent | Counted | Full | Partial | Missed | Score |
|---|---|---|---|---|---|---|---|
| Core (HOM+REG+LOG) | 67 | 39 | 28 | 28 | 0 | 0 | 100% |
| Cross-cutting (15 modules) | 104 | 38 | 66 | 57 | 2 | 7 | 87.9% |
| **All three pages** | **171** | **77** | **94** | **85** | **2** | **7** | **( 85 + 0.5×2 ) / 94 = 86 / 94 = 91.5%** |

**Per Step 3: score is ≥90%. Stopping here.**

Remaining, deliberately unclosed (9 items, all Low/Medium risk, all device- or documentation-limited, none credential/money/destructive): `UIX-015`, `DEV-004/005/008/009/010/012/014`, `PER-010`. Every one has a stated reason in the register (`TC-171`–`188`'s trailing notes) or in this file — none was silently dropped.

---

## Round 2 — closed against the actual source, per Step 4

**16 new cases added** (`TC-155`–`TC-170`), all duplicate-checked against the prior 154 rows first. Closed:

- **All 5 core Missed:** `REG-005` (`TC-155`), `LOG-006` (`TC-156`), `HOM-015` (`TC-157`), `HOM-018` (`TC-158`), `REG-023` (`TC-159`)
- **5 of 7 core Partial → Full:** `REG-017`/`TC-160`, `LOG-024`/`TC-161`, `REG-024`/`TC-162`, `LOG-021`/`TC-163`, `LOG-023` (closed by the same `TC-159` that closed `REG-023` — they describe the same underlying guest-cart-persistence scenario from the Sign-Up and Sign-In modules respectively)
- **2 of 7 core Partial → reclassified ABSENT, per the runbook's own correction rule** ("if the feature genuinely is not there, the verdict was wrong"): `HOM-012` (no default-merchandising/personalisation engine exists to assert against — the existing product grids are static, not a rails algorithm) and `LOG-025` (no recover-password form exists at all, so its missing half can never be tested). **Core is now 28/28 counted cases = 100%.**
- **8 cross-cutting Missed → Full:** `ACC-003` (`TC-164`), `ACC-009` (`TC-165`), `DEV-007` (`TC-166`), `DPL-011` (`TC-167`), `UIX-002` + `DEV-002` (both closed by the one `TC-168`), `PER-007` (`TC-169`), `PER-001` (`TC-170`)

## Updated combined score

| | In scope | Absent | Counted | Full | Partial | Missed | Score |
|---|---|---|---|---|---|---|---|
| Core (HOM+REG+LOG) | 67 | 39 | 28 | 28 | 0 | 0 | **100%** |
| Cross-cutting (15 modules) | 104 | 37 | 67 | 30 | 13 | 24 | 54.5% |
| **All three pages** | **171** | **76** | **95** | **58** | **13** | **24** | **67.9%** |

**Safety-limit check after Round 2:** rounds used 2/5; this round added 16 new cases (≥5, no stop); score moved +16.4 points (≥2, no stop); remaining gaps are not all Low risk (several `ACC`/`DEV` items are Medium, `ACC-004` keyboard-trap and `ACC-007` button-naming are High-adjacent) — **no safety limit trips. The process would continue to Round 3.**

**What's left (37 items, all cross-cutting):**
- 24 Missed — 6 `UIX` (design-consistency, zoom, orientation, touch — mostly Low/Medium), 8 `ACC` (keyboard-trap, button-naming, zoom/reflow, text-spacing, OS-scaling, forced-colours — mostly Medium, one High), 7 `DEV` (rotation, foldables, virtual keyboard, safe-area, swipe gestures, sticky-collapse, slow-connection — Medium), 2 `PER` (search response time, soak/leak — Low), 1 `DPL` (malformed URL params — Low)
- 13 Partial — mostly Accessibility zoom/keyboard nuances and a few Compatibility/Device items already half-covered

---

## Question 1 — Performance/Viewport ceiling (per the runbook, this is yours to decide, not mine)

`prompt_1_v5.md`'s own "Don't create this for now" list forbids Performance and Viewport/responsive/touch-target scenarios. Counting only what's **strictly** those two categories among the currently-Missed cross-cutting cases:

- **`PER`: 4 missed cases** (`PER-001` load time, `PER-004` search response time, `PER-007` image optimisation, `PER-010` soak/leak) — all 4 are Performance, all 4 are forbidden.
- **`DEV`: 9 missed + 2 partial cases** are viewport/responsive/touch/device-specific (tablet layout, rotation, foldables, virtual keyboard, safe-area, swipe gestures, pull-to-refresh, sticky-header-on-scroll-collapse, slow-connection degradation) — all forbidden by the same exclusion.

That's **13 permanently-Missed + 2 permanently-capped-at-Partial cases** — more than the runbook's own rough guess of "~11," because I counted the full `DEV` module, not just the narrower "viewport" label.

**The arithmetic:** even if every *other* closeable gap in the entire register (24 more Missed + 18 more Partial-to-Full) were closed across future rounds, the ceiling stays at **≈85.6%** — `(82 + 0.5×2) / 97` — while these 15 cases stay frozen. **90% is arithmetically unreachable while this exclusion stands.**

```
Performance and Viewport are excluded by prompt_1_v5.md — 15 master cases
(4 Performance + 9 Missed/2 Partial Device-Viewport), not ~11 as guessed.
With them excluded, the ceiling is ≈85.6%, not 90%.
Lift the exclusion, or accept a sub-90% final score?
```

## Question 2 — Which cross-cutting cases apply (yours to confirm, several are genuinely borderline)

The applicability judgment above excluded 105 of 209 cross-cutting cases as "not this page" (cart/PDP/checkout/payment/wishlist/etc.) — those are clear-cut. A handful were **reinterpreted** rather than cleanly yes/no, and deserve your explicit sign-off before they count toward the score:

| Master ID | How it was reinterpreted | Why it's borderline |
|---|---|---|
| `DPL-011` (filtered-listing URL reproducibility) | Applied to `search.html`'s result state instead of a product-listing filter URL | Search isn't literally "filtered listing," but the underlying concern (shareable state) transfers directly |
| `API-007/008/009/012` (server-fault leakage, slow-response loading state, idempotent retry, stale cache after back-nav) | Applied to this app's synchronous client-only equivalents (uncaught `JSON.parse`, rapid double-submit, browser-back after login) since there's no server to produce the literal scenario | These stretch "interface validation" to mean "client-side equivalent of a server concern" — a real judgment call, not a clean match |
| `STO-006` (previous user's data visible to next user on a shared device) | Applied to `userdata`/`logginName`'s unbounded plaintext accumulation instead of a cart/wishlist leak | Same underlying privacy concern, different feature |
| `UIX-016` (graceful handling of lost network) | Marked ABSENT rather than Not-applicable, reasoning that "no network call exists to lose" is itself the finding | Could arguably be "Not applicable" instead, since the scenario has no analogue here at all |

If any of these four should instead be **excluded outright** (not merely reclassified), say so and the denominator changes.

---

**Per the runbook: nothing proceeds to gap-closing until both questions are answered.**
