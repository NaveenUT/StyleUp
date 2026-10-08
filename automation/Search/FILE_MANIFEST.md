# File Manifest

Every file created for this conversion, all under the new, self-contained `automation/Search/` project.

| Path | New/Modified | Reason |
|---|---|---|
| `package.json` | New | Project manifest — Playwright, TypeScript, dotenv, monocart-reporter |
| `playwright.config.ts` | New | HTML + Monocart reporters, 4 browser projects, webServer pointing at the repo root |
| `tsconfig.json` | New | Strict TS config covering pages/tests/fixtures/utils/test-data |
| `.env` / `.env.example` | New | `BASE_URL`, `APP_USERNAME`, `APP_PASSWORD`, `TIMEOUT` |
| `.gitignore` | New | Excludes node_modules, `.env`, reports |
| `SOURCE_CODE_INVENTORY.md` | New | Mode A inventory, incl. 2 newly-discovered findings |
| `VERIFICATION_MODE_REGISTER.md` | New | One row per distinct element |
| `FILE_MANIFEST.md` | New | This file |
| `DISCREPANCY_LOG.md` | New | Every ⚠ SOURCE DISCREPANCY raised |
| `FRAMEWORK_COMPLIANCE_CHECKLIST.md` | New | Line-by-line compliance confirmation |
| `README.md` | New | How to run, structure overview |
| `pages/BasePage.ts` | New | Base class — `setup()` owns navigation to BASE_URL |
| `pages/LoginPage.ts` | New | Sign In locators + `login()` |
| `pages/HomePage.ts` | New | Logo, search bar, footer, `search()`/`searchAndGoToResults()` |
| `pages/SearchResultsPage.ts` | New | Owns all Search Results locators/actions — breadcrumb, count, filters, sorts, brand, tiles, add-to-cart, footer, navbar, a11y accessors |
| `pages/CartPage.ts` | New | Cart line items, remove |
| `fixtures/customFixtures.ts` | New | `loginPage`/`homePage`/`searchResultsPage`/`cartPage` fixtures |
| `utils/config.ts` | New | Central config, backed by `.env` |
| `utils/waitHelpers.ts` | New | Dialog helpers (`triggerAndCaptureAlert`/`assertNoDialogFires`), external-image placeholder routing, `waitForTileCount` |
| `utils/storageHelpers.ts` | New | Precondition seed/read helpers (`seedSearchData`, `seedUserdata`, `seedLoginStatus`, `seedCartData`, `seedNow`, `readCartData`, etc.) — placement note: an additional file inside the already-mandated `utils/` folder, not a new top-level folder |
| `utils/accessibilityHelpers.ts` | New | `contrastRatio()` (WCAG relative-luminance) — same placement note |
| `test-data/testData.ts` | New | `searchTerms`, `defaultResultSet` (10-product deterministic fixture), `boundaryProducts`, `existingAccount`, `outOfRangeCartEntry` |
| `tests/breadcrumb/Breadcrumb.spec.ts` | New | TC-001–002 |
| `tests/total-items-count/TotalItemsCount.spec.ts` | New | TC-003–006 |
| `tests/filter-section/FilterSection.spec.ts` | New | TC-007–020 |
| `tests/sort-by-price/SortByPrice.spec.ts` | New | TC-021–022 |
| `tests/sort-by-name/SortByName.spec.ts` | New | TC-023–025 |
| `tests/sort-by-brand/SortByBrand.spec.ts` | New | TC-026–037 |
| `tests/product-listing/ProductListing.spec.ts` | New | TC-038–040 |
| `tests/add-to-cart/AddToCart.spec.ts` | New | TC-041–044 |
| `tests/persistence-checks/PersistenceChecks.spec.ts` | New | TC-045–047 |
| `tests/guest-user-flows/GuestUserFlows.spec.ts` | New | TC-048–050 |
| `tests/authenticated-user-flows/AuthenticatedUserFlows.spec.ts` | New | TC-051–052 |
| `tests/equivalence-classes/EquivalenceClasses.spec.ts` | New | TC-053–055 |
| `tests/boundary-discount-ranges/BoundaryDiscountRanges.spec.ts` | New | TC-056–058 |
| `tests/boundary-total-items-count/BoundaryTotalItemsCount.spec.ts` | New | TC-059–061 |
| `tests/boundary-price-sort-comparator/BoundaryPriceSortComparator.spec.ts` | New | TC-062–063 |
| `tests/boundary-name-sort-comparator/BoundaryNameSortComparator.spec.ts` | New | TC-064–065 |
| `tests/decision-tables/DecisionTables.spec.ts` | New | TC-066–071 |
| `tests/state-transitions/StateTransitions.spec.ts` | New | TC-072–075 |
| `tests/data-integrity/DataIntegrity.spec.ts` | New | TC-076–079 |
| `tests/concurrency/Concurrency.spec.ts` | New | TC-080–082 |
| `tests/recovery/Recovery.spec.ts` | New | TC-083–087 |
| `tests/client-side-security/ClientSideSecurity.spec.ts` | New | TC-088–090 |
| `tests/compliance/Compliance.spec.ts` | New | TC-091–092 |
| `tests/analytics/Analytics.spec.ts` | New | TC-093 |
| `tests/usability/Usability.spec.ts` | New | TC-094–096 |
| `tests/compatibility/Compatibility.spec.ts` | New | TC-097–098 |
| `tests/localisation/Localisation.spec.ts` | New | TC-099–101 |
| `tests/seo-discoverability/SeoDiscoverability.spec.ts` | New | TC-102–105 |
| `tests/interface-contract/InterfaceContract.spec.ts` | New | TC-106–107 |
| `tests/accessibility-keyboard/AccessibilityKeyboard.spec.ts` | New | TC-108–111 |
| `tests/accessibility-forms-labels/AccessibilityFormsLabels.spec.ts` | New | TC-112–114 |
| `tests/accessibility-images/AccessibilityImages.spec.ts` | New | TC-115–116 |
| `tests/accessibility-contrast/AccessibilityContrast.spec.ts` | New | TC-117–118 |
| `tests/accessibility-status-announcement/AccessibilityStatusAnnouncement.spec.ts` | New | TC-119 |
| `tests/accessibility-page-title-structure/AccessibilityPageTitleStructure.spec.ts` | New | TC-120–121 |
| `tests/cross-feature-e2e/CrossFeatureE2E.spec.ts` | New | TC-122–126 |
| `tests/keyboard-e2e/KeyboardE2E.spec.ts` | New | TC-127–128 |

36 spec files, 5 page classes, 128 test cases (TC-001–TC-128) — full 1:1 coverage of the Phase 1 register.
