// ADIM 12 — FAZ 1-B fiyatlandirma + ödeme çevirisi testi
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const browser = await chromium.launch();
const out = {};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await ctx.addInitScript((l) => {
    try {
      localStorage.setItem("ihaleal_locale", l);
      localStorage.setItem("ihaleal_currency", l === "tr" ? "TRY" : "USD");
    } catch {}
  }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  // 1. Fiyatlandırma
  const r1 = await page.goto(BASE + "/fiyatlandirma", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const pricing_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1b/pricing-${locale}.png`, fullPage: false });

  // 2. Ödeme Başlat (paket=pro)
  const r2 = await page.goto(BASE + "/odeme/baslat?paket=pro_emlakci&periyot=monthly", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  const start_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1b/odeme-start-${locale}.png`, fullPage: false });

  // 3. Ödeme Başarılı
  const r3 = await page.goto(BASE + "/odeme/basarili?paket=pro_emlakci&periyot=monthly", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(800);
  const success_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1b/odeme-basarili-${locale}.png`, fullPage: false });

  // Beklenen string'ler (sözlük)
  const expected = {
    tr: { p_title: "İhtiyacına göre paket seç", p_monthly: "Aylık", p_sandbox: "Sandbox", s_title: "Hoş geldin", s_charged: "tahsilat" },
    en: { p_title: "Choose the plan", p_monthly: "Monthly", p_sandbox: "Sandbox", s_title: "Welcome", s_charged: "charged in" },
    ru: { p_title: "Выберите подходящий тариф", p_monthly: "Ежемесячно", p_sandbox: "Тестовый", s_title: "Добро пожаловать", s_charged: "списание" },
    ar: { p_title: "اختر الباقة المناسبة", p_monthly: "شهري", p_sandbox: "الوضع التجريبي", s_title: "مرحباً", s_charged: "بالليرة" },
  };
  const exp = expected[locale];

  // Currency korundu mu (₺ ana, USD için ≈$)
  const has_try = /₺/.test(pricing_html) || /₺/.test(start_html);
  const has_usd_ref = locale !== "tr" ? /≈\s*\$/.test(pricing_html) || /≈\s*\$/.test(start_html) : true; // TR'de USD secilmedi

  out[locale] = {
    locale,
    http_pricing: r1?.status() ?? 0,
    http_start: r2?.status() ?? 0,
    http_success: r3?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    pricing_title: pricing_html.includes(exp.p_title),
    pricing_monthly: pricing_html.includes(exp.p_monthly),
    start_sandbox: start_html.includes(exp.p_sandbox),
    success_title: success_html.includes(exp.s_title),
    success_charged: success_html.includes(exp.s_charged),
    has_try,
    has_usd_ref,
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
