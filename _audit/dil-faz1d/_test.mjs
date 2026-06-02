// ADIM 14 — FAZ 1-D borsa arayüz çevirisi testi
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

  // 1. Borsa
  const r1 = await page.goto(BASE + "/borsa", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const borsa_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1d/borsa-${locale}.png`, fullPage: false });

  // 2. Portfolio
  const r2 = await page.goto(BASE + "/borsa/portfoy", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  const port_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1d/portfoy-${locale}.png`, fullPage: false });

  // 3. Watchlist
  const r3 = await page.goto(BASE + "/borsa/izleme", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  const watch_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1d/izleme-${locale}.png`, fullPage: false });

  const expected = {
    tr: { ticker: "Piyasa Ticker", port_title: "Portföy Terminali", port_total_p: "Toplam Alış", port_curr: "Güncel Değer", watch_title: "İzleme Listesi" },
    en: { ticker: "Market Ticker", port_title: "Portfolio Terminal", port_total_p: "Total Purchase", port_curr: "Current Value", watch_title: "Watchlist" },
    ru: { ticker: "Лента рынка", port_title: "Терминал портфеля", port_total_p: "Сумма покупки", port_curr: "Текущая стоимость", watch_title: "Список отслеживания" },
    ar: { ticker: "شريط السوق", port_title: "محطة المحفظة", port_total_p: "إجمالي الشراء", port_curr: "القيمة الحالية", watch_title: "قائمة المتابعة" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http_borsa: r1?.status() ?? 0,
    http_portfolio: r2?.status() ?? 0,
    http_watchlist: r3?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    borsa_ticker: borsa_html.includes(exp.ticker),
    portfolio_title: port_html.includes(exp.port_title),
    portfolio_total_purchase: port_html.includes(exp.port_total_p),
    portfolio_current_value: port_html.includes(exp.port_curr),
    watchlist_title: watch_html.includes(exp.watch_title),
    has_try: /₺/.test(borsa_html) || /₺/.test(port_html),
    has_usd_ref: locale === "tr" ? "n/a" : /≈\s*\$/.test(borsa_html) || /≈\s*\$/.test(port_html),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
