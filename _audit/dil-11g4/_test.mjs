// ADIM 11-G-4 — İlan detay buy-now + bilgi dialogları — 4 dil
// Bilgi dialogları (piyasa raporu + resmi belgeler) AUTH-GATED DEĞİL → sandbox'ta AÇILIR + RENDER doğrulanır.
// Buy-now dialogları auth-gated → bundle-derleme ile (11-G-3 gibi).
// Anchor: mrTitle + mrGotoAnalysis (piyasa) + odTitle + odItem1 + understood (resmi) → 5, RENDER
// + AR dir=rtl + ₺ + 0 pageerror
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/ilan/1`;
const browser = await chromium.launch();
const out = {};

const L = {
  tr: { mrBtn: "piyasa raporu analizi", mrTitle: "Piyasa raporu analizi", mrGoto: "Analiz sayfasına git", odBtn: "Resmi belgeler", odTitle: "Resmi belgeler özeti", odItem: "İmar durumu", understood: "Anladım" },
  en: { mrBtn: "market report analysis", mrTitle: "Market report analysis", mrGoto: "Go to analysis page", odBtn: "Official documents", odTitle: "Official documents summary", odItem: "Zoning status", understood: "Got it" },
  ru: { mrBtn: "анализ рыночного отчёта", mrTitle: "Анализ рыночного отчёта", mrGoto: "Перейти на страницу анализа", odBtn: "Официальные документы", odTitle: "Сводка официальных документов", odItem: "Статус зонирования", understood: "Понятно" },
  ar: { mrBtn: "تحليل تقرير السوق", mrTitle: "تحليل تقرير السوق", mrGoto: "الانتقال إلى صفحة التحليل", odBtn: "المستندات الرسمية", odTitle: "ملخّص المستندات الرسمية", odItem: "حالة التنظيم", understood: "فهمت" },
};

async function clickByText(page, txt) {
  try {
    const b = page.locator("button").filter({ hasText: txt }).first();
    await b.click({ timeout: 6000 });
    await page.waitForTimeout(700);
    return true;
  } catch { return false; }
}

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 1500 } });
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

  // 1) Piyasa raporu dialog
  const mrOpened = await clickByText(page, e.mrBtn);
  const mrHtml = await page.content();
  const mr_title = mrHtml.includes(e.mrTitle);
  const mr_goto = mrHtml.includes(e.mrGoto);
  // kapat
  await clickByText(page, locale === "tr" ? "Kapat" : locale === "en" ? "Close" : locale === "ru" ? "Закрыть" : "إغلاق");

  // 2) Resmi belgeler dialog
  const odOpened = await clickByText(page, e.odBtn);
  const odHtml = await page.content();
  const od_title = odHtml.includes(e.odTitle);
  const od_item = odHtml.includes(e.odItem);
  const od_understood = odHtml.includes(e.understood);
  await page.screenshot({ path: `_audit/dil-11g4/ilan-buynow-${locale}.png`, fullPage: false });

  const trLeak = locale !== "tr"
    ? ["Piyasa raporu analizi", "Resmi belgeler özeti", "İmar durumu"].filter((s) => odHtml.includes(s))
    : [];

  out[locale] = {
    locale, http: r?.status() ?? 0,
    html_dir: await page.evaluate(() => document.documentElement.dir),
    mrOpened, mr_title, mr_goto, odOpened, od_title, od_item, od_understood,
    has_try: /₺/.test(await page.evaluate(() => document.body.innerText)),
    tr_leak: trLeak, errs: errs.slice(0, 6),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) await testLang(l);
await browser.close();
console.log(JSON.stringify(out, null, 2));
