# RUN_HEADS.md — the five filled `## THIS RUN` blocks

Each block is pasted into a copy of `COVERAGE_LOOP.template.md` to produce a page-specific
runbook (`COVERAGE_LOOP_<page>.md`). Filenames use the **exact on-disk lowercase casing** —
`address.html`, `otp.html`, `payment.html` — not the mixed casing some prompts were written
with. Fix the prompts to match, or the Step 0 existence check halts the run.

Cross-cutting ownership (`CROSSCUT_OWNED`) is left as `<from CROSSCUT_OWNERSHIP.md>` — fill
each from that file once the owned IDs are finalised.

---

## 1 — Home / Sign Up / Sign In   (prompt_1_v5)

> This one prompt covers three pages and three master modules. Keep them together (the prompt
> is built that way) but report a per-page sub-breakdown inside COVERAGE, because a combined
> HOM+REG+LOG score can sit at 85% while Sign Up alone sits at 60%.

```
PAGE            = Home / Sign Up / Sign In
SOURCE_FILES    = index.html index.js navbar.js search-algo.js signup.html signin.html
CORE_MODULES    = HOM|REG|LOG
CORE_CASES      = 67
PROMPT          = prompt_1_v5.md
ID_PREFIX       = HOMEAUTH
REGISTER        = REGISTER_home_auth.md
COVERAGE        = COVERAGE_home_auth.md
CROSSCUT_OWNED  = UIX-001 UIX-002 UIX-003 UIX-004 UIX-005 UIX-006 UIX-007 UIX-008 UIX-009 UIX-010 UIX-011 UIX-012 UIX-013 UIX-015 UIX-017 UIX-019 UIX-020 SEC-001 SEC-004 SEC-005 SEC-006 SEC-007 SEC-009 SEC-010 SEC-011 SEC-017 SEC-018 SEO-001 SEO-002 SEO-003 SEO-005 SEO-006 SEO-007 SEO-013 PER-001 PER-005 PER-007 PER-008 PER-009 PER-010 CMP-001 CMP-002 CMP-003 CMP-004 CMP-005 CMP-006 CMP-010 ANL-003 ANL-008 ACC-001 ACC-002 ACC-003 ACC-005 ACC-006 ACC-009 ACC-010 ACC-012 ACC-014 ACC-015 ACC-017 ACC-018 ACC-019 ACC-020 ACC-021 ACC-022 ACC-023 ACC-024 ACC-025 ACC-026 STO-005 STO-006 STO-008 STO-009 STO-010 STO-011 SES-001 SES-002 SES-004 SES-005 SES-008 SES-009 SES-010 SES-011 SES-012 SES-013 DEV-001 DEV-002 DEV-005 DEV-006 DEV-008 DEV-014 API-005 API-007 API-013 CNT-001 CNT-014 DPL-006
```

> **Source path correction:** `RUN_HEADS.md` and the template assume `src/<file>` — this repo has
> no `src/` folder; the listed files are all in the project root. Every subagent reads
> `SOURCE_FILES` directly from the project root, not `src/`.

## 2 — Search   (prompt_search_v2)

> Search spans two master modules: Search (SRC) is the query/result behaviour; Listing (PLP)
> is the results grid, filters and sort. Both are scored. Your earlier Search gap report is a
> good sanity reference for which PLP cases are ABSENT in Styleup (pagination, view toggle,
> rating filter, etc.).

```
PAGE            = Search
SOURCE_FILES    = search.html search.js search-algo.js index.html
CORE_MODULES    = SRC|PLP
CORE_CASES      = 70
PROMPT          = prompt_search_v2.md
ID_PREFIX       = SEARCH
REGISTER        = REGISTER_search.md
COVERAGE        = COVERAGE_search.md
CROSSCUT_OWNED  = PER-002 PER-004 ANL-006 DPL-011 DPL-012 SEO-004 SEO-008 SEO-012 SEO-014 DEV-003 API-002 CNT-008 DEV-011
```

## 3 — Cart   (cart_prompt_V2)

```
PAGE            = Cart
SOURCE_FILES    = cart.html
CORE_MODULES    = CRT
CORE_CASES      = 39
PROMPT          = cart_prompt_V2.md
ID_PREFIX       = CART
REGISTER        = REGISTER_cart.md
COVERAGE        = COVERAGE_cart.md
CROSSCUT_OWNED  = UIX-016 CNC-002 CNC-007 ANL-002 ACC-008 ACC-013 ACC-028 STO-001 STO-002 STO-003 STO-012 DPL-009 SES-006 API-011 SEC-008 DPL-005 API-006
```

## 4 — Address   (Address_prompt_V2)

> The only page spanning two modules that need a which-cases-belong judgement: Checkout (CHK)
> holds address-entry and order-review; Shipping (SHP) holds delivery-address cases. Some CHK
> and SHP cases belong to a later step, not the address page — score only the ones that apply
> here and list the excluded ones in COVERAGE so the denominator can be rechecked.

```
PAGE            = Address
SOURCE_FILES    = address.html otp.html
CORE_MODULES    = CHK|SHP
CORE_CASES      = 46
PROMPT          = Address_prompt_V2.md
ID_PREFIX       = ADDRESS
REGISTER        = REGISTER_address.md
COVERAGE        = COVERAGE_address.md
CROSSCUT_OWNED  = ACC-016 STO-004 DEV-010 SEC-002 ACC-011 DEV-004 DEV-007
```

## 5 — Payment   (payment_prompt_V2)

```
PAGE            = Payment
SOURCE_FILES    = payment.html payment.js otp.html
CORE_MODULES    = PAY
CORE_CASES      = 53
PROMPT          = payment_prompt_V2.md
ID_PREFIX       = PAYMENT
REGISTER        = REGISTER_payment.md
COVERAGE        = COVERAGE_payment.md
CROSSCUT_OWNED  = UIX-018 SEC-012 SEC-015 SEC-016 PER-006 CNC-001 CNC-003 CNC-004 CNC-005 CNC-006 CNC-008 CNC-009 CNC-010 CMP-007 CMP-009 ANL-004 ANL-005 ANL-007 ACC-027 DPL-007 DPL-008 DPL-010 SES-007 DEV-012 DEV-013 API-003 API-004 API-008 API-009 API-010 SEC-003 SEC-013 ACC-004 ACC-007 SES-003
```

---

## Note on `otp.html`

`otp.html` / `otp.js` is referenced by cart, address and payment as a hand-off target, but no
prompt formally *owns* the OTP page. It is assigned to the Address and Payment reads above so
the OTP step gets some coverage. If OTP behaviour matters to you as a first-class page, it
needs its own prompt and its own loop — flag it and I will add a sixth head.
