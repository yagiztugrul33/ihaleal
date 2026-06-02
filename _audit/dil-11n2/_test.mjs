// ADIM 11-N-2 — InvestorDashboard çevirisi
// Boş portföy state'i empty title gösterir; favori yoksa empty, varsa KPI.
// Test empty + header (favori yoksa) — header her durumda görünür.
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/dashboard/yatirimci`;
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

  const r = await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1800);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const html = await page.content();
  await page.screenshot({ path: `_audit/dil-11n2/investor-${locale}.png`, fullPage: false });

  const expected = {
    tr: { title: "Yatırımcı paneli", back: "Panele dön", market: "Piyasa analizi", emptyOrKpi: ["Portföyünüz boş", "Portföy değeri"] },
    en: { title: "Investor panel", back: "Back to panel", market: "Market analysis", emptyOrKpi: ["Your portfolio is empty", "Portfolio value"] },
    ru: { title: "Панель инвестора", back: "Назад к панели", market: "Анализ рынка", emptyOrKpi: ["Ваш портфель пуст", "Стоимость портфеля"] },
    ar: { title: "لوحة المستثمر", back: "العودة إلى اللوحة", market: "تحليل السوق", emptyOrKpi: ["محفظتك فارغة", "قيمة المحفظة"] },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    title: html.includes(exp.title),
    back: html.includes(exp.back),
    market: html.includes(exp.market),
    empty_or_kpi: exp.emptyOrKpi.some((s) => html.includes(s)),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
