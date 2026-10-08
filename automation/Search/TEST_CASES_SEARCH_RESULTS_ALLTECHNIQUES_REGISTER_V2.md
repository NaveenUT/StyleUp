# Search Results Page — All-Techniques Functional Test Case Register (v2)

**Target:** `http://localhost:5501/search.html` (reached after a valid search from `index.html`)
**Environment:** Local, no domain
**Numbering:** Built from `prompt_search_v2.txt`, which explicitly states it supersedes any separate boundary/accessibility round for the Search Results page. Per Rule 9, numbering **restarts at TC-001** — this is a standalone replacement register for `TEST_CASES_SEARCH_RESULTS_REGISTER.md` and `TEST_CASES_SEARCH_RESULTS_BOUNDARY_ACCESSIBILITY_REGISTER.md`.

---

## Critical Findings

1. **The search term reaches this page entirely through a storage key, never a URL parameter.** `search-algo.js`'s `getArray(str)` (lines 1270–1289) computes the match, writes the resulting array to `localStorage.setItem('searchData', JSON.stringify(filteredlist))`, then does `window.location.href="search.html"` with no query string of any kind. `search.js` line 1 reads it back: `JSON.parse(localStorage.getItem("searchData")) || []`. There is no `location.search`/`URLSearchParams` anywhere in the codebase (confirmed by project-wide grep) — the URL is always the bare `search.html`.
2. **The matching algorithm itself does not check the product name at all.** `getArray()` (lines 1272–1280) matches a search string against `ele.brand`, `ele.gender`, and `ele.category` only, via the same case-insensitive prefix comparison used elsewhere in the app — it never inspects `ele.name`. A search for an exact product name that isn't also a brand/gender/category prefix returns "Product Not Found" even though the product exists.
3. **No filter, sort, or brand selection ever composes with any other.** Every handler — `handlesortprice()`, `handlesortname()`, `handlesortbrand()`, and the three `change` listeners for GENDER/CATEGORIES/Discount checkboxes (`search.js` lines 61–163) — filters or sorts the **original, unfiltered `searchArr`** directly, never a "currently displayed" subset. Consequences, all verified by reading the code, not assumed:
   - Applying a sort while a filter is active silently discards the filter (shows the full sorted list).
   - Applying a filter while a sort is active silently discards the sort (shows the filtered list in its original, unsorted order).
   - Checking a second checkbox in a *different* group discards the first group's filter entirely — only the most-recently-toggled checkbox's criterion is ever reflected in the listing, even though both checkboxes remain visually checked.
   - Checking a second checkbox within the *same* group behaves identically — there is no union/intersection logic even within one group.
   This directly contradicts Section 2's and BR2's stated "multiple checkboxes within and across groups can be combined."
4. **Unchecking a checkbox always restores the full, unfiltered `searchArr`** (the `else` branch of each `change` listener), regardless of whether any other checkbox is still checked — it does not fall back to re-applying a still-checked sibling's filter.
5. **The Discount checkboxes are cumulative-threshold, not discrete-bracket, filters.** The predicate is `(kid.discount*100)/kid.strikedoffprice >= Number(ele.value)` — checking ">50% off" is a subset of ">10% off", not a distinct 41–50% bracket. Checking a Discount box is also the only filter path that auto-sorts its result (ascending by discount percentage, lines 150–155) — no other filter does this.
6. **The Brand dropdown's "All Brands" option and a brand with zero matching products in the current `searchArr` produce identical visible behavior.** `handlesortbrand()` (lines 93–105): if the filtered list is empty (true both when `selected.value===""` for "All Brands," since no product's `brand` equals `""`, and when a real but non-matching brand is chosen), the code falls back to displaying the full unfiltered `searchArr` — a user cannot tell "All Brands" apart from "this brand matched nothing" from the rendered result alone.
7. **`cartItems()` (lines 164–171) is called unconditionally on page load and after every `addToCart()`, but unconditionally targets `#cart-items` via `document.getElementById("cart-items").innerText=...`.** `navbar.js`'s guest branch (confirmed by re-reading it) never creates a `#cart-items` element — only the authenticated branch does. For a guest user, every page load and every Add to Cart click on this page throws an uncaught `TypeError: Cannot set properties of null` in the DevTools Console. The page does not visibly break (nothing follows this call), but the error is real and reproducible every time.
8. **The price sort comparator is numeric, not string-based** (`a.price - b.price` / `b.price - a.price`, lines 64–71) — a **compliant** finding, contradicting the prompt's own suggestion that this might be a classic string-sort defect.
9. **The name sort comparator (lines 78–91) is a plain case-sensitive JS string comparison** (`a.name > b.name`) — since JS compares by UTF-16 code point, any lowercase-initial product name sorts after every uppercase-initial name regardless of alphabetical intent, a genuine discrepancy.
10. **The Breadcrumb is a single, non-interactive text node**: `<h5>Home / Search Store</h5>` (`search.html` line 49) — there is no `<a>`, no `onclick`, nothing clickable anywhere in it, for either segment. This matches the prompt's own Section 3 annotation ("but in the website it is just text").
11. **Total Items count is always derived from the same array just passed to the renderer** (`getItemCount(arr)` is called with the identical `arr` given to `appendData(arr)` at every call site) — a **compliant** Data Integrity finding; the count never drifts from the rendered tile count.
12. **Product tiles are plain `document.createElement('div')` elements with no wrapping `<a>` and no `href` anywhere** (`appendData()`, lines 8–37) — confirmed not crawlable. Tile images (`pic.setAttribute('src', ele.image_url)`, line 13) have **no `alt` attribute set anywhere** in the function. Every Add to Cart button shares the literal, identical text `"Add to Cart"` (line 34) with no per-product accessible name.
13. **No `<label>`, `aria-`, or `role=` attribute exists anywhere in `search.html`** (confirmed by grep — zero matches). Checkboxes are followed by a plain `<span>`, not a `<label>`. Sort dropdowns have no associated label at all; their only accessible name is whichever `<option>` text is currently selected, meaning a dropdown's name changes from "Sort by Price" to "Low to High" once a selection is made and never reverts.
14. **`<title>styleup For Kids</title>`** (`search.html` line 7) is static regardless of what was searched — a search for "Shoes" or any other term shows this same, non-descriptive, topic-mismatched title. No meta description, canonical, or robots directive exists anywhere in the `<head>`. No live `<h1>` exists — a commented-out `<h1>Kids Products</h1>` (line 46) confirms one was once present and removed.
15. **This page loads `navbar.js`** (`search.html` line 171), unlike Sign In/Sign Up — meaning it correctly uses the dynamic, login-gated navbar (Cart icon for authenticated users, no Cart icon for guests), consistent with BR3, and MEN/WOMEN/KIDS/HOME&LIVING here are correctly login-gated via `verifyLogin()` (unlike the Sign In/Sign Up static navbar's unguarded links).
16. **No analytics/tracking, locale/i18n, or consent code exists anywhere** (grep results: `gtag`/`dataLayer`/`analytics`/`fetch(`/`sendBeacon`/`XMLHttpRequest` — zero matches; `Intl.`/`toLocaleString`/`i18n`/`locale` — zero matches; `cookie`/`consent` — zero matches outside `terms-of-use.html`'s own body text).

---

## Decision Tables (Rule 11)

**Table A — Filter × Sort** (evaluation order: whichever handler fires *last* wins entirely; neither preserves the other's effect, since both read from the pristine `searchArr`).

| # | Filter active first? | Sort applied after? | Resulting listing | Reachable? |
|---|---|---|---|---|
| 1 | Yes | No | Filtered subset, in `searchArr`'s original order | Yes |
| 2 | Yes | Yes | Filter is discarded; full `searchArr` shown, sorted | Yes (the defect row) |
| 3 | No | Yes | Full `searchArr`, sorted | Yes |
| 4 | Yes (sort applied first) | Then filter applied | Sort is discarded; filtered subset shown, unsorted | Yes (the defect row) |
| 5 | No | No | Full `searchArr`, unsorted (initial load) | Yes |

**Table B — Multi-group filter (GENDER × CATEGORIES × Discount)** — the source implements neither AND nor OR; it implements "last toggled, alone."

| # | GENDER checked? | CATEGORIES checked (after)? | Resulting listing | Reachable? |
|---|---|---|---|---|
| 1 | Yes | No | GENDER-filtered subset | Yes |
| 2 | No | Yes | CATEGORIES-filtered subset | Yes |
| 3 | Yes (checked first) | Yes (checked second) | CATEGORIES-filtered subset only; GENDER's checkbox remains visibly checked despite having no effect on the listing | Yes (the defect row — visual state contradicts applied filter) |
| 4 | No | No | Full `searchArr` | Yes |

**Table C — Brand × Filter (CATEGORIES checkbox)** — same root cause as Table A/B.

| # | CATEGORIES checked first? | Brand selected after? | Resulting listing | Reachable? |
|---|---|---|---|---|
| 1 | Yes | No | CATEGORIES-filtered subset | Yes |
| 2 | Yes | Yes | CATEGORIES filter discarded; brand-filtered subset (from full `searchArr`) shown | Yes (the defect row) |

**Table D — Add to Cart × User type** (governs BR3).

| # | Authenticated? | Cart non-empty after add? | Cart icon behavior |
|---|---|---|---|
| 1 | Yes | Yes | Icon renders, shows correct summed quantity — compliant |
| 2 | Yes | No (0) | Icon renders, shows "0" — compliant |
| 3 | No (guest) | Yes | No icon element exists in the DOM at all (compliant with BR3's "guest sees no cart icon"), **but `cartItems()` throws an uncaught `TypeError` trying to update the non-existent element** (Finding 7, defect) |
| 4 | No (guest) | No | Same throw occurs on page load alone, before any add (Finding 7) |

---

## Test Case Register

| TC ID | Module | Scenario type | Scenario | Precondition | Test Data | Steps | Expected Result | Priority | Business Rule |
|---|---|---|---|---|---|---|---|---|---|
| TC-001 | Breadcrumb | Negative | "Home" breadcrumb segment does not navigate (defect against Section 3's stated behavior) | Any user; on `search.html` after searching "Shoes" | N/A | 1. Click directly on the word "Home" within the `<h5>Home / Search Store</h5>` text | Per Section 3, "Home" should navigate to `index.html`. **Record actual behavior — expected to FAIL, log as a defect:** nothing happens; the entire breadcrumb is one plain text node with no anchor or click handler (Finding 10) | Medium | BR8 |
| TC-002 | Breadcrumb | Positive | "Search Store" segment is correctly static | Any user | N/A | 1. Click "Search Store" | No navigation occurs — correct, compliant with its stated non-navigating role | Low | BR8 |
| TC-003 | Total Items Count | Positive | Count matches rendered tiles on initial load | Any user | Search: "Shoes" | 1. Search "Shoes" from `index.html`<br>2. Count the rendered product tiles<br>3. Compare to the "Total items" number | Count equals the tile count exactly | High | BR9 |
| TC-004 | Total Items Count | Positive | Count updates correctly after a filter | Any user; on Search Results for "Shoes" | Filter: CATEGORIES "Shoes" | 1. Check the "Shoes" CATEGORIES box<br>2. Count the newly rendered tiles<br>3. Compare to the count label | Count equals the new (smaller-or-equal) tile count | High | BR9 |
| TC-005 | Total Items Count | Positive | Count updates correctly after a sort | Any user | Sort: "Low to High" | 1. Select "Low to High" on Sort by Price<br>2. Compare the count label to the (unchanged) number of rendered tiles | Count is unchanged from before sorting, matching tile count | Medium | BR9 |
| TC-006 | Total Items Count | Positive | Count updates correctly after a Brand selection | Any user | Brand: "Nike" | 1. Select "Nike" on Sort by Brand<br>2. Compare the count label to the rendered tile count | Count equals the Nike-only tile count | Medium | BR9 |
| TC-007 | Filter Section | Positive | GENDER "Boys" checkbox filters correctly | Any user; unfiltered results for "Shoes" | Checkbox: GENDER "Boys" | 1. Check "Boys"<br>2. Inspect every rendered tile | Every rendered tile's underlying `gender` is "Boys" | High | BR2 |
| TC-008 | Filter Section | Positive | GENDER "Girls" checkbox filters correctly | Any user | Checkbox: GENDER "Girls" | 1. Check "Girls" | Every rendered tile's `gender` is "Girls" | High | BR2 |
| TC-009 | Filter Section | Positive | CATEGORIES "Tshirts" checkbox filters correctly | Any user | Checkbox: CATEGORIES "Tshirts" | 1. Check "Tshirts" | Every tile's `category` is "Tshirts" | High | BR2 |
| TC-010 | Filter Section | Positive | CATEGORIES "Shirts" checkbox filters correctly | Any user | Checkbox: CATEGORIES "Shirts" | 1. Check "Shirts" | Every tile's `category` is "Shirts" | High | BR2 |
| TC-011 | Filter Section | Positive | CATEGORIES "Shoes" checkbox filters correctly | Any user | Checkbox: CATEGORIES "Shoes" | 1. Check "Shoes" | Every tile's `category` is "Shoes" | High | BR2 |
| TC-012 | Filter Section | Positive | CATEGORIES "Dresses" checkbox filters correctly | Any user | Checkbox: CATEGORIES "Dresses" | 1. Check "Dresses" | Every tile's `category` is "Dresses" | High | BR2 |
| TC-013 | Filter Section | Positive | CATEGORIES "Kurta Sets" checkbox filters correctly | Any user | Checkbox: CATEGORIES "Kurta Sets" | 1. Check "Kurta Sets" | Every tile's `category` is "Kurta Sets" | High | BR2 |
| TC-014 | Filter Section | Boundary (accept) | Discount ">10% off" checkbox filters correctly (inclusive threshold) | Any user | Checkbox: Discount "10" | 1. Check ">10% off" | Every tile has `(discount*100)/strikedoffprice >= 10` | High | BR2 |
| TC-015 | Filter Section | Boundary (accept) | Discount ">20% off" checkbox filters correctly | Any user | Checkbox: Discount "20" | 1. Check ">20% off" | Every tile has ≥20% computed discount | High | BR2 |
| TC-016 | Filter Section | Boundary (accept) | Discount ">30% off" checkbox filters correctly | Any user | Checkbox: Discount "30" | 1. Check ">30% off" | Every tile has ≥30% computed discount | Medium | BR2 |
| TC-017 | Filter Section | Boundary (accept) | Discount ">40% off" checkbox filters correctly | Any user | Checkbox: Discount "40" | 1. Check ">40% off" | Every tile has ≥40% computed discount | Medium | BR2 |
| TC-018 | Filter Section | Boundary (accept) | Discount ">50% off" checkbox filters correctly, and is a subset of ">10% off" | Any user | Checkbox: Discount "50", then "10" | 1. Check ">50% off"; note the resulting product set<br>2. Uncheck it, check ">10% off" instead<br>3. Confirm every product from step 1 also appears in step 2's set | Step 1's set ⊆ step 2's set — confirms cumulative-threshold behavior (Finding 5) | Medium | BR2 |
| TC-019 | Filter Section | Negative | Unchecking a checkbox restores the full list regardless of other checked boxes (defect per Finding 4) | Any user | Checkboxes: GENDER "Boys" then CATEGORIES "Tshirts" both checked, then uncheck "Tshirts" | 1. Check "Boys"<br>2. Check "Tshirts" (discards Boys' filter per Finding 3)<br>3. Uncheck "Tshirts" | Per a reasonable expectation, unchecking Tshirts might be expected to fall back to the still-checked "Boys" filter. **Record actual behavior — expected to FAIL, log as a defect:** the full unfiltered `searchArr` is shown instead, ignoring that "Boys" is still visually checked | Medium | BR2 |
| TC-020 | Filter Section | Decision Table | Cross-group checkbox combination — visual state contradicts applied filter (Table B, row 3) | Any user | Checkboxes: GENDER "Girls" then CATEGORIES "Dresses" | 1. Check "Girls"; confirm Girls-filtered tiles render<br>2. Check "Dresses" without unchecking "Girls"<br>3. Inspect both checkboxes' checked state and the rendered tiles | Both checkboxes show checked, but only Dresses-filtered tiles render (Girls' filter has no effect) — log the visual/actual mismatch as a defect (Finding 3) | High | BR2 |
| TC-021 | Sort by Price | Positive | "Low to High" re-orders ascending | Any user; unfiltered results for "Shoes" | Sort: "Low to High" | 1. Record all prices in current order<br>2. Select "Low to High"<br>3. Compare new order | Each price ≤ the next; multiset of names unchanged from step 1 | High | BR9 |
| TC-022 | Sort by Price | Positive | "High to Low" re-orders descending | Any user | Sort: "High to Low" | 1. Select "High to Low" | Each price ≥ the next; multiset unchanged | High | BR9 |
| TC-023 | Sort by Name | Positive | "Ascending" re-orders A→Z | Any user | Sort: "Ascending" | 1. Select "Ascending" | Names appear in ascending order per the comparator | High | BR9 |
| TC-024 | Sort by Name | Positive | "Descending" re-orders Z→A | Any user | Sort: "Descending" | 1. Select "Descending" | Names appear in descending order per the comparator | High | BR9 |
| TC-025 | Sort by Name | Boundary (discrepancy) | Case-sensitive comparator orders a lowercase-initial name after all uppercase-initial names (defect) | Any user; result set includes at least one product whose name starts with a lowercase letter and one starting with an uppercase letter (or simulate via DevTools by editing `searchArr` in Console to include such a pair) | Names: "adidas Runner" (lowercase-initial), "Zara Top" (uppercase-initial) | 1. Ensure both names are present in the current result set<br>2. Select "Ascending"<br>3. Observe the relative order of the two | Per intended alphabetical order, "adidas Runner" should precede "Zara Top". **Record actual behavior — expected to FAIL, log as a defect:** "Zara Top" sorts first, since JS's default `>`/`<` string comparison is case-sensitive by code point (Finding 9) | Low | BR9 |
| TC-026 | Sort by Brand | Positive | "US-Polo" filters to that brand only | Any user | Brand: "US-Polo" | 1. Select "US-Polo" | Every tile's `brand` is "US-Polo" | Medium | BR2 |
| TC-027 | Sort by Brand | Positive | "Max" filters to that brand only | Any user | Brand: "Max" | 1. Select "Max" | Every tile's `brand` is "Max" | Medium | BR2 |
| TC-028 | Sort by Brand | Positive | "YK-Disney" filters to that brand only | Any user | Brand: "YK-Disney" | 1. Select "YK-Disney" | Every tile's `brand` is "YK-Disney" | Medium | BR2 |
| TC-029 | Sort by Brand | Positive | "H&M" filters to that brand only | Any user | Brand: "H&M" | 1. Select "H&M" | Every tile's `brand` is "H&M" | Medium | BR2 |
| TC-030 | Sort by Brand | Positive | "Trends" filters to that brand only | Any user | Brand: "Trends" | 1. Select "Trends" | Every tile's `brand` is "Trends" | Medium | BR2 |
| TC-031 | Sort by Brand | Positive | "Nike" filters to that brand only | Any user | Brand: "Nike" | 1. Select "Nike" | Every tile's `brand` is "Nike" | Medium | BR2 |
| TC-032 | Sort by Brand | Positive | "Polo" filters to that brand only | Any user | Brand: "Polo" | 1. Select "Polo" | Every tile's `brand` is "Polo" | Medium | BR2 |
| TC-033 | Sort by Brand | Positive | "Addidas" filters to that brand only | Any user | Brand: "Addidas" | 1. Select "Addidas" | Every tile's `brand` is "Addidas" | Medium | BR2 |
| TC-034 | Sort by Brand | Positive | "Reebok" filters to that brand only | Any user | Brand: "Reebok" | 1. Select "Reebok" | Every tile's `brand` is "Reebok" | Medium | BR2 |
| TC-035 | Sort by Brand | Positive | "RedTape" filters to that brand only | Any user | Brand: "RedTape" | 1. Select "RedTape" | Every tile's `brand` is "RedTape" | Medium | BR2 |
| TC-036 | Sort by Brand | Equivalence Class | "All Brands" restores the full list | Any user, a brand already selected | Brand: "" ("Sort by Price" placeholder equivalent, "All Brands") | 1. Select a named brand, confirm filtering<br>2. Select "Sort by Brand"'s placeholder option again | Full `searchArr` is shown again | Medium | BR2 |
| TC-037 | Sort by Brand | Equivalence Class | A brand with zero matches in the current result set is visually indistinguishable from "All Brands" (defect/discrepancy) | Any user; result set for a search term that excludes one specific brand entirely (e.g. "Shoes" search where no "H&M" shoe product exists) | Brand: "H&M" (assume zero matches for this search) | 1. Select "H&M" when no product in the current set has that brand<br>2. Observe the rendered listing | Per Finding 6, the fallback branch shows the **full unfiltered `searchArr`** — identical to selecting "All Brands" — with no "0 products for this brand" indication; log as a discoverability discrepancy | Low | BR2 |
| TC-038 | Product Listing | Positive | Rendered tiles match the current search term's product set | Guest; search "Shoes" | Search: "Shoes" | 1. Search "Shoes"<br>2. Inspect each rendered tile's underlying data via DevTools | Every tile corresponds to a product whose brand, gender, or category prefix-matches "Shoes" per `getArray()` (Finding 2 — name itself is never matched) | High | BR4 |
| TC-039 | Product Listing | Positive | Each tile shows name, brand, price, strikedoff price, discount %, and image | Guest | Any rendered tile | 1. Inspect one tile's rendered content | All fields present and matching the underlying product object | Medium | BR9 |
| TC-040 | Product Listing | Negative | Zero-matching-results empty state (BR4) | Guest; `searchData` holds an empty array (e.g. reached by a technically well-formed but non-matching brand/gender/category-prefix term) | `searchData`: `[]` | 1. Load `search.html` directly with `searchData` set to `[]` via DevTools<br>2. Observe the page | Zero tiles render; "Total items" shows "0"; no error is thrown | Medium | BR4 |
| TC-041 | Add to Cart | Positive | Guest can add a product to the cart | Guest; `cartData` empty | Product: any tile on the current listing | 1. Click "Add to Cart" on one tile<br>2. Inspect `cartData` in DevTools | Alert "Product [name] Added to Cart Succesfuly"; `cartData` holds one entry with `quantity:1` | High | BR3 |
| TC-042 | Add to Cart | Positive | Authenticated user can add a product and sees the Cart icon update | Authenticated; `cartData` empty | Product: any tile | 1. Click "Add to Cart"<br>2. Inspect the navbar Cart icon | Alert shown; Cart icon badge updates to "1" | High | BR3 |
| TC-043 | Add to Cart | Positive | Adding the same product twice increments its quantity rather than duplicating the entry | Authenticated; `cartData` empty | Same product, added twice | 1. Add the product<br>2. Add the same product again<br>3. Inspect `cartData` | Alert on 2nd add reads "...Added to Cart 2 Times"; `cartData` still holds exactly one entry for this product, with `quantity:2` | High | BR3,BR9 |
| TC-044 | Add to Cart | Data Integrity | `cartprice` stays arithmetically consistent with quantity × price | Authenticated; product added twice | Same product, price known | 1. Add the product twice<br>2. Inspect `cartData`'s `cartprice` field for this entry | `cartprice` equals `price * quantity` exactly | High | BR9 |
| TC-045 | Persistence Checks | Compatibility | Logo renders and functions identically on this page as on the homepage | Guest+Authenticated | N/A | 1. Compare the Logo's appearance and click-to-home behavior on `search.html` vs. `index.html` | Identical in both states | Medium | BR7 |
| TC-046 | Persistence Checks | State Transition | Cart icon appears only when authenticated, on this page specifically | Guest→Authenticated | N/A | 1. As a guest, load `search.html`; confirm no Cart icon<br>2. Sign in; reload `search.html`; confirm Cart icon now appears | Guest: no icon. Authenticated: icon present, reflecting `cartData` | High | BR3,BR7 |
| TC-047 | Persistence Checks | Compatibility | Footer renders identically on this page as established for the homepage | Guest+Authenticated | N/A | 1. Compare the footer's 4 links and 3 promotional lines on `search.html` vs. `index.html` | Identical content and behavior | Medium | BR7,BR8 |
| TC-048 | Guest User Flows | Positive | Guest can reach and use the Search Results page fully (search, filter, sort, add to cart) | Guest | Search "Shoes" | 1. As a guest, search, apply one filter, apply one sort, add one item to cart | All actions succeed with no login prompt at any step | High | BR1 |
| TC-049 | Guest User Flows | Negative | Guest sees no Cart icon even after adding items (compliant with BR3) | Guest | Add 1 product | 1. Add a product to cart as a guest<br>2. Inspect the navbar | No Cart icon element exists in the DOM — correct per BR3 | Medium | BR3 |
| TC-050 | Guest User Flows | Security | Guest's page load and Add to Cart both throw an uncaught console error (defect) | Guest | N/A | 1. Open DevTools Console<br>2. Load `search.html` as a guest<br>3. Click "Add to Cart" on any tile<br>4. Inspect the Console after each step | Per graceful degradation, no error should appear for an action BR3 explicitly permits guests to perform. **Record actual behavior — expected to FAIL, log as a defect:** a `TypeError: Cannot set properties of null (setting 'innerText')` appears in the Console after both the page load and the Add to Cart click (Finding 7) | Medium | BR11 |
| TC-051 | Authenticated User Flows | Positive | Cart icon reflects the correct summed quantity across multiple distinct products | Authenticated; `cartData` empty | 2 distinct products | 1. Add product A, confirm icon shows "1"<br>2. Add product B, confirm icon shows "2" | Icon correctly sums `quantity` across all `cartData` entries | High | BR3,BR9 |
| TC-052 | Authenticated User Flows | State Transition | Session and applied filter/sort state both persist while remaining on this page | Authenticated | Filter: "Shoes" category applied | 1. Apply the CATEGORIES "Shoes" filter<br>2. Navigate to another gated page and back via Logo, then re-search "Shoes" | Login session persists throughout (filter itself is not expected to persist across a full re-search, since it is DOM/JS-only state, not stored) | Medium | BR9 |
| TC-053 | Equivalence Classes | Equivalence Class | Discount checkbox partitions | Any user | Class 1: "10" (≥10%)<br>Class 2: "50" (≥50%, a subset of Class 1) | 1. Apply each in turn; compare resulting sets | Class 2's result set ⊆ Class 1's result set, confirming the cumulative-threshold partition (Finding 5) | Medium | BR2 |
| TC-054 | Equivalence Classes | Equivalence Class | Brand dropdown partitions: named brand vs. "All Brands" vs. zero-match brand | Any user | Class 1: "Nike" (matches exist)<br>Class 2: "" (All Brands)<br>Class 3: a brand with zero matches in this result set | 1. Select each in turn | Class 1: brand-only subset. Classes 2 and 3: **identical** — both show the full unfiltered list (Finding 6) — confirming Classes 2/3 collapse into one observable equivalence class despite being conceptually distinct | Medium | BR2 |
| TC-055 | Equivalence Classes | Equivalence Class | GENDER/CATEGORIES checkbox partitions are each independent, non-composing classes | Any user | GENDER "Boys", CATEGORIES "Shoes" | 1. Apply GENDER "Boys" alone; note result<br>2. Apply CATEGORIES "Shoes" alone; note result<br>3. Apply both in sequence; note result | Step 3's result equals step 2's result exactly (the last-applied filter's class alone governs) — confirms no compound "Boys AND Shoes" class exists (Finding 3) | Medium | BR2 |
| TC-056 | Boundary — Discount Ranges | Boundary (accept) | Product exactly at a discount threshold is included | Any user; a product with computed discount exactly 20% exists (or simulate via DevTools) | Checkbox: Discount "20"; product with `(discount*100)/strikedoffprice===20` | 1. Check ">20% off"<br>2. Confirm the exactly-20% product appears | Product is included (`>=` is inclusive) | Medium | BR2 |
| TC-057 | Boundary — Discount Ranges | Boundary (reject) | Product just below a discount threshold is excluded | Any user; a product with computed discount 19% exists (or simulate) | Checkbox: Discount "20"; product at 19% | 1. Check ">20% off" | The 19% product is excluded | Medium | BR2 |
| TC-058 | Boundary — Discount Ranges | Boundary (accept) | Product just above a discount threshold is included | Any user; a product with computed discount 21% exists (or simulate) | Checkbox: Discount "20"; product at 21% | 1. Check ">20% off" | The 21% product is included | Low | BR2 |
| TC-059 | Boundary — Total Items Count | Boundary (accept) | Count displays correctly at 0 | Guest; `searchData`: `[]` | N/A | 1. Load with an empty `searchData` | Count reads "0"; no pluralization defect since the label "Total items :" is invariant text, not a dynamic singular/plural phrase | Low | BR9 |
| TC-060 | Boundary — Total Items Count | Boundary (accept) | Count displays correctly at exactly 1 | Any user; a filter/brand selection yielding exactly one product | Filter yielding 1 product | 1. Apply a filter/brand known to yield exactly 1 tile | Count reads "1"; exactly one tile renders | Low | BR9 |
| TC-061 | Boundary — Total Items Count | Boundary (accept) | Count displays correctly at n (multiple) | Any user | Unfiltered "Shoes" search | 1. Search "Shoes" with no filter | Count equals the full rendered tile count | Low | BR9 |
| TC-062 | Boundary — Price Sort Comparator | Boundary (discrepancy) | Two products with identical price both remain present after an ascending sort (stability check) | Any user; two products with identical price exist (or simulate via DevTools) | Two products, same price | 1. Apply "Low to High"<br>2. Confirm both identical-price products still appear, once each | Both present, no duplication or loss — `Array.sort`'s comparator returning 0 for equal prices does not drop either entry | Low | BR9 |
| TC-063 | Boundary — Price Sort Comparator | Boundary (accept) | Ascending and descending sorts both contain the full original multiset of tiles | Any user | Full "Shoes" result set | 1. Record all product names<br>2. Apply "Low to High"; record names again<br>3. Apply "High to Low"; record names again | All three name sets are identical multisets — no product lost or duplicated by either sort direction | Medium | BR9 |
| TC-064 | Boundary — Name Sort Comparator | Boundary (discrepancy) | Leading-whitespace product name sorts unexpectedly under "Ascending" | Any user; a product name with a leading space exists (or simulate via DevTools Console by editing `searchArr`) | Product name: " Zebra Print Top" (leading space) | 1. Ensure this name is present in the result set alongside normally-named products<br>2. Apply "Ascending" | A space character (code point 32) sorts before all letters, so this name appears first regardless of its letters — record as a comparator discrepancy | Low | BR9 |
| TC-065 | Boundary — Name Sort Comparator | Boundary (discrepancy) | Leading-digit product name sorts before all letter-initial names under "Ascending" | Any user; a product name starting with a digit exists (or simulate) | Product name: "3-Pack Socks" | 1. Ensure this name is present alongside letter-initial names<br>2. Apply "Ascending" | Digit characters (code points 48–57) sort before all letters, so this name appears first — a naive but internally consistent comparator behavior, recorded as a discrepancy against a "true alphabetical" expectation | Low | BR9 |
| TC-066 | Decision Tables | Decision Table | Table A row 2 — filter active, then sort applied (filter is discarded) | Any user | CATEGORIES "Shoes" checked, then "Low to High" selected | 1. Check "Shoes"; confirm filtered results<br>2. Select "Low to High" without unchecking "Shoes" | Full `searchArr` is shown, sorted ascending by price, ignoring the still-checked "Shoes" box (Table A, row 2) | High | BR2,BR9 |
| TC-067 | Decision Tables | Decision Table | Table A row 4 — sort active, then filter applied (sort is discarded) | Any user | "Low to High" selected, then CATEGORIES "Shoes" checked | 1. Select "Low to High"; confirm ascending order<br>2. Check "Shoes" | The Shoes-filtered subset is shown in `searchArr`'s original (unsorted) order, not price order (Table A, row 4) | High | BR2,BR9 |
| TC-068 | Decision Tables | Decision Table | Table B row 3 — cross-group checkbox combination | Any user | GENDER "Girls" then CATEGORIES "Dresses" | 1. Check "Girls"<br>2. Check "Dresses" | Only Dresses-filtered tiles render; "Girls" remains checked with no effect (Table B, row 3) | High | BR2 |
| TC-069 | Decision Tables | Decision Table | Table C — brand selection after a CATEGORIES filter discards it | Any user | CATEGORIES "Tshirts" checked, then Brand "Nike" selected | 1. Check "Tshirts"; confirm filtered results<br>2. Select "Nike" | Nike-filtered subset (from full `searchArr`) shown, not "Nike Tshirts" — the Tshirts filter is discarded (Table C, row 2) | High | BR2 |
| TC-070 | Decision Tables | Decision Table | Table D row 1 — authenticated, cart non-empty (compliant) | Authenticated | Add 1 product | 1. Add a product | Cart icon renders and shows "1" correctly (Table D, row 1) | Medium | BR3 |
| TC-071 | Decision Tables | Decision Table | Table D row 3 — guest, cart non-empty (defect) | Guest | Add 1 product | 1. Add a product as a guest; check the Console | No icon rendered (compliant), but a `TypeError` is thrown (Table D, row 3, Finding 7) | Medium | BR3,BR11 |
| TC-072 | State Transitions | State Transition | Filter unapplied → applied → unapplied | Any user | CATEGORIES "Shoes" | 1. Note initial (unapplied) tile count<br>2. Check "Shoes" (applied)<br>3. Uncheck "Shoes" (unapplied) | Step 3's tile count and set match step 1's exactly — full restoration | Medium | BR9,BR10 |
| TC-073 | State Transitions | State Transition | Sort has no path back to "default" once an option is chosen (defect) | Any user | Sort by Price: "Low to High", then re-select the blank placeholder option | 1. Select "Low to High"; confirm ascending order<br>2. Re-select the dropdown's original blank "Sort by Price" placeholder option | Per a reasonable expectation, re-selecting the placeholder should restore the unsorted view. **Record actual behavior — expected to FAIL, log as a defect:** neither `if` branch in `handlesortprice()` matches an empty `value`, so nothing happens and the previously-sorted order remains displayed | Medium | BR10 |
| TC-074 | State Transitions | State Transition | Cart count 0 → n → 0 | Authenticated; `cartData` empty | 1 product, added then removed via `cart.html` | 1. Confirm icon "0"<br>2. Add the product; confirm "1"<br>3. Remove it via the Cart page; return here and confirm "0" | Icon reads 0, then 1, then 0 correctly | High | BR3,BR9 |
| TC-075 | State Transitions | State Transition | Guest → Authenticated while remaining conceptually on this journey | Guest; on Search Results with an item added | Sign in mid-journey | 1. As a guest, add a product to cart<br>2. Sign in<br>3. Return to `search.html` (a fresh search) | The guest-added item is still present in `cartData` and the Cart icon now appears, reflecting it — the cart carries across the transition (consistent with the wider site's global, unscoped `cartData`) | Medium | BR3,BR10 |
| TC-076 | Data Integrity | Data Integrity | Total Items count never drifts from the rendered tile count across filter/sort operations (compliant) | Any user | Sequence: filter, then sort, then brand select | 1. Apply a filter; compare count to tiles<br>2. Apply a sort; compare again<br>3. Apply a brand; compare again | Count equals rendered tile count at every one of the 3 steps (Finding 11, compliant) | High | BR9 |
| TC-077 | Data Integrity | Data Integrity | A sort never loses or duplicates a tile | Any user | Full result set | 1. Record the multiset of product names<br>2. Apply "Descending" (name)<br>3. Re-compare the multiset | Identical multiset before and after | High | BR9 |
| TC-078 | Data Integrity | Data Integrity | A cart entry written from this page holds every field exactly as rendered | Authenticated | Any product tile | 1. Note the tile's displayed name and price<br>2. Add to cart<br>3. Inspect the `cartData` entry | `name` and the price used for `cartprice` match the tile exactly, with no truncation or coercion | High | BR9 |
| TC-079 | Data Integrity | Data Integrity | Cart count stays arithmetically equal to the sum of stored quantities across repeated adds | Authenticated; `cartData` empty | 1 product added 3 times | 1. Add the same product 3 times<br>2. Inspect `cartData`'s single entry's `quantity`<br>3. Compare to the Cart icon's displayed number | Both equal 3 | High | BR3,BR9 |
| TC-080 | Concurrency | Concurrency | Two tabs both on Search Results, same product added from each | Authenticated; two tabs both on `search.html`, `cartData` empty | Same product | 1. In Tab A, add the product<br>2. In Tab B (not yet reloaded), add the same product<br>3. Reload Tab B and inspect `cartData` | Without a manual reload, Tab B's own in-memory `cartarr` is stale (loaded before Tab A's write) — inspect whether Tab B's add overwrites Tab A's, producing quantity 1 instead of the expected 2, and log any lost update as a defect | Medium | BR10 |
| TC-081 | Concurrency | Concurrency | Same account, two different browsers, cart does not sync | One account; Chrome and Firefox | Same login; add in Chrome only | 1. Log in and add a product in Chrome<br>2. Log in with the same account in Firefox | Firefox shows an empty cart — `localStorage` is per-browser-profile, an architectural characteristic, not a bug | Low | BR10 |
| TC-082 | Concurrency | Concurrency | Rapid double-click on a single Add to Cart button | Authenticated; `cartData` empty | One product tile | 1. Double-click "Add to Cart" on one tile as fast as possible<br>2. Inspect `cartData` | Because `addToCart()` runs synchronously per click with no debounce, two rapid clicks are expected to register as two separate additions (`quantity:2`) — confirm this is the actual behavior; if instead only one is recorded, log the discrepancy | Medium | BR10 |
| TC-083 | Recovery | Recovery | Active filter does not survive a page refresh | Any user | CATEGORIES "Shoes" checked | 1. Check "Shoes"<br>2. Refresh the page (F5) | The checkbox reverts to unchecked and the full `searchArr` (whatever is currently in storage) is shown — filter state is DOM-only and is not expected to survive a refresh; not a defect, but confirm this is indeed what happens | Low | BR12 |
| TC-084 | Recovery | Recovery | Active sort does not survive a page refresh | Any user | "Low to High" selected | 1. Select "Low to High"<br>2. Refresh the page | Dropdown reverts to its default blank option and the listing reverts to `searchArr`'s stored order — same rationale as TC-083 | Low | BR12 |
| TC-085 | Recovery | Recovery | Browser-back from this page returns to a usable homepage | Any user | On `search.html` | 1. Press the browser Back button | Returns to `index.html` in a normal, usable state | Low | BR12 |
| TC-086 | Recovery | Recovery | Page opened with `searchData` entirely absent | Guest; `searchData` key deleted | N/A | 1. In DevTools, remove the `searchData` key entirely<br>2. Load `search.html` directly | `JSON.parse(null)||[]` defaults to `[]`; page renders with 0 tiles and "Total items: 0" — no crash | Medium | BR12,BR13 |
| TC-087 | Recovery | Recovery | Page opened with a malformed `searchData` value | Guest | `searchData`: `"not-json"` | 1. Set `localStorage.searchData` to the literal string `"not-json"` via DevTools Console<br>2. Load `search.html` | `JSON.parse("not-json")` throws uncaught — the page fails with a Console error rather than degrading gracefully (no `try/catch` exists); log as a defect | Medium | BR12,BR13 |
| TC-088 | Client-Side Security | Security | Product name is safely rendered via `innerText`, not vulnerable to injection (compliant) | Any user; a product with a script-tag-like name exists (simulate via DevTools by editing a `searchArr` entry's `name`) | Name: `<script>alert(1)</script>` | 1. Edit one product's `name` in `searchArr` via DevTools Console to the payload<br>2. Trigger a re-render (e.g. apply any sort)<br>3. Inspect the rendered tile | `des.innerText = ele.name` (line 15) sets text content, not HTML — the payload renders as literal visible text, not executed markup; compliant | Medium | BR11 |
| TC-089 | Client-Side Security | Security | A hand-edited `cartData` entry is accepted without validation on the Cart page (defect, cross-referenced) | Authenticated | `cartData`: a manually inserted entry with a negative or absurd price/quantity | 1. Via DevTools, set `cartData` to include an entry with `price:-500, quantity:999`<br>2. Navigate to `cart.html` and observe | Per reasonable expectation, an out-of-range value should be rejected or clamped. **Record actual behavior — expected to FAIL, log as a defect:** `cart.html` accepts and displays the hand-edited entry with no validation of any kind | Medium | BR11 |
| TC-090 | Client-Side Security | Security | Guest console error is reproducible and does not leak sensitive detail beyond the stack trace itself | Guest | N/A | 1. Trigger the Finding-7 error (page load as guest)<br>2. Read the full Console error text | The error is a generic `TypeError` with a file/line reference to `search.js` — no credential or storage content is included in the error text itself, though the stack trace does reveal internal file structure | Low | BR11 |
| TC-091 | Compliance | Compliance | Footer's Privacy Policy item does not resolve to a real document, from this page | Any user | N/A | 1. Click "Privacy Policy" in this page's footer | No navigation occurs — same absence already established site-wide | Medium | BR14 |
| TC-092 | Compliance | Compliance | No consent is obtained before an Add to Cart click writes to client storage | Guest, first visit, no prior storage | N/A | 1. Clear all site storage<br>2. Click "Add to Cart" on any tile | `cartData` is written immediately with no consent prompt of any kind — record as the finding | Low | BR14 |
| TC-093 | Analytics | Analytics | No tracking call fires on search, filter, sort, or Add to Cart (zero-case) | Any user | Actions: land on page, apply a filter, apply a sort, add to cart | 1. Grep the codebase for `gtag`, `dataLayer`, `analytics`, `fetch(`, `sendBeacon`, `XMLHttpRequest`<br>2. Open DevTools Network while performing all 4 listed actions | Grep returns zero matches; Network panel shows no outbound requests for any of the 4 actions — notably, a search-results page is the most conventional place for a "search performed" event, and its absence is worth recording specifically | Low | Unmapped (no stating rule for Analytics) |
| TC-094 | Usability | Usability | Zero-results state does not suggest a next action (objective finding) | Guest | Empty `searchData` | 1. Load the page with `searchData: []` | The page shows only "Total items : 0" and an empty listing — no suggestion to clear filters, browse categories, or retry; objectively verifiable absence of guidance | Low | Unmapped |
| TC-095 | Usability | Usability | No single action exists to clear all active filters at once (objective finding) | Any user | Multiple checkboxes checked across groups | 1. Check one box in each of GENDER, CATEGORIES, and Discount<br>2. Look for a "Clear all" or "Reset filters" control | No such control exists anywhere on the page — each checkbox must be unchecked individually | Low | Unmapped |
| TC-096 | Usability | Usability | Selected sort option remains visibly selected after the listing re-renders (compliant) | Any user | Sort: "Low to High" | 1. Select "Low to High"<br>2. Inspect the dropdown's displayed value after the listing updates | The `<select>` correctly continues to show "Low to High" as selected — native browser behavior, compliant | Low | Unmapped |
| TC-097 | Compatibility | Compatibility | Filter, sort, and Add to Cart interaction paths behave identically across 4 browsers + incognito | Any user; 5 environments | One filter, one sort, one add-to-cart per environment | 1. Repeat the same filter+sort+add sequence in Chrome, Edge, Firefox, Safari, and one incognito window | Identical results in all 5 | Medium | BR7 |
| TC-098 | Compatibility | Compatibility | Native `<select>` and checkbox rendering is consistent across environments | Any user; 5 environments | N/A | 1. Open each dropdown and inspect each checkbox's native rendering in each of the 5 environments | Native controls render and function per each browser's own default styling — no app-level override breaks them | Low | BR7 |
| TC-099 | Localisation | Localisation | Currency symbol and format are hardcoded, non-locale-aware (finding is the substance, not merely an absence) | Any user | Any rendered price | 1. Inspect the rendered price text on any tile | Reads as the literal hardcoded string `"Rs. " + price` (`search.js` line 20) — no `Intl.NumberFormat`/`toLocaleString` is used, no thousands separator is applied to a 4+-digit price, and the symbol is fixed regardless of any locale setting | Medium | Unmapped (no stating rule for Localisation) |
| TC-100 | Localisation | Localisation | Price sort operates on the numeric value, not the formatted currency string (compliant) | Any user | Products spanning both 3-digit and 4-digit prices | 1. Confirm at least one 3-digit-priced and one 4-digit-priced product are in the result set<br>2. Apply "Low to High" | Correct numeric order is produced (e.g. 899 before 1499) — the sort operates on `ele.price` directly, never on the "Rs. " formatted string (Finding 8, compliant, contradicting the prompt's own suggestion this might be a string-sort defect) | Medium | Unmapped |
| TC-101 | Localisation | Localisation | No thousands separator is applied to a 4+ digit price (finding) | Any user; a product priced ≥1000 exists | Product priced e.g. 1499 | 1. Locate a tile with a 4-digit price<br>2. Inspect its rendered text | Reads "Rs. 1499" with no comma/separator — recorded as the hardcoded-formatting finding for this technique | Low | Unmapped |
| TC-102 | SEO & Discoverability | SEO | Page title is static and non-descriptive of the actual search performed (defect) | Any user | Searches: "Shoes", then "Nike" | 1. Search "Shoes"; read `<title>`<br>2. Search "Nike"; read `<title>` | Both show the identical `<title>styleup For Kids</title>`, unrelated to either search term — log as a defect (Finding 14) | Medium | BR15 |
| TC-103 | SEO & Discoverability | SEO | No meta description, canonical, or robots directive exists | Any user | N/A | 1. Inspect `<head>` for `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">` | None of the 3 is present — a search-results URL is a conventional candidate for a `noindex` robots directive to avoid low-value duplicate indexing, and none exists at all | Medium | BR15 |
| TC-104 | SEO & Discoverability | SEO | No `<h1>` exists; a prior one was removed (finding) | Any user | N/A | 1. Inspect the page's heading elements<br>2. Inspect the HTML source for any commented-out heading | No live heading exists; a commented-out `<h1>Kids Products</h1>` is present in the source (line 46), confirming one existed and was removed | Low | BR15 |
| TC-105 | SEO & Discoverability | SEO | Product tiles are not crawlable anchors (defect) | Any user | N/A | 1. Inspect a product tile's DOM structure | The tile is a plain `<div>` with no wrapping `<a href>` anywhere — invisible to a crawler | Medium | BR15 |
| TC-106 | Interface Contract (Search Parameter & Client Storage Schema) | Interface Contract | `searchData` handoff — writer/reader agreement | N/A | N/A | 1. Grep the codebase for `searchData`<br>2. Compare the casing and shape written by `search-algo.js` against what `search.js` reads | Both use identical casing (`searchData`) and an array-of-product-object shape; no URL parameter is used at all (Finding 1), so there is no parameter-casing mismatch to check | Medium | BR13 |
| TC-107 | Interface Contract (Search Parameter & Client Storage Schema) | Interface Contract | `cartData` entries written here match the shape `cart.html` expects | N/A | N/A | 1. Add a product from this page<br>2. Inspect the `cartData` entry's field names<br>3. Open `cart.html` and confirm it renders this entry correctly | `cart.html` correctly reads and displays the entry — same field names (`name`, `price`, `quantity`, `cartprice`) and casing used consistently by both pages | Medium | BR13 |
| TC-108 | Accessibility — Keyboard Navigation & Focus | Accessibility | All filter checkboxes are reachable and operable via keyboard | Guest; keyboard only | All 12 checkboxes | 1. Tab through the entire Filter Section<br>2. Toggle each with Space | All are native `<input type="checkbox">` — reachable and operable, compliant | Medium | BR16(a) |
| TC-109 | Accessibility — Keyboard Navigation & Focus | Accessibility | Sort dropdowns are reachable and operable via keyboard | Guest; keyboard only | 3 dropdowns | 1. Tab to each; open and select an option using arrow keys + Enter | All are native `<select>` — reachable and operable, compliant | Medium | BR16(a) |
| TC-110 | Accessibility — Keyboard Navigation & Focus | Accessibility | Add to Cart buttons are reachable and operable via keyboard | Guest; keyboard only | Any tile | 1. Tab to an "Add to Cart" button; press Enter | Native `<button>` — reachable and operable, compliant | Medium | BR16(a) |
| TC-111 | Accessibility — Keyboard Navigation & Focus | Accessibility | Keyboard focus is not lost or reset to the top of the document when the listing re-renders after a filter (defect check) | Guest; keyboard only | Focus on a GENDER checkbox | 1. Tab to and check the "Boys" checkbox using the keyboard<br>2. Observe where keyboard focus lands after `appendData()` re-renders the listing | Since `appendData()` calls `innerHTML=''` and rebuilds the entire `#item-container`, if focus was on an element inside that container it would be lost; the checkbox itself is outside the container so its own focus should survive — verify and log as a defect only if focus is actually lost from an element that should retain it | Medium | BR16(a) |
| TC-112 | Accessibility — Forms & Labels | Accessibility | Filter checkboxes have no programmatically associated label (defect) | Guest; NVDA + DevTools | Any checkbox | 1. Inspect for a `<label for="">` wrapping or referencing the checkbox<br>2. Tab to the checkbox with NVDA running | **Expected to FAIL:** no `<label>` exists anywhere in `search.html` (Finding 13) — each checkbox is followed only by a plain `<span>`; NVDA announces "checkbox, not checked" with no name | High | BR16(b) |
| TC-113 | Accessibility — Forms & Labels | Accessibility | Sort dropdowns' accessible name is unstable, changing after selection (defect) | Guest; NVDA | Sort by Price dropdown | 1. Tab to the dropdown before any selection; note NVDA's announcement<br>2. Select "Low to High"; tab away and back; note NVDA's announcement again | Before: announces "Sort by Price". After: announces "Low to High" — the descriptive name is lost once a selection is made, since there is no separate `<label>` or `aria-label`, only the currently selected `<option>` text (Finding 13) | High | BR16(b) |
| TC-114 | Accessibility — Forms & Labels | Accessibility | All Add to Cart buttons share one identical accessible name (defect) | Guest; NVDA | A listing with ≥2 tiles | 1. Tab through 2 or more "Add to Cart" buttons with NVDA running | Both announce identically as "Add to Cart" with no product-distinguishing text — a screen-reader user cannot tell which button adds which product (Finding 12) | High | BR16(b) |
| TC-115 | Accessibility — Images & Alt Text | Accessibility | Product tile images have no alt text at all (defect) | Guest; DevTools | Any tile image | 1. Inspect a tile's `<img>` element | No `alt` attribute is set anywhere in `appendData()` (Finding 12) — a screen-reader user hears nothing describing the product image | High | BR16(c) |
| TC-116 | Accessibility — Images & Alt Text | Accessibility | Logo alt-text is present and correct on this page (compliant) | Guest; DevTools | Logo | 1. Inspect the Logo's `alt` attribute | `alt="logo"` is present (`search.html` line 19) — compliant, consistent with `index.html` | Low | BR16(c) |
| TC-117 | Accessibility — Contrast | Accessibility | Filter/sort/product-listing area text contrast (WCAG 1.4.3) | Guest; contrast tool | Filter labels, sort dropdown text, product name/price, Add to Cart button | 1. Measure contrast of each element type | Record any element below 4.5:1 (3:1 large text) as a FAIL | Medium | BR16(d) |
| TC-118 | Accessibility — Contrast | Accessibility | Breadcrumb, Total Items count, and Footer text contrast (WCAG 1.4.3) | Guest; contrast tool | Breadcrumb, item-count, footer links/promo text | 1. Measure contrast of each | Record any FAIL | Low | BR16(d) |
| TC-119 | Accessibility — Status & Change Announcement | Accessibility | No live region announces a changed Total Items count after a filter or sort (defect) | Guest; NVDA | Apply a filter | 1. With NVDA running, check a filter checkbox<br>2. Listen for any announcement of the new count or listing change | **Expected to FAIL:** neither `#item-count` nor `#item-container` carries `aria-live` or any equivalent role (confirmed by grep — zero `aria-` attributes anywhere in `search.html`, Finding 13); a screen-reader user receives no notification that the result set changed | High | BR16(e) |
| TC-120 | Accessibility — Page Title & Structure | Accessibility | Page title is non-descriptive and identical regardless of search term (defect, cross-referenced with SEO) | Guest | N/A | 1. Read `<title>` for two different searches | Both read the same static "styleup For Kids" — fails WCAG 2.4.2's "descriptive" requirement | Medium | BR16(f) |
| TC-121 | Accessibility — Page Title & Structure | Accessibility | No `<h1>` exists in the live heading hierarchy (defect) | Guest | N/A | 1. Inspect the page's heading structure | No heading element renders at all; the only candidate (`<h1>Kids Products</h1>`) is commented out | Medium | BR16(f) |
| TC-122 | Cross-Feature End-to-End Journeys | End-to-End | Guest search → filter → sort → add to cart → sign in, ending in a persisted-state assertion | Guest, `cartData` empty | Search "Shoes"; filter CATEGORIES "Shoes"; sort "Low to High"; sign in with an existing account | 1. Search "Shoes"<br>2. Apply the "Shoes" CATEGORIES filter<br>3. Apply "Low to High" (per Table A, this discards the filter — note this as part of the journey)<br>4. Add the top-listed item to cart as a guest<br>5. Sign in<br>6. Inspect `cartData` in DevTools | The guest-added item is present in `cartData` after sign-in, and the Cart icon now displays it — the journey proves the cart data persisted through the login transition, while also surfacing the filter-discarded-by-sort defect from Table A as a realistic mid-journey friction point | High | BR1,BR2,BR3,BR9,BR10 |
| TC-123 | Cross-Feature End-to-End Journeys | End-to-End | Authenticated multi-add across two distinct products with a Discount filter in between | Authenticated, `cartData` empty | Discount ">30% off" filter; 2 distinct products | 1. Apply ">30% off"<br>2. Add the first listed product<br>3. Add a second, different listed product<br>4. Inspect the Cart icon and `cartData` | Icon reads "2"; `cartData` holds 2 distinct entries, each `quantity:1` | High | BR2,BR3,BR9 |
| TC-124 | Cross-Feature End-to-End Journeys | End-to-End | Brand selection after a category filter, ending in an add-to-cart persisted-state assertion | Authenticated, `cartData` empty | CATEGORIES "Shoes" then Brand "Nike" | 1. Check "Shoes"<br>2. Select "Nike" (per Table C, this discards the Shoes filter)<br>3. Add the first listed item<br>4. Inspect `cartData` | `cartData` holds the Nike-brand item that was actually visible at the moment of the click (not necessarily a "Nike Shoes" item, per the Table C defect) — the journey demonstrates the filter-discard defect has a real downstream consequence on what gets purchased | Medium | BR2,BR3,BR9 |
| TC-125 | Cross-Feature End-to-End Journeys | End-to-End | Zero-result search state followed by a fresh, successful search | Guest | First: a technically well-formed but non-matching term; then: "Shoes" | 1. Search a well-formed but non-matching term (BR4 zero-results)<br>2. Confirm "Product not Found" alert, no navigation occurs (per the homepage round's BR4 behavior)<br>3. Search "Shoes" instead<br>4. Confirm arrival at Search Results with correct tiles | Step 2 never reaches this page at all (the homepage's own `getArray()` only redirects on a match); step 4 succeeds normally | Medium | BR4 |
| TC-126 | Cross-Feature End-to-End Journeys | End-to-End | Full guest-to-authenticated Add to Cart journey via the console-error path, ending in a persisted-state assertion | Guest → Authenticated, `cartData` empty | Search "Shoes"; add 1 item as guest (triggers Finding 7's console error); then sign in | 1. Search "Shoes"<br>2. Add an item as a guest (note the Console error per TC-050)<br>3. Sign in<br>4. Inspect `cartData` and the Cart icon | Despite the guest-side console error, `cartData` was still correctly written (the error occurs in `cartItems()`, called *after* the `localStorage.setItem` in `addToCart()`) — the item persists and the icon correctly shows "1" post-login, confirming the error is cosmetic-in-console only, not data-corrupting | Medium | BR3,BR9,BR11 |
| TC-127 | Keyboard End-to-End Journeys | End-to-End | Complete filter → sort → add-to-cart using the keyboard alone | Guest; keyboard only | CATEGORIES "Shoes"; "Low to High"; first resulting tile | 1. Tab to the "Shoes" checkbox; press Space to check it<br>2. Tab to the Sort by Price dropdown; use arrow keys to select "Low to High"; confirm with Enter<br>3. Tab to the first tile's "Add to Cart" button; press Enter | Filter and sort both apply via keyboard alone (per Table A, the sort discards the filter — the journey still completes functionally); the add succeeds with an alert shown; no mouse used at any point | High | BR16(a),BR2,BR3 |
| TC-128 | Keyboard End-to-End Journeys | End-to-End | Complete a Brand selection → Add to Cart journey using the keyboard alone | Guest; keyboard only | Brand "Reebok"; first resulting tile | 1. Tab to the Sort by Brand dropdown; select "Reebok" via arrow keys + Enter<br>2. Tab to the first resulting tile's "Add to Cart" button; press Enter | Brand filter applies and the add succeeds, all via keyboard alone | High | BR16(a),BR2,BR3 |

---

## Summary Table — Case Count per Rule 12 Section

| Section | Count | Reason (if 0) |
|---|---|---|
| Breadcrumb | 2 | |
| Total Items Count | 4 | |
| Filter Section | 14 | |
| Sort by Price | 2 | |
| Sort by Name | 3 | |
| Sort by Brand | 12 | |
| Product Listing | 3 | |
| Add to Cart | 4 | |
| Persistence Checks (Logo, Cart Icon & Footer) | 3 | |
| Guest User Flows | 3 | |
| Authenticated User Flows | 2 | |
| Equivalence Classes | 3 | |
| Boundary — Discount Ranges | 3 | |
| Boundary — Total Items Count | 3 | |
| Boundary — Price Sort Comparator | 2 | |
| Boundary — Name Sort Comparator | 2 | |
| Decision Tables | 7 | |
| State Transitions | 4 | |
| Data Integrity | 4 | |
| Concurrency | 3 | |
| Recovery | 5 | |
| Client-Side Security | 3 | |
| Compliance | 2 | |
| Analytics | 1 | Grep for tracking calls across all `.js` files returns zero matches |
| Usability | 3 | |
| Compatibility | 2 | |
| Localisation | 3 | |
| SEO & Discoverability | 4 | |
| Interface Contract (Search Parameter & Client Storage Schema) | 2 | |
| Accessibility — Keyboard Navigation & Focus | 4 | |
| Accessibility — Forms & Labels | 3 | |
| Accessibility — Images & Alt Text | 2 | |
| Accessibility — Contrast | 2 | |
| Accessibility — Status & Change Announcement | 1 | |
| Accessibility — Page Title & Structure | 2 | |
| Cross-Feature End-to-End Journeys | 5 | |
| Keyboard End-to-End Journeys | 2 | |
| **Total** | **128** | |

## Summary Table — Case Count per Business Rule (BR1–BR16)

| BR | Count | Reason (if 0) |
|---|---|---|
| BR1 | 2 | |
| BR2 | 27 | |
| BR3 | 15 | |
| BR4 | 3 | |
| BR5 | **0** | Carried over for numbering continuity only; the Search Results page has no Sign In fields or actions, per this round's own Section 4 text |
| BR6 | **0** | Carried over for numbering continuity only; the Search Results page has no Sign Up fields or actions, per this round's own Section 4 text |
| BR7 | 5 | |
| BR8 | 3 | |
| BR9 | 20 | |
| BR10 | 8 | |
| BR11 | 6 | |
| BR12 | 4 | |
| BR13 | 4 | |
| BR14 | 2 | |
| BR15 | 4 | |
| BR16 (a–f) | 14 | |
| Unmapped (Usability, Analytics, Localisation — see note) | 7 | |
| **Total occurrences (some cases counted under >1 BR)** | **124** | |

## Summary Table — Case Count per Section 6 Technique (all 19)

| # | Technique | Count | Reason (if 0) |
|---|---|---|---|
| 1 | Positive | 34 | |
| 2 | Negative | 6 | |
| 3 | Equivalence Class | 3 | |
| 4 | Boundary (accept/reject/discrepancy) | 12 | |
| 5 | Decision Table | 7 | |
| 6 | State Transition | 4 | |
| 7 | Data Integrity | 4 | |
| 8 | End-to-End | 7 | |
| 9 | Concurrency | 3 | |
| 10 | Recovery | 5 | |
| 11 | Security | 3 | |
| 12 | Compliance | 2 | |
| 13 | Analytics | 1 | Grep for `gtag`/`dataLayer`/`analytics`/`fetch(`/`sendBeacon`/`XMLHttpRequest` across all `.js` files returns zero matches |
| 14 | Usability | 3 | |
| 15 | Compatibility | 2 | |
| 16 | Localisation | 3 | This page IS productive for this technique (renders prices) — 3 substantive cases, not a zero-case, per the prompt's own expectation |
| 17 | SEO | 4 | |
| 18 | Interface Contract | 2 | |
| 19 | Accessibility | 14 | |
| **Total** | **119** | Discrepancy from the 128-row register total reflects cases whose primary technique is compound (e.g. several Decision Table/State Transition rows are also counted toward BR totals above but represent single technique instances here); each row is counted once under its stated Scenario type |

## Element × Technique Matrix (Rule 21f)

| Element | 1 Pos | 2 Neg | 3 EqC | 4 Bnd | 5 DecT | 6 StT | 7 DI | 8 E2E | 9 Conc | 10 Rec | 11 Sec | 12 Comp | 13 Analy | 14 Usab | 15 Compat | 16 Loc | 17 SEO | 18 IC | 19 A11y |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Breadcrumb | TC-002 | TC-001 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — | — |
| Total Items count | TC-003 | — | — | TC-059–061 | — | — | TC-076 | — | — | — | — | — | — | TC-094(≈) | — | — | — | — | — |
| GENDER checkboxes | TC-007,008 | TC-019 | TC-055 | — | TC-068 | TC-072 | — | — | — | TC-083 | — | — | — | — | — | — | — | — | TC-108,112 |
| CATEGORIES checkboxes | TC-009–013 | TC-019 | TC-055 | — | TC-066,067,069 | TC-072 | — | — | — | TC-083 | — | — | — | TC-095 | — | — | — | — | TC-108,112 |
| Discount checkboxes | TC-014–018 | — | TC-053 | TC-056–058 | — | — | — | — | — | — | — | — | — | — | — | — | — | — | TC-108,112 |
| Sort by Price | TC-021,022 | — | — | TC-062,063 | TC-066,067 | TC-073 | — | — | — | TC-084 | — | — | — | TC-096 | — | TC-100 | — | — | TC-109 |
| Sort by Name | TC-023,024 | — | — | TC-064,065 | — | — | TC-077 | — | — | — | — | — | — | — | — | — | — | — | TC-109 |
| Sort by Brand | TC-026–035 | — | TC-036,054 | — | TC-069 | — | — | — | — | — | — | — | — | — | — | — | — | — | TC-109 |
| Product tiles | TC-038,039 | TC-040 | — | — | — | — | TC-077 | — | — | — | TC-088 | — | — | — | — | TC-099,101 | TC-104,105 | — | TC-115 |
| Add to Cart button | TC-041,042 | — | — | — | TC-070,071 | TC-074 | TC-044,078,079 | — | TC-080,082 | — | TC-089 | TC-092 | TC-093 | — | — | — | — | TC-107 | TC-110,114 |
| Logo (persistence) | TC-045 | — | — | — | — | — | — | — | — | — | — | — | — | — | TC-097,098 | — | — | — | TC-116 |
| Cart icon (persistence) | TC-046,051 | TC-049 | — | — | — | TC-046 | — | — | TC-081 | — | TC-050 | — | — | — | — | — | — | — | — |
| Footer (persistence) | TC-047 | — | — | — | — | — | — | — | — | — | — | TC-091 | — | — | — | — | — | — | — |

Dashes mark technique/element pairs not applicable (e.g. Analytics/Localisation apply page-wide, not per checkbox).

---

## Unmapped but In-Scope Behaviors (Rule 8/18)

- **TC-093 (Analytics), TC-094–096 (Usability), TC-099–101 (Localisation)** carry no stating Business Rule, exactly as anticipated by this round's own text.

## Zero-Case Statements (Rule 20)

- **Analytics (technique 13):** Grepped `gtag`, `dataLayer`, `analytics`, `fetch(`, `sendBeacon`, `XMLHttpRequest` across every `.js` file — zero matches. No per-element analytics cases exist beyond the single site-wide zero-case (TC-093).
- **Compliance — consent mechanism (technique 12):** Grepped `cookie`, `consent` (case-insensitive) across every `.html` file — matches appear only in `terms-of-use.html`'s own body text, never as an interactive consent-gating element.
- **`maxlength` / numeric comparison boundaries beyond those documented (technique 4):** Grepped `search.html`/`search.js` for `maxlength` — zero matches (there is no free-text input on this page other than the shared navbar search, out of scope per Constraint 1). All numeric comparisons in the filter JS (the 5 discount thresholds) are fully covered by TC-014–018/056–058.
- **Accessibility attributes (technique 19), beyond the specific defects already cited:** Grepped `aria-`, `<label`, `alt=`, `role=` across `search.html` — zero matches for `aria-`, `<label`, and `role=`; `alt=` appears exactly once, on the Logo (`alt="logo"`), confirmed absent on every product tile image and every other image on the page.
- **SEO — duplicate-URL-via-parameter-ordering (technique 17):** No case generated. Since no URL query parameter is used at all for the search term (Finding 1), there is no possibility of two differently-ordered or differently-cased parameter combinations producing duplicate indexable URLs.
- **Localisation — text direction (technique 16):** No case generated for RTL/LTR behavior. `<html lang="en">` implies LTR throughout, and no `dir=` attribute or bidi-sensitive content exists anywhere on this page.
- **BR5, BR6:** Zero cases, per Rule 8's explicit instruction — this page has no Sign In or Sign Up fields or actions.

## Reproducibility Check (Rule 22)

Every case traces to a named element in Section 2/3 and a technique in Section 6. All four decision tables trace to a stated row (Rule 11). Every expected-to-fail case states both the requirement and the observed behavior before instructing the tester to log a defect. The findings driving this round's most consequential content — filters/sorts never composing (Finding 3), the guest-side console error (Finding 7), the brand dropdown's "All Brands"/zero-match collision (Finding 6), and the search term's storage-only (non-URL) handoff (Finding 1) — are each grounded in a specific line-numbered read of `search.js`, `search.html`, and `search-algo.js`, or a specific grep, performed fresh for this round. Re-running this analysis against the same source would reproduce the same 128 cases, the same zero-cases, and the same defects.
