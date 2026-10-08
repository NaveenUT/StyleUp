# Search Results Page — Playwright + TypeScript Automation

Page-Object-Model automation for `TEST_CASES_SEARCH_RESULTS_ALLTECHNIQUES_REGISTER_V2.md` (128 test cases, TC-001–TC-128), built per `prompt_phase2_playwright_conversion_v3_framework_aware (1).md`'s mandated framework structure. Self-contained project — its own `package.json`, `playwright.config.ts`, etc. — living at `automation/Search/` inside the wider repo.

## Setup

```bash
cd automation/Search
npm install
npx playwright install chromium   # firefox/webkit/msedge optional, only needed for those projects
cp .env.example .env               # already present with working defaults
```

The target app is a plain static site. `playwright.config.ts`'s `webServer` starts `python -m http.server 5501` from the repo root automatically (`reuseExistingServer: true`, so it's a no-op if you already have one running).

## Running

```bash
npm test                          # everything, headless, chromium
npm run test:headed               # everything, visible browser
npx playwright test --project=chromium
npx playwright test --grep @smoke
npx playwright test --grep @regression
npm run test:filter-section       # one feature folder — see package.json for the full list
```

## Reports

```bash
npm run report            # Playwright's own HTML report
npm run report:monocart   # Monocart report (richer step/trace detail)
```

## Structure

```
pages/              BasePage, LoginPage, HomePage, SearchResultsPage, CartPage
tests/<feature>/     One spec file per register Section (36 folders)
fixtures/            customFixtures.ts — loginPage/homePage/searchResultsPage/cartPage
utils/                config.ts, waitHelpers.ts, storageHelpers.ts, accessibilityHelpers.ts
test-data/           testData.ts — search terms, seeded product fixtures, accounts
```

## Result summary

**124 of 128 test cases pass.** The remaining 4 (TC-067, TC-076, TC-117, TC-118) fail *by design* — each asserts the Phase 1 register's literal Expected Result, which live testing this session showed the application actually contradicts. See `DISCREPANCY_LOG.md` for the full explanation of each, plus two newly-discovered findings not in the original register (a `searchArr` redeclaration bug that kills the navbar search on this page, and two measured WCAG contrast failures).

Other documents in this folder:
- `SOURCE_CODE_INVENTORY.md` — Mode A inventory, file:line-cited
- `VERIFICATION_MODE_REGISTER.md` — every locator, its mode, and whether it was DOM-cross-checked
- `FILE_MANIFEST.md` — every file this conversion created
- `FRAMEWORK_COMPLIANCE_CHECKLIST.md` — the mandate's own checklist, verified line by line
