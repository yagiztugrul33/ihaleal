// ADIM 20 — FAZ 1-H DataAnalysis RU/AR + recharts tamamlama
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/borsa/veri`;
const browser = await chromium.launch();
const out = {};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 } });
  await ctx.addInitScript((l) => {
    try { localStorage.setItem("ihaleal_locale", l); localStorage.setItem("ihaleal_currency", l === "tr" ? "TRY" : "USD"); } catch {}
  }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  const r = await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1h/data-analysis-${locale}.png`, fullPage: false });

  const expected = {
    tr: { title: "Ortalama Fiyat Paneli", banner: "₺ ortalama fiyatları", history: "Ortalama Fiyat Geçmişi", heatmap: "Bölge Isı Haritası", trend: "Segment Trend Analizi", download: "Raporu İndir" },
    en: { title: "Average Price Panel", banner: "₺ average prices", history: "Average Price History", heatmap: "Region Heatmap", trend: "Segment Trend Analysis", download: "Download Report" },
    ru: { title: "панель средних цен", banner: "средние цены", history: "История средних цен", heatmap: "Тепловая карта регионов", trend: "Анализ трендов сегмента", download: "Скачать отчёт" },
    ar: { title: "لوحة متوسط الأسعار", banner: "متوسطات الأسعار", history: "سجل متوسط الأسعار", heatmap: "الخريطة الحرارية للمناطق", trend: "تحليل اتجاهات القطاع", download: "تنزيل التقرير" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    title: html.toLowerCase().includes(exp.title.toLowerCase()),
    banner: html.toLowerCase().includes(exp.banner.toLowerCase()),
    avg_history: html.toLowerCase().includes(exp.history.toLowerCase()),
    heatmap: html.includes(exp.heatmap),
    trend: html.includes(exp.trend),
    download: html.includes(exp.download),
    has_try: /₺/.test(html),
    has_usd_ref: locale === "tr" ? "n/a" : /≈\s*\$/.test(html),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
