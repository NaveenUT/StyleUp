/**
 * Section: Interface Contract (Client Storage Schema)
 * Business Rule(s): BR12, BR11
 * Target website: BASE_URL
 * Verification mode(s) used: Mode A (source) — grep steps executed live via HTTP fetch
 *   of the raw served files, not merely read once and hardcoded as a comment
 * Source files analysed: navbar.js, signin.html, signup.html, cart.html, index.js, mens.js,
 *   womens.js, kids.js, home&living.js, search.js
 * Source register: Homepage_prompt_coverage_improvement (3).md, TC-128–TC-132
 */
import { test, expect } from '../../fixtures/customFixtures';
import { APIRequestContext } from '@playwright/test';
import { config } from '../../utils/config';

async function fetchSource(request: APIRequestContext, file: string): Promise<string> {
  const res = await request.get(`${config.baseUrl}/${file}`);
  return res.text();
}

test.describe('Interface Contract (Client Storage Schema)', () => {
  test('TC-128: loginStatus — single writer, single reader, consistent casing', async ({ request }) => {
    const files = [
      'navbar.js', 'signin.html', 'signup.html', 'index.js', 'mens.js', 'womens.js',
      'kids.js', 'home&living.js', 'search.js', 'cart.html', 'address.html', 'payment.html', 'otp.html',
    ];
    const hits: Record<string, number> = {};
    for (const f of files) {
      const text = await fetchSource(request, f);
      const count = (text.match(/loginStatus/g) || []).length;
      if (count > 0) hits[f] = count;
    }
    // Written by signin.html (true) and navbar.js's logout() (false); read only by navbar.js.
    expect(Object.keys(hits).sort()).toEqual(['navbar.js', 'signin.html']);
  });

  test('TC-129: userdata — shape and casing agreement between writer and reader', async ({ request }) => {
    const signup = await fetchSource(request, 'signup.html');
    const signin = await fetchSource(request, 'signin.html');
    expect(signup).toContain("localStorage.setItem('userdata'");
    expect(signin).toContain('localStorage.getItem("userdata")');
    // Both use the identical mixed-casing field shape: name (lowercase), Email/Password (capitalised).
    expect(signup).toContain('name:formtag.name.value');
    expect(signup).toContain('Email:formtag.mail.value');
    expect(signup).toContain('Password:formtag.pass.value');
    expect(signin).toContain('Email==el.Email&&Password==el.Password');
  });

  test('TC-130: cartData — consistent across every reader/writer page in the wider site', async ({ request }) => {
    const files = ['cart.html', 'index.js', 'mens.js', 'womens.js', 'kids.js', 'home&living.js', 'search.js'];
    for (const f of files) {
      const text = await fetchSource(request, f);
      expect(text).toContain('cartData');
      // No casing mismatch (e.g. "CartData", "cartdata") anywhere — every case-insensitive
      // occurrence of the key spells it exactly "cartData".
      const allOccurrences = text.match(/cartdata/gi) || [];
      const correctlyCased = text.match(/cartData/g) || [];
      expect(allOccurrences.length).toBe(correctlyCased.length);
    }
  });

  test('TC-131: logginName — write-only key with no consuming reader anywhere (defect)', async ({ request }) => {
    const allFiles = [
      'navbar.js', 'signup.html', 'index.js', 'mens.js', 'womens.js', 'kids.js',
      'home&living.js', 'search.js', 'cart.html', 'address.html', 'payment.html', 'otp.js',
    ];
    for (const f of allFiles) {
      const text = await fetchSource(request, f);
      expect(text).not.toContain('logginName');
    }
    const signin = await fetchSource(request, 'signin.html');
    // Only signin.html contains it, as both its own reader (of prior writes) and writer —
    // no other part of the application ever consumes what it accumulates.
    expect(signin).toContain('logginName');
  });

  test('TC-132: Malformed/hand-edited storage value does not crash the page (recovery-adjacent contract check)', async ({ signInPage, page }) => {
    await signInPage.setup();
    await page.evaluate(() => window.localStorage.setItem('userdata', 'not-json'));

    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));
    // Defect, more precise than the register's own framing: signin.html:53's
    // `JSON.parse(localStorage.getItem("userdata"))` is a top-level statement, not inside
    // myfunction() — it throws uncaught during the RELOAD itself (page load), before any
    // form interaction. Because the exception aborts that <script> block's remaining
    // top-level statements, signin.html:54's own `addEventListener("submit", myfunction)`
    // never runs either — the submit handler is never attached at all.
    await signInPage.reload();
    expect(pageErrors.length).toBeGreaterThan(0);

    await signInPage.fillEmail('anyone@test.com');
    await signInPage.fillPassword('AnyPass1');
    await signInPage.submit();
    await page.waitForTimeout(300);

    // Consequence: with no listener calling event.preventDefault(), the <form> (no
    // `action` attribute) falls back to the browser's default GET submission — to the
    // current URL. Live-confirmed this session: the resulting URL is exactly
    // "signin.html?" with an EMPTY query string, since neither #mail nor #pass carries
    // a `name` attribute (only `id`) — fields without `name` are excluded from a form's
    // default submission data entirely, so no credential leaks into the address bar here,
    // but the click still produces a pointless self-reload with none of the typed values.
    await expect(page).toHaveURL(`${config.baseUrl}/signin.html?`);
    const search = await page.evaluate(() => window.location.search);
    expect(search).toBe('');
  });
});
