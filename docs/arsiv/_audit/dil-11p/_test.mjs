// ADIM 11-P — lib sabitleri i18n (render katmanında) — 4 dil
// Anchor: marketingBadge (satış-modu) + weeklySlot + weeklyPolicy + fxNoteTransaction (non-TR)
// + ÇEKİRDEK HESAP korundu: ana ₺ fiyat 4 dilde AYNI (fees.ts/FX dokunulmadı) + AR rtl + 0 pageerror
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/ilan/1`;
const browser = await chromium.launch();
const out = {};

const L = {
  tr: { badge: ["İhale", "Teklif al", "Sadece ilan"], weeklySlot: "Her Çarşamba", weeklyPolicy: "haftada bir", fxNote: null },
  en: { badge: ["Auction", "Receive offers", "Listing only"], weeklySlot: "Every Wednesday", weeklyPolicy: "per week", fxNote: "settled in ₺" },
  ru: { badge: ["Аукцион", "Приём предложений", "Только объявление"], weeklySlot: "Каждую среду", weeklyPolicy: "в неделю", fxNote: "расчёт в ₺" },
  ar: { badge: ["مزاد", "استقبال العروض", "إعلان فقط"], weeklySlot: "كل أربعاء", weeklyPolicy: "أسبوعياً", fxNote: "تتم بالليرة" },
};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 1400 } });
  await ctx.addInitScript((l) => {
    try { localStorage.setItem("ihaleal_locale", l); localStorage.setItem("ihaleal_currency", l === "tr" ? "TRY" : "USD"); } catch {}
  }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("PAGEERROR:" + String(e).slice(0, 150)));
  page.on("console", (m) => { if (m.type() === "error") { const t = m.text(); if (!/ERR_NAME_NOT_RESOLVED|Failed to load resource/.test(t)) errs.push(t.slice(0, 150)); } });

  const r = await page.goto(URL, { waitUntil: "networkidle", timeout: 35000 });
  await page.waitForTimeout(2200);
  const e = L[locale];
  const html = await page.content();
  const txt = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `_audit/dil-11p/lib-sabitleri-${locale}.png`, fullPage: false });

  // marketing badge — 3 olası satış-modundan biri görünmeli (çevrilmiş)
  const marketingBadge = e.badge.find((b) => html.includes(b)) ?? null;
  // ana ₺ fiyat (calc/currency dokunulmadı kanıtı için): ₺X.XM hero fiyat kartında
  const priceMatch = txt.match(/₺[\d.,]+M/);
  const mainPrice = priceMatch ? priceMatch[0] : null;

  // TR sızıntısı (non-TR'de TR badge/weekly görünmemeli)
  const trLeak = locale !== "tr"
    ? ["Sadece ilan", "Teklif al", "Her Çarşamba", "işlem ₺"].filter((s) => html.includes(s))
    : [];

  out[locale] = {
    locale, http: r?.status() ?? 0,
    html_dir: await page.evaluate(() => document.documentElement.dir),
    marketingBadge,
    weeklySlot: html.includes(e.weeklySlot),
    weeklyPolicy: html.includes(e.weeklyPolicy),
    fxNote: e.fxNote ? html.includes(e.fxNote) : "n/a (TRY → FxRef null)",
    mainPrice, tr_leak: trLeak,
    errs: errs.slice(0, 6),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) await testLang(l);
await browser.close();
console.log(JSON.stringify(out, null, 2));
// Çekirdek kanıt: tüm dillerde mainPrice AYNI olmalı (fees.ts/FX ₺ calc dokunulmadı)
const prices = Object.values(out).map((o) => o.mainPrice);
const allSame = prices.every((p) => p === prices[0]);
console.log("\n=== ÇEKİRDEK HESAP: ana ₺ fiyat 4 dilde " + (allSame ? "AYNI ✅ (" + prices[0] + ")" : "FARKLI ❌ " + JSON.stringify(prices)) + " ===");
