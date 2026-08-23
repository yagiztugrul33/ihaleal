// ADIM 11-Q — SERVICE_FEE_LABELS i18n (HizmetBedelleri tam sayfa) — 4 dil
// Anchor: pageTitle + labels.expertise + purchase + modelSummaryTitle + dynamicBidEntry(%5)
// + ÇEKİRDEK HESAP: ₺ hizmet bedeli 4 dilde AYNI (SERVICE_FEES dokunulmadı) + AR rtl + 0 pageerror
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/hizmet-bedelleri`;
const browser = await chromium.launch();
const out = {};

const L = {
  tr: { title: "Hizmet bedelleri", expertise: "Ekspertiz Raporu", buy: "Satın al", summary: "Hizmet modeli özeti", desc: "Ekspertiz raporu üretim" },
  en: { title: "Service fees", expertise: "Appraisal Report", buy: "Buy", summary: "Service model summary", desc: "Appraisal report preparation" },
  ru: { title: "Стоимость услуг", expertise: "Отчёт об оценке", buy: "Купить", summary: "Сводка модели услуг", desc: "Подготовка отчёта об оценке" },
  ar: { title: "رسوم الخدمات", expertise: "تقرير التقييم", buy: "اشترِ", summary: "ملخّص نموذج الخدمة", desc: "تحضير تقرير التقييم" },
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
  await page.waitForTimeout(1800);
  const e = L[locale];
  const html = await page.content();
  const txt = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `_audit/dil-11q/hizmet-bedelleri-${locale}.png`, fullPage: false });

  // ÇEKİRDEK kanıt: ₺45.000 (legal) ve ₺40.000 (expertise) hizmet bedeli — fees.ts SERVICE_FEES
  const fee45 = html.includes("₺45.000") || html.includes("₺45,000");
  const fee40 = html.includes("₺40.000") || html.includes("₺40,000");
  const dynamicPct = /%?5%?/.test(txt) && (html.includes("%5") || /5%/.test(txt)); // dinamik %5 bloke

  const trLeak = locale !== "tr"
    ? ["Hizmet bedelleri", "Satın al", "Hizmet modeli özeti"].filter((s) => html.includes(s))
    : [];

  out[locale] = {
    locale, http: r?.status() ?? 0,
    html_dir: await page.evaluate(() => document.documentElement.dir),
    title: html.includes(e.title),
    expertise: html.includes(e.expertise),
    buy: html.includes(e.buy),
    summary: html.includes(e.summary),
    desc: html.includes(e.desc),
    fee_45000: fee45, fee_40000: fee40, dynamic_pct5: dynamicPct,
    tr_leak: trLeak, errs: errs.slice(0, 6),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) await testLang(l);
await browser.close();
console.log(JSON.stringify(out, null, 2));
// ÇEKİRDEK: ₺ bedeller 4 dilde aynı (fees.ts SERVICE_FEES dokunulmadı)
const f45 = Object.values(out).every((o) => o.fee_45000);
const f40 = Object.values(out).every((o) => o.fee_40000);
console.log("\n=== ÇEKİRDEK HESAP: ₺45.000 + ₺40.000 hizmet bedeli 4 dilde " + (f45 && f40 ? "AYNI ✅ (SERVICE_FEES dokunulmadı)" : "FARKLI ❌") + " ===");
