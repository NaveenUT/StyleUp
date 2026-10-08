# Test Case Format Options — Examples

Three candidate formats for the detailed test case document, each shown with two sample test cases (TC-001: Sign Up, TC-043: Cart coupon). Review and pick one so the full 64-case document can be rewritten in that style.

---

## Option 1: Extended Table

Adds Precondition, Test Data, Priority columns; steps and expected results are numbered and spelled out with exact values.

| TC ID | Module | Test Scenario | Precondition | Test Data | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC-001 | Sign Up | Verify a new user can register with all valid, well-formed inputs and the account is persisted for later login | Browser localStorage key `userdata` is empty; user is on signup.html | Name: "John Doe"<br>Email: "john.doe@test.com"<br>Password: "Test@1234" | 1. Navigate to signup.html<br>2. Click the "Full Name" field and type "John Doe"<br>3. Click the "Email" field and type "john.doe@test.com"<br>4. Click the "Password" field and type "Test@1234"<br>5. Click the "Sign Up" button<br>6. Observe browser behavior<br>7. Open DevTools > Application > Local Storage and inspect the `userdata` key | 1. No validation alerts appear at any step<br>2. `userdata` in localStorage contains a new object: `{name:"John Doe", Email:"john.doe@test.com", Password:"Test@1234"}`<br>3. Browser redirects to signin.html<br>4. Previously entered form values are cleared (new page load) | High |
| TC-043 | Cart | Verify a valid coupon code correctly reduces the final payable amount by the discount percentage | User is logged in; cart contains at least 1 item; user is on cart.html | Coupon code: `masai30`<br>Cart total (Final Amount) before applying: e.g. ₹1000 | 1. Add a product to cart so Final Amount shows a non-zero value<br>2. Navigate to cart.html<br>3. Click the "Enter Coupon Code" input field<br>4. Type `masai30`<br>5. Click "Apply Coupon" button<br>6. Observe the "Total Amount" value | 1. No page reload occurs<br>2. "Total Amount" updates from ₹1000 to ₹700.0 (30% off, rounded to 1 decimal)<br>3. "Total MRP" (Items subtotal) remains unchanged at ₹1000 | Medium |

---

## Option 2: One Card Per Test Case

Each test case is its own labeled block instead of a table row — easier to scan individually, longer file overall.

### TC-001 — Sign Up: Register with all valid inputs

**Module:** Sign Up
**Priority:** High
**Precondition:** `userdata` key does not exist in localStorage; user is on signup.html, logged out

**Test Data:**
- Name: `John Doe`
- Email: `john.doe@test.com`
- Password: `Test@1234`

**Test Steps:**
1. Navigate to `signup.html`
2. Enter `John Doe` in the "Full Name" field
3. Enter `john.doe@test.com` in the "Email" field
4. Enter `Test@1234` in the "Password" field
5. Click the "Sign Up" button
6. Inspect `localStorage.userdata` via DevTools

**Expected Result:**
1. No alert/error is shown
2. A new user object is appended to `userdata` in localStorage
3. User is redirected to `signin.html`

**Postcondition:** New user can now log in with these credentials on signin.html

---

### TC-043 — Cart: Apply valid coupon code "masai30"

**Module:** Cart
**Priority:** Medium
**Precondition:** User is logged in; at least one item is in the cart; user is viewing cart.html

**Test Data:**
- Coupon code: `masai30`
- Example cart total before discount: ₹1000

**Test Steps:**
1. Ensure cart has ≥1 item and "Total Amount" displays a value (e.g. ₹1000)
2. Click the "Enter Coupon Code" input field
3. Type `masai30`
4. Click the "Apply Coupon" button
5. Read the new "Total Amount" value on screen

**Expected Result:**
1. Page does not reload
2. "Total Amount" recalculates to 70% of the pre-discount value (₹700.0)
3. "Total MRP" line item is untouched

**Postcondition:** Discounted amount is only reflected in the DOM text — not persisted to localStorage, so refreshing the page resets it to full price.

---

## Option 3: Table + Gherkin-Style Scenario

Compact table, but the "Test Scenario" column is written as a Given/When/Then behavioral statement.

| TC ID | Module | Test Scenario (Given/When/Then) | Test Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-001 | Sign Up | **Given** a new visitor on signup.html with no prior account, **When** they submit the form with a valid name, a well-formed email ending in ".com", and a password of 8+ characters, **Then** the account should be created and they should be moved to the sign-in flow | 1. Open signup.html<br>2. Fill Name="John Doe", Email="john.doe@test.com", Password="Test@1234"<br>3. Click "Sign Up" | Account object is saved to `userdata` in localStorage with matching Name/Email/Password; browser navigates to signin.html; no alert is shown | High |
| TC-043 | Cart | **Given** a logged-in user with items in their cart on cart.html, **When** they enter the coupon code "masai30" and click Apply Coupon, **Then** the Total Amount should be discounted by 30% of its current value | 1. Add item(s) to cart, confirm Total Amount shows e.g. ₹1000<br>2. Enter `masai30` in the coupon field<br>3. Click "Apply Coupon" | Total Amount field updates in place to ₹700.0 (30% discount applied); Total MRP stays the same; no page reload | Medium |

---

## Next Step

Reply with **1**, **2**, or **3** to have all 64 test cases in `TEST_CASES.md` rewritten in that format.
