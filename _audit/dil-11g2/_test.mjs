// ADIM 11-G-2 — İlan detay KALAN İÇERİK (tab + panel) — 4 dil
// Anchor: ovProfRules (overview default) + expPanelTitle + aiSuggestTitle (sidebar)
//         + detHeating (Details tab CLICK) + aiRegionStatsTitle (AI tab CLICK)
// + currency korundu (₺ + ≈$) + AR dir=rtl + 0 console hata
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/ilan/1`;
const browser = await chromium.launch();
const out = {};

const L = {
  tr: { profRules: "Profesyonel kurallar (özet)", expPanel: "Ekspertiz Raporu", aiSuggest: "AI Teklif Önerisi", tabDetails: "Detaylar", detHeating: "Isıtma", tabAi: "AI Analiz", regionStats: "Bölge İstatistikleri" },
  en: { profRules: "Professional rules (summary)", expPanel: "Appraisal Report", aiSuggest: "AI Bid Suggestion", tabDetails: "Details", detHeating: "Heating", tabAi: "AI Analysis", regionStats: "Area Statistics" },
  ru: { profRules: "Профессиональные правила (кратко)", expPanel: "Отчёт об оценке", aiSuggest: "ИИ-совет по ставке", tabDetails: "Детали", detHeating: "Отопление", tabAi: "ИИ-анализ", regionStats: "Статистика района" },
  ar: { profRules: "القواعد المهنية (ملخّص)", expPanel: "تقرير التقييم", aiSuggest: "اقتراح العرض بالذكاء الاصطناعي", tabDetails: "التفاصيل", detHeating: "التدفئة", tabAi: "تحليل الذكاء الاصطناعي", regionStats: "إحصاءات المنطقة" },
};

async function clickTab(page, label) {
  try {
    const btn = page.locator("button").filter({ hasText: label }).first();
    await btn.click({ timeout: 6000 });
    await page.waitForTimeout(700);
    return true;
  } catch { return false; }
}

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 1500 } });
  await ctx.addInitScript((l) => {
    try {
      localStorage.setItem("ihaleal_locale", l);
      localStorage.setItem("ihaleal_currency", l === "tr" ? "TRY" : "USD");
    } catch {}
  }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });

  const r = await page.goto(URL, { waitUntil: "networkidle", timeout: 35000 });
  await page.waitForTimeout(2200);
  const e = L[locale];

  // 1) overview (default) + sidebar paneller
  const htmlBase = await page.content();
  const overview_profRules = htmlBase.includes(e.profRules);
  const sidebar_expPanel = htmlBase.includes(e.expPanel);
  const sidebar_aiSuggest = htmlBase.includes(e.aiSuggest);
  const has_try = /₺/.test(await page.evaluate(() => document.body.innerText));
  const has_usd_ref = locale === "tr" ? "n/a" : /≈\s*\$/.test(await page.evaluate(() => document.body.innerText));
  await page.screenshot({ path: `_audit/dil-11g2/ilan-detay-${locale}.png`, fullPage: false });

  // 2) Details tab → detHeating
  const detailsClicked = await clickTab(page, e.tabDetails);
  const detail_heating = (await page.content()).includes(e.detHeating);

  // 3) AI tab → regionStats
  const aiClicked = await clickTab(page, e.tabAi);
  await page.waitForTimeout(800);
  const ai_regionStats = (await page.content()).includes(e.regionStats);

  // TR sızıntısı (non-TR'de TR başlık görünmemeli)
  const finalHtml = await page.content();
  const trLeak = locale !== "tr"
    ? ["Ekspertiz Raporu", "AI Teklif Önerisi", "Bölge İstatistikleri"].filter((s) => finalHtml.includes(s))
    : [];

  out[locale] = {
    locale, http: r?.status() ?? 0,
    html_dir: await page.evaluate(() => document.documentElement.dir),
    overview_profRules, sidebar_expPanel, sidebar_aiSuggest,
    detailsClicked, detail_heating, aiClicked, ai_regionStats,
    has_try, has_usd_ref, tr_leak: trLeak,
    errs: errs.slice(0, 6),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) await testLang(l);
await browser.close();
console.log(JSON.stringify(out, null, 2));
