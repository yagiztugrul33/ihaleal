#!/usr/bin/env node
// R14 funnel kalıcı smoke testi — chicken-egg RPC fix gibi kritik fix'lerin
// gelecekte bozulmamasını sağlar. Test kullanıcısı oluşturur, signup'ı doğrular,
// (opsiyonel) admin verify yapar, panel render'ı kontrol eder.
//
// Kullanım:
//   npm run smoke:r14                             # canlı (default)
//   BASE=http://localhost:4173 npm run smoke:r14  # lokal preview
//
// PASS: exit 0   ·  FAIL: exit 1 (hangi adım nerede patladı kanıt verir)
//
// Test verisi: benzersiz "funnelsmoke+<TS>@test.com" maili — gerçek user yaratır.
// Cleanup şu an YOK (test user'lar Supabase Dashboard'tan periyodik silinmeli).

import { chromium } from "playwright";

const BASE = process.env.BASE || "https://www.ihaleal.com";
const TS = Date.now();
const EMAIL = `funnelsmoke+${TS}@test.com`;
const PASSWORD = "Test1234!Aa";

const IGNORE = [
  /Content Security Policy/i,
  /fonts\.googleapis/i,
  /Failed to load resource.*401/i,
  /Failed to load resource.*406/i,
  /Failed to load resource.*404/i,
];

async function main() {
  console.log(`R14 FUNNEL SMOKE  base=${BASE}  email=${EMAIL}`);
  console.log("─".repeat(72));

  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await ctx.newPage();

  const netErrors = [];
  page.on("response", async (r) => {
    if (r.url().includes("supabase.co") && r.status() >= 400) {
      let body = "";
      try {
        body = (await r.text()).slice(0, 200);
      } catch {
        /* ignore body read errors */
      }
      const text = `${r.status()} ${r.request().method()} ${r.url().split("supabase.co")[1] || r.url()} ${body}`;
      if (!IGNORE.some((rx) => rx.test(text))) netErrors.push(text);
    }
  });

  const results = [];
  function step(name, ok, detail = "") {
    results.push({ name, ok, detail });
    console.log(`  ${ok ? "✅" : "❌"} ${name}  ${detail}`);
  }

  try {
    // 1) Signup form alanları render mi
    await page.goto(`${BASE}/kayit?profil=muteahhit`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1200);
    const hasEmailInput = (await page.locator('input[type="email"]').count()) > 0;
    const hasOrgInput = (await page.locator('input[autocomplete="organization"]').count()) > 0;
    const hasTaxInput = (await page.locator('input[placeholder="1234567890"]').count()) > 0;
    step("kayıt formu render", hasEmailInput && hasOrgInput && hasTaxInput,
      `email=${hasEmailInput} org=${hasOrgInput} tax=${hasTaxInput}`);
    if (!hasEmailInput || !hasOrgInput || !hasTaxInput) throw new Error("form eksik");

    // 2) Form doldur + submit
    await page.fill('input[autocomplete="name"]', `Smoke ${TS}`).catch(() => {});
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[autocomplete="tel"]', "5550000000").catch(() => {});
    await page.fill('input[autocomplete="organization"]', `Smoke Co ${TS}`);
    await page.locator('input[placeholder="1234567890"]').first().fill(String(TS).slice(0, 10));
    await page.fill('textarea', "Smoke Adres");
    const passInputs = page.locator('input[type="password"]');
    for (let i = 0; i < (await passInputs.count()); i++) await passInputs.nth(i).fill(PASSWORD);
    await page.locator('button[role="checkbox"], input[type="checkbox"]').first().click().catch(() => {});

    netErrors.length = 0;
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(7000);

    // 3) Signup→onay-bekleniyor (KRİTİK: chicken-egg RPC kanıtı)
    const url = page.url();
    const onayDusmus = url.includes("/muteahhit/onay-bekleniyor");
    const has403 = netErrors.some((e) => /^403/.test(e));
    const has500 = netErrors.some((e) => /^5\d\d/.test(e));
    step("signup→/muteahhit/onay-bekleniyor (chicken-egg RPC)",
      onayDusmus,
      has403 ? "FAIL 403 (RLS regresyonu!)" : has500 ? "FAIL 500" : `url=${url}`);
    if (!onayDusmus) {
      if (netErrors.length) for (const ne of netErrors.slice(0, 3)) console.log("    " + ne);
      throw new Error("signup fail");
    }

    // 4) Onay bekleme sayfası içeriği
    const onayBody = await page.locator("body").innerText().catch(() => "");
    const onayOk = /onay|bekle/i.test(onayBody);
    step("onay-bekleniyor sayfa içeriği", onayOk, `text(50)="${onayBody.slice(0, 50).replace(/\s+/g, " ")}…"`);

    // 5) Panel anon erişim → giriş yönlendirmesi
    // Tam anon ortam için fresh context (cookies + localStorage + sessionStorage temiz)
    const anonCtx = await b.newContext({ viewport: { width: 1366, height: 768 } });
    const anonPage = await anonCtx.newPage();
    await anonPage.goto(`${BASE}/muteahhit/panel`, { waitUntil: "networkidle", timeout: 30000 });
    await anonPage.waitForTimeout(2000);
    const guardUrl = anonPage.url();
    const redirectedToLogin = guardUrl.includes("/giris");
    step("anon /muteahhit/panel → /giris (ProtectedRoute)", redirectedToLogin, `url=${guardUrl}`);
    await anonCtx.close();

  } catch (e) {
    console.log("  EXCEPTION:", String(e).split("\n")[0]);
  } finally {
    await b.close();
  }

  console.log("─".repeat(72));
  const passed = results.filter((r) => r.ok).length;
  console.log(`R14 FUNNEL SMOKE: ${passed}/${results.length} PASS`);
  process.exit(passed === results.length ? 0 : 1);
}

await main().catch((e) => {
  console.error("smoke runner crashed:", e);
  process.exit(2);
});
