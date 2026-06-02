// ADIM 17 — FAZ 1-K kredi + değerleme çevirisi testi
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const browser = await chromium.launch();
const out = {};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  await ctx.addInitScript((l) => {
    try { localStorage.setItem("ihaleal_locale", l); localStorage.setItem("ihaleal_currency", l === "tr" ? "TRY" : "USD"); } catch {}
  }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  // 1. Konut Kredisi Hesaplayıcı
  const r1 = await page.goto(BASE + "/konut-kredisi-hesaplayici?amount=3000000", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const loan_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1k/loan-${locale}.png`, fullPage: false });

  // 2. Değerleme aracı (sayfa)
  const r2 = await page.goto(BASE + "/degerleme", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  const val_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1k/valuation-${locale}.png`, fullPage: false });

  const expected = {
    tr: { loan_title: "Konut Kredisi Hesaplayıcı", loan_amount: "Kredi tutarı", monthly: "Aylık taksit", interest: "Toplam faiz", val_start: "Değerleme başlat" },
    en: { loan_title: "Mortgage Calculator", loan_amount: "Loan amount", monthly: "Monthly installment", interest: "Total interest", val_start: "Start valuation" },
    ru: { loan_title: "Ипотечный калькулятор", loan_amount: "Сумма кредита", monthly: "Ежемесячный платёж", interest: "Общие проценты", val_start: "Начать оценку" },
    ar: { loan_title: "حاسبة القرض العقاري", loan_amount: "مبلغ القرض", monthly: "القسط الشهري", interest: "إجمالي الفوائد", val_start: "بدء التقييم" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http_loan: r1?.status() ?? 0,
    http_val: r2?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    loan_title: loan_html.includes(exp.loan_title),
    loan_amount: loan_html.includes(exp.loan_amount),
    loan_monthly: loan_html.includes(exp.monthly),
    loan_interest: loan_html.includes(exp.interest),
    val_start: val_html.includes(exp.val_start),
    has_try: /₺/.test(loan_html),
    has_usd_ref: locale === "tr" ? "n/a" : /≈\s*\$/.test(loan_html),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
