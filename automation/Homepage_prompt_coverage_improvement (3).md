# Homepage / Sign In / Sign Up — All-Techniques Functional Test Case Register (v5)

**Document:** Homepage_prompt_coverage_improvement
**Target:** `http://localhost:5501/index.html`, `signin.html`, `signup.html`
**Environment:** Local, no domain
**Numbering:** This register is built from `prompt_1_v5 (1).md`, which explicitly states it supersedes the separate boundary/accessibility round for these three pages. Per Rule 9, numbering **restarts at TC-001** — this is a standalone replacement register, not an addition to the running TC-286+ supplement chain used by the other pages (Search/Cart/Address/Payment), and is a separate deliverable from `TEST_CASES_HOMEPAGE_UNIFIED_REGISTER_V6.md` (which covers the same three pages under a different, 12-dimension framework requested separately).

---

## Critical Findings

**Carried forward from prior rounds (see earlier registers for full derivation), condensed:**

1. Three navbar implementations exist site-wide; Sign In/Sign Up's own MEN/WOMEN/KIDS/HOME LIVING links (`signin.html`/`signup.html` lines 22–25 / 20–23) are plain unguarded `<a>` tags — reachable without login, bypassing BR2.
2. Search (`search-algo.js`) matches by case-insensitive prefix; a partial term or an empty submission both incorrectly return results (BR4 violation).
3. Sign-up's email check (`signup.html` line 69) only verifies the string ends in ".com" (case-sensitive), never checking for "@". Its password check (line 72) is a raw `length<8`, accepting an all-whitespace 8-character string.
4. No `<label>` on Sign In/Sign Up has a working `for` (both are `for=""`, lines 41/43 and 39/41/43); the Search bar has no label at all; the Logo has no `alt` on either page; both pages share `<title>Document</title>`; neither has an `<h1>`.

**New this round (fresh reads of `signin.html`, `signup.html`, `navbar.js` performed for this prompt):**

5. **A third storage key, `logginName`, is written by `signin.html` alone.** Line 56 reads it (`JSON.parse(localStorage.getItem("logginName"))||[]`); on every *successful* login, line 64 pushes the entire matched user record — `{name, Email, Password}`, **including the plaintext password** — onto this array, and line 65 writes it back. No other file in the codebase (`navbar.js`, `signup.html`, or any other `.js`/`.html`) reads or references `logginName` at all (confirmed by grepping the whole project for the string — only `signin.html` contains it). The array is never trimmed, deduplicated, or cleared on logout: it grows by one full credential-bearing record every time any user logs in, forever, for as long as the browser's storage persists.
6. **A failed sign-in redirects the user to `signup.html`, not back to `signin.html`.** Lines 69–72: on `flag==false`, the code runs `alert("Incorrect Id or password")` followed immediately by `window.location.href="signup.html"`. A user who simply mistyped their password is navigated away from the sign-in form entirely and dropped onto the registration page, rather than remaining on (or returning to) Sign In to retry.
7. **The Sign In and Sign Up static navbars never branch on `login_status` at all.** Unlike `navbar.js` (which reads `loginStatus` and swaps its rendered content), the inline navbar markup in `signin.html`/`signup.html` is fixed HTML with no script reading `loginStatus` anywhere in either file. An already-authenticated user who navigates directly to `signin.html` or `signup.html` still sees the guest-style static navbar (plain links, non-functional search, static cart image) — the dynamic authenticated navbar never appears on these two pages under any condition.
8. **No analytics/tracking call exists anywhere in the codebase.** Grepping every `.js` file for `gtag`, `dataLayer`, `analytics`, `sendBeacon`, `XMLHttpRequest`, and `fetch(` returns zero matches.
9. **No localisation/i18n code exists anywhere.** Grepping every `.js`/`.html` file for `Intl.`, `toLocaleString`, `i18n`, and `locale` returns zero matches. Every page does carry `<html lang="en">` (confirmed present on all 17 HTML files, including the three in scope) — a compliant, if minimal, finding.
10. **No page in scope has a meta description, canonical link, or robots directive.** `index.html`'s only head metadata is the viewport tag and `<title>Styleup</title>`; `signin.html`/`signup.html` are identical apart from their (non-descriptive, duplicate) `<title>Document</title>`. None of the three pages has an `<h1>`; Sign In/Sign Up each have exactly one `<h2>` ("Sign In" / "Sign Up") as their only heading.
11. **No consent or cookie-notice mechanism exists anywhere**, and `localStorage` writes (registration, login, cart) begin immediately with no gating prompt. "Privacy Policy" is confirmed, again, to be dead static footer text with no destination page anywhere in the project (grepped across all HTML files — no `privacy-policy.html` or similar exists).
12. **`terms-of-use.html` is a real, substantive document** (confirmed via read) — the Terms of Services/Terms of use links on Sign In, Sign Up, and Footer resolve to genuine content, not a stub.

---

## Decision Tables (Rule 11)

**Table 1 — Sign Up gate** (`signup.html` lines 66–75). Evaluation order is strict short-circuit: Name is checked first; only if Name passes is Email checked; only if Email passes is Password checked.

| # | Name valid (length>0)? | Email valid (ends ".com")? | Password valid (length≥8)? | Resulting action | Reachable as distinct? |
|---|---|---|---|---|---|
| 1 | No | — (never evaluated) | — (never evaluated) | "Enter correct name" | Yes |
| 2 | Yes | No | — (never evaluated) | "Enter correct Email" | Yes |
| 3 | Yes | Yes | No | "Weak Password:Enter atleast 8 character" | Yes |
| 4 | Yes | Yes | Yes | Account created, redirect to `signin.html` | Yes |

Because Name-fails short-circuits before Email/Password are read, the naive 2×2×2=8-row truth table collapses to these 4 effectively distinct, reachable outcomes — rows where Name is "No" always produce outcome 1 regardless of the other two columns' actual values, so those 4 raw combinations are not separately testable.

**Table 2 — Sign In gate** (`signin.html` lines 57–68). The check is a single joint condition per stored record (`Email==el.Email && Password==el.Password`), not two sequential field checks — a record where only one of the two matches is not considered a partial match.

| # | Any stored record has Email AND Password both matching the input? | Resulting action |
|---|---|---|
| 1 | Yes | `logginName` appended (Finding 5); alert "Login successfull"; `loginStatus` set `true`; redirect to `index.html` |
| 2 | No | Alert "Incorrect Id or password"; redirect to **`signup.html`** (Finding 6) — no session created |

**Table 3 — Navbar render** (`navbar.js` vs. the static markup in `signin.html`/`signup.html`).

| # | `loginStatus` | Page | Rendered navbar |
|---|---|---|---|
| 1 | true | `index.html` (or any `navbar.js` page) | Dynamic authenticated navbar: avatar, "Log Out", Cart icon with count |
| 2 | false | `index.html` (or any `navbar.js` page) | Dynamic guest navbar: "Sign In", "Sign Up" |
| 3 | true | `signin.html` or `signup.html` | Static guest-style navbar regardless — plain unguarded links, non-functional search, static cart image (Finding 7, defect) |
| 4 | false | `signin.html` or `signup.html` | Same static navbar (correct for this state, but indistinguishable from row 3 — the defect is that row 3 doesn't differ from row 4) |

---

## Test Case Register

| TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule |
|---|---|---|---|---|---|---|---|---|---|
| TC-001 | Top menu | Negative | Guest blocked from all 4 gated sections | Guest; `loginStatus` not `true`; on `index.html` | MEN, WOMEN, KIDS, HOME & LIVING | 1. Click each of the 4 items in turn, returning to `index.html` between clicks | Each click triggers "Please Login First" and redirects to `signin.html` | High | BR2 |
| TC-002 | Top menu | Positive | Authenticated user opens all 4 gated sections | Authenticated; on `index.html` | Login: "john.doe@test.com" / "Test@1234" | 1. Log in; click each of the 4 items in turn, returning via Logo between clicks | Each click navigates directly, no alert | High | BR2 |
| TC-003 | Search | Positive | Valid, complete term returns results | Any user; on `index.html` | Search text: "Shoes" | 1. Type "Shoes"; commit via Tab | Alert states match count; redirects to `search.html` | High | BR4 |
| TC-004 | Search | Negative | Half/partial term incorrectly accepted (defect) | Any user | Search text: "Sho" | 1. Type "Sho"; commit | Defect: results returned, contradicting BR4 | Medium | BR4 |
| TC-005 | Search | Negative | Alphanumeric text correctly rejected | Any user | Search text: "Shoe99" | 1. Type "Shoe99"; commit | "Product not Found" | Medium | BR4 |
| TC-006 | Search | Negative | Purely numeric text correctly rejected | Any user | Search text: "12345" | 1. Type "12345"; commit | "Product not Found" | Medium | BR4 |
| TC-007 | Search | Negative | Spaces-only text correctly rejected | Any user | Search text: "   " | 1. Type 3 spaces; commit | "Product not Found" | Medium | BR4 |
| TC-008 | Search | Negative | Internal-spaces text correctly rejected | Any user | Search text: "Sho es" | 1. Type "Sho es"; commit | "Product not Found" | Medium | BR4 |
| TC-009 | Search | Negative | Empty submission incorrectly accepted (defect) | Any user | Search text: "" (typed then deleted) | 1. Type a char, delete it, commit | Defect: full catalog "found," redirects | Medium | BR4 |
| TC-010 | Search | Positive | Placeholder text when empty | Any user; search bar untouched | N/A | 1. Read the placeholder | Reads "Search for products, brands & more" | Low | BR8 |
| TC-011 | Logo | Positive | Logo click returns home | Guest; on `about-us.html` | N/A | 1. Click the Logo | Navigates to `index.html` | Low | BR1 |
| TC-012 | Logo | Compatibility | Logo renders/functions identically across pages and login states | Guest+Authenticated | Pages: `index.html`, `about-us.html`, `mens.html` | 1. Check on all 3 pages, guest then authenticated | Identical image/position/behavior throughout | Medium | BR7 |
| TC-013 | Logo | Recovery | Logo survives logout | Authenticated | N/A | 1. Log out; click Logo | Still renders and navigates home | Medium | BR7 |
| TC-014 | Logo | Recovery | Logo survives a hard cache/localStorage clear | Authenticated | N/A | 1. Clear all storage; reload; click Logo | Reverts to guest state; Logo still works | Medium | BR7 |
| TC-015 | Logo | Compatibility | Logo across Chrome/Edge/Firefox/Safari/incognito | Guest | 5 environments | 1. Repeat click-check in each | Identical in all 5 | Low | BR7 |
| TC-016 | Sign In | Positive | Valid credentials sign in successfully | Guest; account exists | Email "jane.doe@test.com", Password "Secure@123" | 1. Enter and submit | "Login successfull"; `loginStatus`=true; `logginName` gains this record (Finding 5); redirect home | High | BR5 |
| TC-017 | Sign In | Negative | Unregistered email, well-formed password | Guest | Email "nobody@test.com", Password "Secure@123" | 1. Submit | "Incorrect Id or password"; then redirected to **`signup.html`**, not back to Sign In — record this redirect as the observed behavior alongside the alert (Finding 6) | High | BR5 |
| TC-018 | Sign In | Negative | Registered email, wrong password | Guest; account exists | Email "jane.doe@test.com", Password "WrongPass1" | 1. Submit | "Incorrect Id or password"; redirected to `signup.html` (Finding 6); no session | High | BR5 |
| TC-019 | Sign In | Negative | Email field empty (single-field permutation) | Guest | Email "", Password "Secure@123" | 1. Submit | No stored record has an empty Email, so no match; "Incorrect Id or password"; redirected to `signup.html` | Medium | BR5 |
| TC-020 | Sign In | Negative | Password field empty (single-field permutation) | Guest | Email "jane.doe@test.com", Password "" | 1. Submit | No stored record has an empty Password; "Incorrect Id or password"; redirected to `signup.html` | Medium | BR5 |
| TC-021 | Sign In | Negative | Both fields empty (all-empty permutation) | Guest | Email "", Password "" | 1. Submit blank | "Incorrect Id or password"; redirected to `signup.html` | Medium | BR5 |
| TC-022 | Sign In | Positive | Terms of Services link | Any user | N/A | 1. Click link | Navigates to `terms-of-use.html` | Low | BR8 |
| TC-023 | Sign In | Compatibility | Sign In button from Home | Guest | N/A | 1. Click | Navigates to `signin.html` | Medium | BR8 |
| TC-024 | Sign In | Compatibility | Sign In button from Contact Us | Guest | N/A | 1. Click | Navigates to `signin.html` | Medium | BR8 |
| TC-025 | Sign In | Compatibility | Sign In button from Blog | Guest | N/A | 1. Click | Navigates to `signin.html` | Medium | BR8 |
| TC-026 | Sign In | Compatibility | Sign In button from About Us | Guest | N/A | 1. Click | Navigates to `signin.html` | Medium | BR8 |
| TC-027 | Sign In | Compatibility | Sign In button from Terms of Use | Guest | N/A | 1. Click | Navigates to `signin.html` | Medium | BR8 |
| TC-028 | Sign In | Positive | Sign Up link on Sign In page | Any user | N/A | 1. Click | Navigates to `signup.html` | Low | BR8 |
| TC-029 | Sign Up | Positive | Valid registration | Guest; `userdata` lacks this email | Name "John Doe", Email "john.doe@test.com", Password "Test@1234" | 1. Fill and submit | No alert; `userdata` updated; redirect to `signin.html` | High | BR6 |
| TC-030 | Sign Up | Negative | Full Name empty only (single-field permutation) | Guest | Name "", Email "jane@test.com", Password "Test@1234" | 1. Submit | "Enter correct name" | Medium | BR6 |
| TC-031 | Sign Up | Negative | Email empty only (single-field permutation, others valid) | Guest | Name "Jane", Email "", Password "Test@1234" | 1. Submit | "Enter correct Email" — the empty string fails the `.substring(-4)!=".com"` check | Medium | BR6 |
| TC-032 | Sign Up | Negative | Password empty only (single-field permutation, others valid) | Guest | Name "Jane", Email "jane@test.com", Password "" | 1. Submit | "Weak Password:Enter atleast 8 character" | Medium | BR6 |
| TC-033 | Sign Up | Negative | All three fields empty (all-empty permutation) | Guest | Name "", Email "", Password "" | 1. Submit | "Enter correct name" (first evaluated check fires) | Medium | BR6 |
| TC-034 | Sign Up | Negative | Email missing ".com" | Guest | Name "Jane", Email "jane@test.org", Password "Test@1234" | 1. Submit | "Enter correct Email" | Medium | BR6 |
| TC-035 | Sign Up | Negative | Defect: email missing "@" incorrectly accepted | Guest | Name "Sam", Email "johndoe.com", Password "Test@1234" | 1. Submit | Defect: no alert; malformed email saved | Medium | BR6 |
| TC-036 | Sign Up | Compatibility | Sign Up button from Home | Guest | N/A | 1. Click | Navigates to `signup.html` | Medium | BR8 |
| TC-037 | Sign Up | Compatibility | Sign Up button from Contact Us | Guest | N/A | 1. Click | Navigates to `signup.html` | Medium | BR8 |
| TC-038 | Sign Up | Compatibility | Sign Up button from Blog | Guest | N/A | 1. Click | Navigates to `signup.html` | Medium | BR8 |
| TC-039 | Sign Up | Compatibility | Sign Up button from About Us | Guest | N/A | 1. Click | Navigates to `signup.html` | Medium | BR8 |
| TC-040 | Sign Up | Compatibility | Sign Up button from Terms of Use | Guest | N/A | 1. Click | Navigates to `signup.html` | Medium | BR8 |
| TC-041 | Sign Up | Negative | Password under 8 characters | Guest | Name "Alex", Email "alex@test.com", Password "Pass1" | 1. Submit | "Weak Password..." | Medium | BR6 |
| TC-042 | Cart/Basket | Positive | Basket shows 0 after fresh login | Authenticated, `cartData` empty | `cartData`: `[]` | 1. Log in; read badge | Shows "0" | High | BR3 |
| TC-043 | Cart/Basket | Positive | Basket increments across 2 sequential adds | Authenticated | Product A, Product B on `mens.html` | 1. Add A, confirm "1"; add B, confirm "2" | Reads "1" then "2" | High | BR3 |
| TC-044 | Cart/Basket | Positive | Basket decreases on removal | Authenticated, 2 items | Same 2 products | 1. Remove one via `cart.html` | Reads "1" | High | BR3 |
| TC-045 | Cart/Basket | Compatibility | Basket persists across pages while logged in | Authenticated, 1 item | Pages: `index.html`,`about-us.html`,`mens.html` | 1. Navigate across all 3 | Shows "1" throughout | Medium | BR7 |
| TC-046 | Cart/Basket | State Transition | Basket disappears on logout | Authenticated, non-zero cart | N/A | 1. Log out | No Basket icon shown | High | BR3 |
| TC-047 | Cart/Basket | Negative | Static cart image on Sign In/Sign Up (defect) | Guest+Authenticated | N/A | 1. Compare cart image logged-out vs logged-in-with-items on both pages | Same static image both times, no badge — consistent with Finding 7 (these pages never branch on `loginStatus`) | Medium | BR3 |
| TC-048 | Cart/Basket | Negative | No Cart icon on any checkout page (defect) | Authenticated, non-empty cart | Pages: `cart.html`,`address.html`,`payment.html`,`otp.html` | 1. Inspect navbar on each | No Cart icon anywhere | Medium | BR7 |
| TC-049 | Cart/Basket | Recovery | Basket reverts after hard cache clear | Authenticated, non-empty cart | N/A | 1. Clear storage; reload | Reverts to guest state, no Basket | Medium | BR7 |
| TC-050 | Cart/Basket | Compatibility | Basket across 5 browser environments | Authenticated, 1 item | 5 environments | 1. Repeat login+add in each | Shows "1" in all 5 | Low | BR7 |
| TC-051 | Footer | Positive | Contact Us footer link | Guest | N/A | 1. Click | Navigates to `contact-us.html` | Medium | BR1 |
| TC-052 | Footer | Positive | Blog footer link | Guest | N/A | 1. Click | Navigates to `blog.html` | Medium | BR1 |
| TC-053 | Footer | Positive | About Us footer link | Guest | N/A | 1. Click | Navigates to `about-us.html` | Medium | BR1 |
| TC-054 | Footer | Positive | Terms of use footer link | Guest | N/A | 1. Click | Navigates to `terms-of-use.html` | Medium | BR1 |
| TC-055 | Footer | Negative | Static footer items don't navigate | Guest | Listed static items | 1. Click each in turn | No navigation, no error | Low | BR1 |
| TC-056 | Footer | Negative | Footer "Men" bypasses login (defect) | Guest | N/A | 1. Click "Men" cell | Defect: navigates to `mens.html` unauthenticated | High | BR2 |
| TC-057 | Footer | Positive | 3 promotional lines present | Any user | N/A | 1. Read footer text | All 3 lines present | Low | BR8 |
| TC-058 | Footer | Compatibility | Footer identical across the 8 pages that have it, both login states | Guest+Authenticated | 8 pages | 1. Compare across all 8, both states | Identical throughout | Medium | BR7 |
| TC-059 | Footer | Negative | Footer missing from 8 pages (defect) | Any user | 8 pages | 1. Check each | Defect: footer entirely absent | Medium | BR7 |
| TC-060 | Footer | Recovery | Footer survives hard cache clear | Any user | N/A | 1. Clear storage; reload | Unchanged | Low | BR7 |
| TC-061 | Footer | Compatibility | Footer across 5 browser environments | Any user | 5 environments | 1. Repeat check | Identical in all 5 | Low | BR7 |
| TC-062 | Guest User Flows | Positive | Guest can view home page | Guest | N/A | 1. Load `index.html` | Renders fully, no prompt | Medium | BR1 |
| TC-063 | Guest User Flows | Positive | Guest sees no Basket icon | Guest | N/A | 1. Inspect navbar | No Basket icon | Low | BR1 |
| TC-064 | Guest User Flows | Security | Direct-URL bypass of login gate (defect) | Guest | URL: `mens.html` | 1. Type URL directly | Defect: loads with no login check | High | BR2,BR10 |
| TC-065 | Guest User Flows | Security | Sign In/Sign Up's own unguarded category links (defect) | Guest | N/A | 1. On `signin.html`, click "MEN" | Defect: loads unauthenticated | High | BR2,BR10 |
| TC-066 | Authenticated User Flows | State Transition | Session persists across multiple gated navigations | Authenticated | N/A | 1. Visit MEN, WOMEN, KIDS in sequence | No re-prompt at any step | Medium | BR2,BR9 |
| TC-067 | Authenticated User Flows | State Transition | Logout returns to guest home state | Authenticated | N/A | 1. Click Log Out | `loginStatus` cleared; guest UI shown | High | BR1,BR9 |
| TC-068 | Equivalence Classes | Equivalence Class | Sign Up Email field partitions | Guest | Class 1 (valid): "a@b.com"<br>Class 2 (invalid, no ".com"): "a@b.org"<br>Class 3 (invalid, no "@", but passes the code's actual check): "ab.com" | 1. Register once per class, in turn, with a fresh email each time | Class 1: account created. Class 2: "Enter correct Email". Class 3: **no alert, account created** — the code has no partition for "missing @" at all, since its only check is the ".com" suffix; this is Class 3's own valid-per-code equivalence class, not a rejected one, and stands as a defect against the reasonable email-validity expectation | High | BR6 |
| TC-069 | Equivalence Classes | Equivalence Class | Sign Up Password field partitions | Guest | Class 1 (invalid, <8): "Ab1@12"<br>Class 2 (valid, ≥8, ordinary): "Ab1@1234"<br>Class 3 (valid-per-code, ≥8, all whitespace): "        " (8 spaces) | 1. Register once per class | Class 1: "Weak Password...". Class 2: account created. Class 3: **no alert, account created** — `length<8` has no character-class check, so an all-whitespace string of sufficient length is its own valid class; log as a defect | High | BR6 |
| TC-070 | Equivalence Classes | Equivalence Class | Sign In match/no-match partitions | Guest; account exists | Class 1 (both fields match one record): "jane.doe@test.com"/"Secure@123"<br>Class 2 (Email matches a record, Password does not): "jane.doe@test.com"/"Wrong1"<br>Class 3 (Email matches no record at all): "nobody@test.com"/"Secure@123" | 1. Attempt sign-in once per class | Class 1: success. Classes 2 and 3 produce the **identical** "Incorrect Id or password" outcome and redirect (per Decision Table 2) — confirming the code treats "wrong password" and "unknown email" as one equivalence class, not two | Medium | BR5 |
| TC-071 | Boundary — Sign Up Password | Boundary (reject) | 7-character password rejected | Guest | Password "Abcd@12" | 1. Register with this password | "Weak Password..." alert | High | BR6 |
| TC-072 | Boundary — Sign Up Password | Boundary (accept) | Exactly-8-character password accepted | Guest | Password "Abcd@123" | 1. Register | No alert; account created | High | BR6 |
| TC-073 | Boundary — Sign Up Password | Boundary (accept) | 9-character password accepted | Guest | Password "Abcd@1234" | 1. Register | No alert; account created | Medium | BR6 |
| TC-074 | Boundary — Sign Up Password | Boundary (discrepancy) | 8-space password incorrectly accepted (defect) | Guest | Password: 8 spaces | 1. Register | Defect: no alert; whitespace-only password saved | High | BR6 |
| TC-075 | Boundary — Sign Up Email | Boundary (accept) | Minimal valid email "a@b.com" accepted | Guest | Email "a@b.com" | 1. Register | No alert; account created | Medium | BR6 |
| TC-076 | Boundary — Sign Up Email | Boundary (discrepancy) | Email ending in uppercase ".COM" incorrectly rejected | Guest | Email "pat@test.COM" | 1. Register | "Enter correct Email" — `.substring(-4)!=".com"` is case-sensitive; log as a discrepancy against reasonable BR6 expectation | Low | BR6 |
| TC-077 | Boundary — Sign Up Full Name | Boundary (discrepancy) | Single-space Full Name incorrectly satisfies the non-empty gate | Guest | Name: " " (one space) | 1. Register with a single space as the Full Name | Defect: `" ".length` is 1, not `<=0`, so no "Enter correct name" alert appears; account created with a blank-looking name | Medium | BR6 |
| TC-078 | Boundary — Search Input | Boundary (reject) | Valid term with one extra character does not return results | Any user | Search text: "Shoess" | 1. Type "Shoess"; commit | "Product not Found" — confirms correct BR4 compliance | Medium | BR4 |
| TC-079 | Boundary — Search Input | Boundary (reject) | Valid term with a trailing space does not return results | Any user | Search text: "Shoes " | 1. Type "Shoes" plus a trailing space; commit | "Product not Found" | Medium | BR4 |
| TC-080 | Boundary — Search Input | Boundary (discrepancy) | Lowercase variant incorrectly treated as an exact match | Any user | Search text: "shoes" | 1. Type "shoes"; commit | Results returned identical to "Shoes" — case-insensitive matching, a discrepancy against BR4's "exact" wording | Low | BR4 |
| TC-081 | Decision Tables | Decision Table | Sign Up row 1 — Name invalid, other fields irrelevant | Guest | Name "", Email "not-an-email", Password "1" | 1. Submit | "Enter correct name" only — confirms Email/Password are never evaluated once Name fails (Table 1, row 1) | High | BR6 |
| TC-082 | Decision Tables | Decision Table | Sign Up row 2 — Name valid, Email invalid, Password irrelevant | Guest | Name "Sam", Email "sam@test.org", Password "1" | 1. Submit | "Enter correct Email" only — confirms Password is never evaluated once Email fails (Table 1, row 2) | High | BR6 |
| TC-083 | Decision Tables | Decision Table | Sign Up row 3 — Name valid, Email valid, Password invalid | Guest | Name "Sam", Email "sam@test.com", Password "short" | 1. Submit | "Weak Password..." (Table 1, row 3) | High | BR6 |
| TC-084 | Decision Tables | Decision Table | Sign Up row 4 — all three valid | Guest | Name "Sam", Email "sam@test.com", Password "Sam@1234" | 1. Submit | Account created, redirect to `signin.html` (Table 1, row 4) | High | BR6 |
| TC-085 | Decision Tables | Decision Table | Sign In row 1 — Email and Password both match one record | Guest; account exists | Matching Email/Password pair | 1. Submit | Success path (Table 2, row 1); `logginName` gains the record (Finding 5) | High | BR5 |
| TC-086 | Decision Tables | Decision Table | Sign In row 2 — no record matches both fields together | Guest; account exists with a different password | Registered Email + wrong Password | 1. Submit | Failure path, redirect to `signup.html` (Table 2, row 2, Finding 6) | High | BR5 |
| TC-087 | Decision Tables | Decision Table | Navbar row 1 vs row 3 — same `loginStatus=true`, different page family | Authenticated | Pages: `index.html` then `signin.html` | 1. While authenticated, load `index.html`; note the dynamic navbar<br>2. Navigate directly to `signin.html`; note the navbar shown | `index.html` shows the dynamic authenticated navbar (Table 3, row 1); `signin.html` shows the static guest-style navbar regardless (Table 3, row 3) — log the inconsistency as a defect (Finding 7) | Medium | BR7 |
| TC-088 | State Transitions | State Transition | Guest → Authenticated, on valid sign-in | Guest | Valid credentials | 1. Sign in | `loginStatus` becomes `true`; navbar (on `navbar.js` pages) switches to authenticated variant | High | BR9 |
| TC-089 | State Transitions | State Transition | Authenticated → Guest, on logout | Authenticated | N/A | 1. Log out | `loginStatus` becomes `false`; navbar reverts to guest variant | High | BR9 |
| TC-090 | State Transitions | State Transition | Re-entry into the Authenticated state (already-authenticated user reloads) | Authenticated | N/A | 1. Reload `index.html` while already logged in | Remains authenticated; no re-prompt, no duplicate session artifact created | Medium | BR9 |
| TC-091 | State Transitions | State Transition | Cart 0 → n → 0 | Authenticated, empty cart | 1 product | 1. Add the product (0→1); remove it (1→0) | Badge reads "1" then "0"; `cartData` empty again | High | BR3,BR9 |
| TC-092 | State Transitions | State Transition | Invalid transition attempt — Guest tries to reach Authenticated-only state directly | Guest | URL: `mens.html` | 1. Navigate directly to the URL | `verifyLogin()`'s guest branch redirects to `signin.html` with an alert — the invalid transition is blocked, not silently permitted, for pages using `navbar.js` (contrast with TC-065's Sign In/Sign Up exception) | High | BR2,BR9 |
| TC-093 | Data Integrity | Data Integrity | Registered record holds every field exactly as typed | Guest | Name "Data Integrity Test", Email "dit@test.com", Password "DitPass@1" | 1. Register<br>2. Inspect `userdata` in DevTools | All 3 fields present, unmodified, no truncation or type coercion | High | BR8 |
| TC-094 | Data Integrity | Data Integrity | Cart count stays arithmetically consistent with underlying items | Authenticated | 3 distinct products | 1. Add all 3<br>2. Inspect `cartData`'s length vs. the displayed badge | Badge equals `cartData.length` (3) at every step | High | BR3,BR8 |
| TC-095 | Data Integrity | Data Integrity | `logginName` accumulates a full, unbounded, plaintext-bearing record on every login (defect) | Guest; account exists; `logginName` empty or pre-populated | 3 sequential logins with the same account | 1. Inspect `logginName`'s length before any login<br>2. Log in, log out, log in again, log out, log in again (3 total logins)<br>3. Inspect `logginName`'s length and contents after | Per BR8's "no silent... loss" this is technically consistent (nothing is lost), but the array has grown by exactly 3 entries, each a full copy of the record including the plaintext password, with no deduplication or cap — record this unbounded, credential-duplicating growth as a defect (Finding 5) | High | BR8,BR10 |
| TC-096 | Data Integrity | Data Integrity | `userdata` is not truncated or reordered across multiple registrations | Guest | 3 distinct new accounts, registered in sequence | 1. Register account A, then B, then C<br>2. Inspect `userdata` | All 3 entries present, in registration order, each with all 3 fields intact | Medium | BR8 |
| TC-097 | Concurrency | Concurrency | Two tabs, same account: login in Tab A not reflected in Tab B without reload | Guest; `index.html` open in two tabs (A and B) | Valid credentials | 1. In Tab A, sign in<br>2. Without reloading, switch to Tab B and inspect its navbar | Tab B still shows the guest-state navbar despite `loginStatus` now being `true` in storage — no cross-tab sync exists (confirmed: no `storage` event listener anywhere in the codebase) | Medium | BR9 |
| TC-098 | Concurrency | Concurrency | Same account signed in on two different browsers does not share state | One account; Chrome and Firefox both available | Same credentials in both | 1. Log in and add a product in Chrome; confirm Basket "1"<br>2. Log in with the same account in Firefox | Firefox's Basket shows "0" — `localStorage` is per-browser-profile; sessions are entirely independent (an inherent architectural characteristic, not a bug to fix, but worth documenting) | Low | BR9 |
| TC-099 | Concurrency | Concurrency | Rapid double-submit of the Sign Up form | Guest | Name "Double Sub", Email "doublesub@test.com", Password "Double@123" | 1. Fill the form once<br>2. Click "Sign up" twice in very rapid succession (e.g. via double-click) before the page navigates away<br>3. Inspect `userdata` | Because the handler calls `window.location.replace()` synchronously after the single `push`+`setItem` call, and the browser begins navigating away on the first click, at most one entry is expected — inspect `userdata` to confirm whether one or two identical entries were created, and log a duplicate-write defect if two appear | Medium | BR9 |
| TC-100 | Recovery | Recovery | Entered Sign Up data does not survive a failed submit (expected, not a defect) | Guest | Name "Temp Test", Email "temp@test.org" (invalid domain), Password "Temp@1234" | 1. Fill all 3 fields<br>2. Submit (triggers "Enter correct Email")<br>3. Inspect the Email field's value afterward | The already-typed Name and Password values remain in their fields (the page does not reload), but Email is not corrected automatically — the user must fix and resubmit; this is standard behavior, not a defect | Low | BR11 |
| TC-101 | Recovery | Recovery | Failed sign-in does not return the user to a retryable Sign In state (defect) | Guest; account exists | Email "jane.doe@test.com", Password "WrongPass1" | 1. Submit<br>2. Observe the resulting page | Per reasonable recovery expectation, a failed login should let the user immediately retry on the same form. **Record actual behavior — expected to FAIL, log as a defect:** the user is redirected to `signup.html`, not back to `signin.html` (Finding 6); they must navigate back to Sign In manually to retry | High | BR11 |
| TC-102 | Recovery | Recovery | Storage-write failure during registration (storage disabled) | Guest; browser configured to block site storage (e.g. strict private-window storage blocking) | Name "Blocked", Email "blocked@test.com", Password "Blocked@123" | 1. Disable site storage via browser privacy settings<br>2. Attempt registration<br>3. Observe the page and DevTools Console | With no `try/catch` anywhere in `signup.html`'s script, `localStorage.setItem()` throws uncaught in a storage-disabled context — registration fails with a Console exception rather than a user-facing message; log as a graceful-degradation defect | Medium | BR11 |
| TC-103 | Recovery | Recovery | Browser-back after a successful login redirect | Authenticated (just signed in, on `index.html`) | N/A | 1. Sign in (redirects to `index.html`)<br>2. Press the browser Back button | Returns to `signin.html`; the form is empty (no cached-form defect); `loginStatus` remains `true` in storage regardless of the back-navigation | Medium | BR11 |
| TC-104 | Recovery | Recovery | Refresh part-way through the Sign Up form | Guest | Name "Half Typed" typed into the Full Name field only, not submitted | 1. Type "Half Typed" into Full Name<br>2. Refresh the page (F5)<br>3. Inspect the Full Name field | Field is empty after refresh — no autosave/sessionStorage exists anywhere in `signup.html`; expected behavior, not a defect | Low | BR11 |
| TC-105 | Client-Side Security | Security | Script payload in Full Name is stored raw but never rendered anywhere | Guest | Name `<script>alert(1)</script>`, Email "xsstest@test.com", Password "Test@1234" | 1. Register using the script-tag string as Full Name<br>2. Inspect `userdata` to confirm the raw string is stored<br>3. Log in and inspect the entire authenticated navbar/page for any rendering of the name | `userdata` stores the literal unescaped string; the name is never displayed anywhere in the UI after login (`navbar.js`'s authenticated branch never references `el.name`) — the payload has no rendering surface within this scope, so no script executes; a compliant-by-omission finding, not a proper output-encoding guarantee | Medium | BR10 |
| TC-106 | Client-Side Security | Security | Password stored as plain, unencoded text in TWO separate client-storage locations (defect) | Guest; freshly registered and then signed-in account | Password "Test@1234" | 1. Register a new account<br>2. Inspect `userdata` in DevTools<br>3. Sign in with the same account<br>4. Inspect `logginName` in DevTools | Both `userdata` and, after signing in, `logginName` hold the literal plaintext password "Test@1234" with no hashing or encoding — `logginName` (Finding 5) doubles the client-side plaintext-credential exposure surface beyond what prior rounds identified | High | BR10 |
| TC-107 | Client-Side Security | Security | Sign-in failure message does not distinguish an unregistered email from a wrong password (compliant) | Guest | Case A: unregistered email; Case B: registered email + wrong password | 1. Attempt sign-in with Case A; note the message<br>2. Attempt sign-in with Case B; note the message | Both show identical "Incorrect Id or password" and both redirect identically to `signup.html` — the app does not leak whether a given email is registered (compliant, per Equivalence Class TC-070) | Medium | BR10 |
| TC-108 | Client-Side Security | Security | No lockout, delay, or throttle after repeated failed sign-in attempts | Guest | 10 consecutive wrong-password attempts against a registered email | 1. Submit the sign-in form with a valid email and wrong password 10 times in rapid succession | Per reasonable practice, repeated failures should eventually be throttled. **Record actual behavior — expected to FAIL, log as a defect (low real-world severity, no server tier to brute-force):** all 10 attempts process identically with no growing delay or lockout | Low | BR10 |
| TC-109 | Client-Side Security | Security | No stack trace, path, or version leaks to console on failure paths | Guest | Failed sign-in; failed sign-up | 1. Open DevTools Console<br>2. Trigger a failed sign-in (wrong password)<br>3. Trigger a failed sign-up (invalid email)<br>4. Review Console output | No stack traces, file paths, or version strings appear during either failure path — both use `alert()`, producing no console output | Low | BR10 |
| TC-110 | Client-Side Security | Security | Client-side access gate is bypassable by direct URL and by an alternative link (defect) | Guest | URL: `mens.html`; alternative link: MEN on `signin.html` | 1. Type `mens.html` directly into the address bar<br>2. Separately, as a guest, click "MEN" from `signin.html`'s own navbar | Both bypass the login gate and load the gated page unauthenticated — logged as the same underlying defect already captured in TC-064/TC-065, cross-referenced here under the Security technique per BR10 | High | BR10 |
| TC-111 | Compliance | Compliance | Privacy Policy footer item does not resolve to a real document (defect) | Any user | N/A | 1. Click "Privacy Policy" in the footer | No navigation occurs — the item is static text with no destination document anywhere in the project | Medium | BR13 |
| TC-112 | Compliance | Compliance | Terms of use/Terms of Services resolve to real content (compliant) | Any user | N/A | 1. Click the Terms link from Sign In, Sign Up, and Footer in turn | All three resolve to `terms-of-use.html`, which contains substantive policy text | Low | BR13 |
| TC-113 | Compliance | Compliance | No consent is obtained before writing to client storage (zero-case/defect) | Guest, first visit, no prior storage | Registration or first cart-add action | 1. Clear all site storage<br>2. Perform a registration or an add-to-cart action<br>3. Observe whether any consent prompt appears before or during the action | No consent banner or prompt of any kind appears at any point — `localStorage` writes begin immediately; record this absence as the finding per Rule 6/12 | Low | BR13 |
| TC-114 | Analytics | Analytics | No tracking/analytics call fires on key actions (zero-case) | Any user | Actions: page load, search, sign-in, sign-up, add-to-cart | 1. Grep the entire codebase for `gtag`, `dataLayer`, `analytics`, `fetch(`, `sendBeacon`, `XMLHttpRequest`<br>2. Separately, open DevTools Network while performing each of the 5 listed actions | Grep returns zero matches across all `.js` files (Finding 8); Network panel shows no outbound requests beyond the initial page load's own static assets — no tracking layer exists at all; this is the expected, correctly-reported zero-case for a local client-only demo | Low | Unmapped (no stating rule for Analytics) |
| TC-115 | Usability | Usability | Each Sign Up error names its specific field (compliant, objective check) | Guest | 3 submissions: blank name; invalid email; short password | 1. Trigger each of the 3 errors in turn | Each alert names a specific field ("name", "Email", "Password") — objectively verifiable, compliant | Medium | Unmapped (no stating rule for Usability) |
| TC-116 | Usability | Usability | Sign-in failure message does not name a specific field (objective check, may be intentional per BR10) | Guest | Wrong password | 1. Submit mismatched credentials | The single message "Incorrect Id or password" does not identify which of the two fields was wrong — objectively verifiable as less field-specific than Sign Up's errors, though this may be an intentional security trade-off (see TC-107) rather than a usability defect in isolation | Low | Unmapped |
| TC-117 | Usability | Usability | Minimum steps to complete the Sign In journey against the UI's own minimum | Guest; account exists | Valid credentials | 1. Count the exact number of interactions (field focus + type + field focus + type + submit) needed to sign in, starting from `signin.html` | 5 interactions is both the counted and the minimum the UI allows — no extra steps are imposed by the application | Low | Unmapped |
| TC-118 | Usability | Usability | No destructive/irreversible action lacks confirmation (zero-case for this scope) | Authenticated | Logout action | 1. Click "Log Out" | Logout executes immediately with no confirmation dialog — logout is reversible (the user can simply sign in again), so the absence of a confirmation step is not itself a defect; recorded as the objective finding | Low | Unmapped |
| TC-119 | Compatibility | Compatibility | Sign In submit path across 4 browsers + incognito | Guest; account exists | Valid credentials; 5 environments | 1. Repeat a full sign-in in Chrome, Edge, Firefox, Safari, and one incognito window | Identical success behavior in all 5 | Medium | BR7 |
| TC-120 | Compatibility | Compatibility | Sign Up submit path across 4 browsers + incognito | Guest; 5 environments | Distinct new account per environment | 1. Repeat a full registration in each of the 5 environments | Identical success behavior in all 5; no cross-environment data leakage since `localStorage` is per-profile | Medium | BR7 |
| TC-121 | Compatibility | Compatibility | Native `alert()` dialogs render consistently across environments | Any user; 5 environments | Any validation-triggering input | 1. Trigger one alert (e.g. empty search) in each of the 5 environments | Native dialog appears and blocks interaction identically in all 5 (browser-native behavior, not app-controlled) | Low | BR7 |
| TC-122 | Localisation | Localisation | No locale-aware formatting exists; all text is hardcoded English (zero-case, finding is the hardcoded strings) | Any user | N/A | 1. Grep the codebase for `Intl.`, `toLocaleString`, `i18n`, `locale`<br>2. Inspect all user-visible strings on the 3 pages for hardcoding | Grep returns zero matches (Finding 9); every user-visible string ("Sign In", "Enter correct Email", "Product not Found", etc.) is a hardcoded English literal in the source — record this as the substance of the section, not merely an absence | Low | Unmapped (no stating rule for Localisation) |
| TC-123 | Localisation | Localisation | `lang` attribute is present and correct (compliant, partial finding) | Any user | N/A | 1. Inspect `<html>`'s `lang` attribute on all 3 pages | All 3 carry `lang="en"`, correctly matching the hardcoded English content — a minimal but genuine compliant finding, distinct from the zero-case above | Low | Unmapped |
| TC-124 | SEO & Discoverability | SEO | Page titles are not descriptive or distinct across Sign In/Sign Up (defect) | Any user | N/A | 1. Read `<title>` on `index.html`, `signin.html`, `signup.html` | `index.html`: "Styleup" (present, minimally descriptive). `signin.html` and `signup.html`: both `<title>Document</title>` — identical, non-descriptive, and indistinguishable from each other or from any other unrelated "Document"-titled page; log as a defect against BR14 | Medium | BR14 |
| TC-125 | SEO & Discoverability | SEO | No meta description, canonical, or robots directive on any of the 3 pages (zero-case/defect) | Any user | N/A | 1. Inspect `<head>` on all 3 pages for `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">` | None of the 3 tags is present on any of the 3 pages — record as a defect against BR14's "metadata... needed for it to be indexed correctly" | Low | BR14 |
| TC-126 | SEO & Discoverability | SEO | No `<h1>` exists on any of the 3 pages; heading hierarchy starts at `<h2>` on Sign In/Sign Up (defect) | Any user | N/A | 1. Inspect the full heading structure of all 3 pages | `index.html` has no heading element of any kind in scope; `signin.html`/`signup.html` each have exactly one `<h2>` and no `<h1>` — both patterns skip the top of the hierarchy; log as a defect | Low | BR14 |
| TC-127 | SEO & Discoverability | SEO | Category navigation is real, crawlable anchors (compliant) on Sign In/Sign Up, but script-driven on the dynamic navbar pages (defect) | Any user | N/A | 1. Inspect MEN/WOMEN/KIDS/HOME LIVING on `signin.html` — confirm real `<a href>` tags<br>2. Inspect the same items on `index.html` — confirm they are script-driven `<div>` elements with `click` listeners, not anchors | Sign In/Sign Up's links are genuine crawlable `<a href>` elements (compliant for SEO, though this is the same fact that makes them login-bypassable per Finding 1/TC-065); `index.html`'s equivalent items are `document.createElement('div')` with no `href` of any kind (`navbar.js` lines 59–61), making them invisible to a crawler — log as a defect against BR14 | Medium | BR14 |
| TC-128 | Interface Contract (Client Storage Schema) | Interface Contract | `loginStatus` — single writer, single reader, consistent casing | N/A | N/A | 1. Grep the codebase for `loginStatus`<br>2. Confirm every occurrence's exact casing and value type | Written only by `signin.html` (as boolean `true`) and `navbar.js`'s `logout()` (as boolean `false`); read only by `navbar.js`. Casing is consistent everywhere; no other page reads or writes this key | Medium | BR12 |
| TC-129 | Interface Contract (Client Storage Schema) | Interface Contract | `userdata` — shape and casing agreement between writer and reader | N/A | N/A | 1. Grep the codebase for `userdata`<br>2. Compare the object shape `signup.html` writes against the shape `signin.html` reads | Both use the identical key casing and the identical `{name, Email, Password}` shape (note the deliberately mixed casing of the field names themselves — `name` lowercase, `Email`/`Password` capitalized — consistent between writer and reader, so not itself a defect, merely an unusual convention) | Medium | BR12 |
| TC-130 | Interface Contract (Client Storage Schema) | Interface Contract | `cartData` — consistent across every reader/writer page in the wider site | N/A | N/A | 1. Grep the codebase for `cartData` across all `.js`/`.html` files | Read and written consistently as `cartData` (matching casing) across `cart.html`, `index.js`, `otp.js`, `mens.js`, `womens.js`, `kids.js`, `home&living.js`, and `search.js` — no casing mismatch found anywhere | Low | BR12 |
| TC-131 | Interface Contract (Client Storage Schema) | Interface Contract | `logginName` — write-only key with no consuming reader anywhere (defect) | N/A | N/A | 1. Grep the codebase for `logginName` across every file | Only `signin.html` contains this key, both as reader (of its own prior writes) and writer — no other file references it at all; a key that exists purely to accumulate data no other part of the application ever consumes is a schema-contract defect (Finding 5) | Medium | BR12 |
| TC-132 | Interface Contract (Client Storage Schema) | Interface Contract | Malformed/hand-edited storage value does not crash the page (recovery-adjacent contract check) | Guest | Manually set `userdata` to a malformed value (e.g. the string `"not-json"`) via DevTools | 1. In DevTools Console, run `localStorage.setItem('userdata','not-json')`<br>2. Reload `signin.html` and attempt a sign-in | `JSON.parse("not-json")` throws uncaught — the page's sign-in script fails silently with a Console error rather than degrading gracefully (no `try/catch` exists around any `JSON.parse(localStorage.getItem(...))` call in either `signin.html` or `signup.html`); log as a defect | Medium | BR12,BR11 |
| TC-133 | Accessibility — Keyboard Navigation & Focus | Accessibility | Homepage keyboard operability (WCAG 2.1.1, 2.4.3, 2.4.7) | Guest; keyboard only | Elements: Logo, MEN/WOMEN/KIDS/HOME&LIVING, Search, Sign In, Sign Up | 1. Tab through from the top of `index.html`, recording each element focused | **Record actual behavior — expected to FAIL, log as a defect:** the Logo, category items, and Sign In/Sign Up are all plain `<div>`/`<img>` with no `tabindex`, so none receive Tab focus; only the Search input is keyboard-operable | High | BR15(a) |
| TC-134 | Accessibility — Keyboard Navigation & Focus | Accessibility | Sign In page fully keyboard-completable (WCAG 2.1.1, 2.4.3, 2.4.7) | Guest; keyboard only | Email, Password, submit, Terms link, Sign Up link | 1. Tab through all 5 elements; submit via Enter | All 5 are real form/link elements — fully keyboard-operable, passing | Medium | BR15(a) |
| TC-135 | Accessibility — Keyboard Navigation & Focus | Accessibility | Sign Up page fully keyboard-completable (WCAG 2.1.1, 2.4.3, 2.4.7) | Guest; keyboard only | Full Name, Email, Password, submit, Terms link, Sign In link | 1. Tab through all 6 elements; submit via Enter | All 6 are keyboard-operable, passing | Medium | BR15(a) |
| TC-136 | Accessibility — Forms & Labels | Accessibility | Search field's programmatic label (WCAG 1.3.1, 4.1.2) | Guest; NVDA + DevTools | Search input | 1. Inspect for `<label>`/`aria-label`<br>2. Tab to field with NVDA running | **Expected to FAIL:** no label of any kind exists; NVDA announces no name | High | BR15(b) |
| TC-137 | Accessibility — Forms & Labels | Accessibility | Sign In Email/Password labels (WCAG 1.3.1, 4.1.2) | Guest; NVDA + DevTools | Email, Password fields | 1. Inspect each `<label for="">`<br>2. Tab to each with NVDA running | **Expected to FAIL:** both labels have empty `for=""`, breaking association | High | BR15(b) |
| TC-138 | Accessibility — Forms & Labels | Accessibility | Sign Up Full Name/Email/Password labels (WCAG 1.3.1, 4.1.2) | Guest; NVDA + DevTools | 3 fields | 1. Inspect each `<label for="">`<br>2. Tab to each with NVDA running | **Expected to FAIL:** all three labels have empty `for=""` | High | BR15(b) |
| TC-139 | Accessibility — Images & Alt Text | Accessibility | Logo alt-text consistency across the 3 in-scope pages (WCAG 1.1.1) | Guest; DevTools | Logo on `index.html`, `signin.html`, `signup.html` | 1. Inspect the Logo's `alt` on each page | **Partial FAIL:** `index.html` has `alt="logo"`; Sign In/Sign Up have none | Medium | BR15(c) |
| TC-140 | Accessibility — Contrast | Accessibility | Homepage text contrast (WCAG 1.4.3) | Guest; contrast tool | Top Menu, Search placeholder, Sign In/Up text, Footer | 1. Measure contrast of each element | Record any element below 4.5:1 (3:1 large text) as a FAIL | Medium | BR15(d) |
| TC-141 | Accessibility — Contrast | Accessibility | Sign In page text contrast (WCAG 1.4.3) | Guest; contrast tool | Labels, placeholders, button, links | 1. Measure contrast of each | Record any FAIL | Medium | BR15(d) |
| TC-142 | Accessibility — Contrast | Accessibility | Sign Up page text contrast (WCAG 1.4.3) | Guest; contrast tool | Labels, placeholders, button, links | 1. Measure contrast of each | Record any FAIL | Medium | BR15(d) |
| TC-143 | Accessibility — Error Identification | Accessibility | Sign In error is perceivable but not field-specific (WCAG 3.3.1) | Guest | Mismatched credentials | 1. Submit; observe message | Native `alert()`, perceivable, but does not name a specific field | Medium | BR15(e) |
| TC-144 | Accessibility — Error Identification | Accessibility | Sign Up errors are perceivable and field-specific (WCAG 3.3.1) | Guest | Blank name; invalid email; short password (3 submissions) | 1. Trigger each of the 3 errors in turn | Each alert names its specific field — compliant | Medium | BR15(e) |
| TC-145 | Accessibility — Page Titles & Structure | Accessibility | Homepage title and heading structure (WCAG 2.4.2, 1.3.1) | Guest | N/A | 1. Read `<title>`<br>2. Inspect headings | Title "Styleup" passes; no `<h1>` exists anywhere on the page — a defect | Low | BR15(f) |
| TC-146 | Accessibility — Page Titles & Structure | Accessibility | Sign In title and heading structure (WCAG 2.4.2, 1.3.1) | Guest | N/A | 1. Read `<title>`<br>2. Inspect headings | **Expected to FAIL:** `<title>Document</title>`; only heading is `<h2>Sign In</h2>`, skipping `h1` | Medium | BR15(f) |
| TC-147 | Accessibility — Page Titles & Structure | Accessibility | Sign Up title and heading structure (WCAG 2.4.2, 1.3.1) | Guest | N/A | 1. Read `<title>`<br>2. Inspect headings | **Expected to FAIL:** `<title>Document</title>`, identical to Sign In's; only heading is `<h2>Sign Up</h2>` | Medium | BR15(f) |
| TC-148 | Cross-Feature End-to-End Journeys | End-to-End | New account → login → gated category access, ending in a persisted-state assertion | Guest, no prior account | Name "Nina Test", Email "nina.test@test.com", Password "Nina@1234" | 1. Blocked from MEN as guest<br>2. Sign up<br>3. Sign in<br>4. Access MEN<br>5. Inspect `userdata` and `loginStatus` in DevTools to confirm the record and flag both persisted correctly | All steps succeed in order; `userdata` contains the exact registered record; `loginStatus` is `true` — the journey proves the data landed, not just that pages changed | High | BR1,BR6,BR5,BR2,BR8 |
| TC-149 | Cross-Feature End-to-End Journeys | End-to-End | Basket lifecycle across add/remove/logout, ending in a persisted-state assertion | Authenticated, empty cart | Product A, B on `womens.html` | 1. Add both, confirm "2"<br>2. Remove one, confirm "1"<br>3. Logout<br>4. Inspect `cartData` in DevTools to confirm it still holds exactly 1 entry despite logout | Counts correct at each UI step; icon gone post-logout; `cartData` persists with 1 entry, confirming the cart survives logout (cross-referenced with BR9 state-transition behavior) | High | BR1,BR2,BR3,BR9 |
| TC-150 | Cross-Feature End-to-End Journeys | End-to-End | Guest search then still-gated category | Guest | Search "Shoes" | 1. Search succeeds<br>2. KIDS still blocked | Both hold | High | BR1,BR4,BR2 |
| TC-151 | Cross-Feature End-to-End Journeys | End-to-End | Empty-search defect then still-gated category | Guest | Empty search | 1. Empty search wrongly succeeds<br>2. HOME&LIVING still blocked | Defect + correct gate | High | BR4,BR2 |
| TC-152 | Cross-Feature End-to-End Journeys | End-to-End | Full guest-to-basket journey via footer + failed-then-successful sign-in + category, ending in a persisted-state assertion | Guest→Authenticated | Footer "Contact Us"; wrong password once, then correct; product on `Home&Living.html` | 1. Footer visit<br>2. Attempt sign-in with a wrong password (observe redirect to `signup.html` per Finding 6)<br>3. Navigate back to `signin.html` and sign in correctly<br>4. Category+add<br>5. Inspect `cartData` to confirm the item persisted | Basket increments to "1"; `cartData` holds exactly 1 entry — the journey also demonstrates the failed-login recovery gap from TC-101 as a realistic mid-journey friction point | High | BR1,BR5,BR3,BR2,BR11 |
| TC-153 | Keyboard End-to-End Journeys | End-to-End | Complete Sign In using the keyboard alone | Guest; keyboard only; account exists | Valid credentials | 1. Tab to Email, type<br>2. Tab to Password, type<br>3. Press Enter to submit | Session created, redirected home — no mouse used at any point | High | BR15(a),BR5 |
| TC-154 | Keyboard End-to-End Journeys | End-to-End | Complete Sign Up using the keyboard alone | Guest; keyboard only | Name "Keyboard User", Email "kbuser@test.com", Password "Kb@12345" | 1. Tab to Full Name, type<br>2. Tab to Email, type<br>3. Tab to Password, type<br>4. Press Enter to submit | Account created, redirected to `signin.html` — no mouse used at any point | High | BR15(a),BR6 |

---

## Summary Table — Case Count per Rule 12 Section

| Section | Count | Reason (if 0) |
|---|---|---|
| Top menu | 2 | |
| Search | 8 | |
| Logo | 5 | |
| Sign In | 13 | |
| Sign Up | 13 | |
| Cart/Basket | 9 | |
| Footer | 11 | |
| Guest User Flows | 4 | |
| Authenticated User Flows | 2 | |
| Equivalence Classes | 3 | |
| Boundary — Sign Up Password | 4 | |
| Boundary — Sign Up Email | 2 | |
| Boundary — Sign Up Full Name | 1 | |
| Boundary — Search Input | 3 | |
| Decision Tables | 7 | |
| State Transitions | 5 | |
| Data Integrity | 4 | |
| Concurrency | 3 | |
| Recovery | 5 | |
| Client-Side Security | 6 | |
| Compliance | 3 | |
| Analytics | 1 | |
| Usability | 4 | |
| Compatibility | 3 | |
| Localisation | 2 | |
| SEO & Discoverability | 4 | |
| Interface Contract (Client Storage Schema) | 5 | |
| Accessibility — Keyboard Navigation & Focus | 3 | |
| Accessibility — Forms & Labels | 3 | |
| Accessibility — Images & Alt Text | 1 | |
| Accessibility — Contrast | 3 | |
| Accessibility — Error Identification | 2 | |
| Accessibility — Page Titles & Structure | 3 | |
| Cross-Feature End-to-End Journeys | 5 | |
| Keyboard End-to-End Journeys | 2 | |
| **Total** | **154** | |

## Summary Table — Case Count per Business Rule (BR1–BR15)

| BR | Count | Reason (if 0) |
|---|---|---|
| BR1 | 9 | |
| BR2 | 12 | |
| BR3 | 10 | |
| BR4 | 9 | |
| BR5 | 9 | |
| BR6 | 15 | |
| BR7 | 12 | |
| BR8 | 8 | |
| BR9 | 8 | |
| BR10 | 8 | |
| BR11 | 5 | |
| BR12 | 5 | |
| BR13 | 3 | |
| BR14 | 4 | |
| BR15 (a–f) | 18 | |
| Unmapped (Usability, Analytics, Localisation — see note) | 7 | |
| **Total occurrences (some cases counted under >1 BR)** | **142** | |

## Summary Table — Case Count per Section 6 Technique (all 19)

| # | Technique | Count | Reason (if 0) |
|---|---|---|---|
| 1 | Positive | 24 | |
| 2 | Negative | 30 | |
| 3 | Equivalence Class | 3 | |
| 4 | Boundary (accept/reject/discrepancy) | 10 | |
| 5 | Decision Table | 7 | |
| 6 | State Transition | 5 | |
| 7 | Data Integrity | 4 | |
| 8 | End-to-End | 7 | |
| 9 | Concurrency | 3 | |
| 10 | Recovery | 5 | |
| 11 | Security | 6 | |
| 12 | Compliance | 3 | |
| 13 | Analytics | 1 | Grep for `gtag`/`dataLayer`/`analytics`/`fetch(`/`sendBeacon`/`XMLHttpRequest` across all `.js` files returns zero matches — the single case records this zero-finding itself |
| 14 | Usability | 4 | |
| 15 | Compatibility | 8 | |
| 16 | Localisation | 2 | |
| 17 | SEO | 4 | |
| 18 | Interface Contract | 5 | |
| 19 | Accessibility | 15 | |
| **Total** | **154** | Sums to the register total; a case using a compound scenario (e.g. an End-to-End journey) is counted once under its primary technique |

## Element × Technique Matrix (Rule 21f)

| Element | 1 Pos | 2 Neg | 3 EqC | 4 Bnd | 5 DecT | 6 StT | 7 DI | 8 E2E | 9 Conc | 10 Rec | 11 Sec | 12 Comp | 13 Analy | 14 Usab | 15 Compat | 16 Loc | 17 SEO | 18 IC | 19 A11y |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Logo | TC-011 | — | — | — | — | — | — | — | TC-011 | — | — | — | — | — | TC-012,015 | — | — | — | TC-133,139 |
| MEN/WOMEN/KIDS/HOME&LIVING | TC-002 | TC-001 | — | — | TC-087 | TC-066,092 | — | TC-148 | — | — | TC-064,065,110 | — | — | — | — | — | TC-127 | — | TC-133 |
| Search bar | TC-003 | TC-004–009 | — | TC-078–080 | — | — | — | — | — | — | — | — | TC-114 | — | — | TC-122 | — | — | TC-136 |
| Sign In fields/submit | TC-016 | TC-017–021 | TC-070 | — | TC-085,086 | TC-088 | — | TC-153 | TC-097,098 | TC-101,103 | TC-107–109 | — | — | TC-116,117 | TC-119,121 | — | — | TC-128,132 | TC-134,137,141,143,146 |
| Sign Up fields/submit | TC-029 | TC-030–035,041 | TC-068,069 | TC-071–077 | TC-081–084 | — | TC-093,096 | TC-154 | TC-099 | TC-100,102,104 | TC-105,106 | — | — | TC-115 | TC-120 | — | — | TC-129,131,132 | TC-135,138,142,144 |
| Logout | TC-065(neg. ctx) | — | — | — | — | TC-067,089 | — | — | — | — | — | — | — | — | — | — | — | TC-128 | — |
| Cart/Basket icon | TC-040(≈TC-042 above) | TC-047,048 | — | — | — | TC-046,091 | TC-094 | TC-149 | — | TC-049 | — | — | — | — | TC-050 | — | — | TC-130 | — |
| Footer | TC-051–054,057 | TC-055,056,059 | — | — | — | — | — | — | — | TC-060 | — | TC-111,112 | — | — | TC-058,061 | — | — | — | — |
| Navbar (as a whole, dynamic vs. static) | — | — | — | — | TC-087 | — | — | — | TC-097 | — | TC-110 | — | — | — | — | — | TC-127 | — | — |
| Whole-site title/head metadata | — | — | — | — | — | — | — | — | — | — | — | TC-113 | TC-114 | — | — | TC-123 | TC-124,125,126 | — | TC-145,147 |

Dashes mark technique/element pairs not applicable (e.g. Analytics does not apply per-element, only site-wide; Localisation's per-element application is limited since no locale layer exists).

---

## Unmapped but In-Scope Behaviors (Rule 8/18)

- **TC-114 (Analytics), TC-122/123 (Localisation), TC-115–118 (Usability)** carry no stating Business Rule, as anticipated by the prompt's own text ("Usability, Analytics and Localisation cases have no stating Business Rule"). Flagged here rather than force-mapped.

## Zero-Case Statements (Rule 20)

- **Boundary — Cart Count (lower bound):** No case generated. `cart.html`'s `decrease()` removes the tile the instant quantity reaches 0 before any reload — no code path ever renders a visible "0" tile state.
- **Sign Up Full Name — maximum length:** No case generated for an upper limit. Grepped `signup.html` for `maxlength` — zero matches; no JS length ceiling exists.
- **`maxlength` attributes generally, all three pages:** Grepped all three HTML files for `maxlength` — zero matches on every field named in Section 2/3.
- **Analytics (technique 13), beyond the one recorded zero-case:** Grepped for `gtag`, `dataLayer`, `analytics`, `sendBeacon`, `XMLHttpRequest`, `fetch(` across every `.js` file in the project — zero matches; no per-element analytics cases exist beyond the single site-wide zero-case (TC-114).
- **Localisation (technique 16), beyond `lang` and hardcoded-string findings:** Grepped for `Intl.`, `toLocaleString`, `i18n`, `locale` across every `.js`/`.html` file — zero matches; no currency, date, or number formatting exists anywhere in scope (there is no price or date display on these 3 pages at all).
- **Compliance — consent mechanism:** Grepped for `cookie`, `consent` (case-insensitive) across every `.html` file — matches only appear in `terms-of-use.html`'s own body text, never as an actual interactive consent-gating element; confirmed absent.
- **Session-timeout transition (technique 6):** No case generated. No `setTimeout`, token-expiry, or session-lifecycle code exists anywhere in the codebase (carried forward from prior rounds).

## Reproducibility Check (Rule 22)

Every case traces to a named element in Section 2/3 and a technique in Section 6. Both decision tables trace to a stated row (Rule 11). Every expected-to-fail case states both the requirement and the observed behavior before instructing the tester to log a defect. The new findings this round — `logginName`'s existence and unbounded plaintext-credential growth, the sign-in-failure redirect to `signup.html`, the static navbar's total non-response to `loginStatus`, and the confirmed zero-cases for Analytics/Localisation/session-timeout — are each grounded in a specific grep or line-numbered read performed fresh for this round, not assumed from the prompt's framing. Re-running this analysis against the same source would reproduce the same 154 cases, the same zero-cases, and the same defects.
