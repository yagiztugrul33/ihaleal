// ADIM 18 — FAZ 1-M Mortgage simülatör çevirisi
// Tutarlılık testi: ADIM 17 "Aylık taksit" = ADIM 18 "Aylık taksit" AYNI
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
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

  // Mortgage
  const r1 = await page.goto(BASE + "/mortgage", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const mort_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1m/mortgage-${locale}.png`, fullPage: false });

  // Konut Kredisi (tutarlılık - aynı "Aylık taksit" var mı)
  const r2 = await page.goto(BASE + "/konut-kredisi-hesaplayici", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(800);
  const kkh_html = await page.content();

  const expected = {
    tr: { mort_title: "Mortgage / Kredi Hesaplayıcı", params: "Kredi Parametreleri", banka: "Banka Gereksinimleri", summary: "Kredi Özeti", monthly: "Aylık taksit", tip_low: "Düşük Faiz İpuçları" },
    en: { mort_title: "Mortgage / Loan Calculator", params: "Loan Parameters", banka: "Bank Requirements", summary: "Loan Summary", monthly: "Monthly installment", tip_low: "Low Interest Tips" },
    ru: { mort_title: "Ипотека / Кредитный калькулятор", params: "Параметры кредита", banka: "Требования банка", summary: "Сводка по кредиту", monthly: "Ежемесячный платёж", tip_low: "Советы по снижению процентов" },
    ar: { mort_title: "قرض عقاري / حاسبة القرض", params: "معاملات القرض", banka: "متطلبات البنك", summary: "ملخص القرض", monthly: "القسط الشهري", tip_low: "نصائح لخفض الفوائد" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http_mortgage: r1?.status() ?? 0,
    http_kkh: r2?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    mort_title: mort_html.includes(exp.mort_title),
    mort_params: mort_html.includes(exp.params),
    mort_banka: mort_html.includes(exp.banka),
    mort_summary: mort_html.includes(exp.summary),
    mort_monthly: mort_html.includes(exp.monthly),
    mort_tip_low: mort_html.includes(exp.tip_low),
    // Tutarlılık: KonutKredisi sayfasında da AYNI "Aylık taksit" çevirisi
    kkh_monthly_consistent: kkh_html.includes(exp.monthly),
    has_try: /TRY/.test(mort_html),
    has_usd_ref: locale === "tr" ? "n/a" : /≈\s*\$/.test(mort_html),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
