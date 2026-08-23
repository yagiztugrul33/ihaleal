// ADIM 11-G — İlan detay (AuctionDetail) ana görünüm çevirisi — 4 dil
// Anchor: tabOverview, commissionTitle, securityTitle, aiRecoTitle, priceCardInvestmentScore
// + currency korundu (₺ + ≈$) + countdown (info) + AR dir=rtl + 0 console hata
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/ilan/1`;
const browser = await chromium.launch();
const out = {};

const expected = {
  tr: { overview: "Genel Bakış", commission: "Komisyon Hesaplayıcı", security: "Güvenlik Doğrulaması", aiReco: "AI Alım Tavsiyesi", invScore: "Yatırım Skoru" },
  en: { overview: "Overview", commission: "Commission Calculator", security: "Security Verification", aiReco: "AI Buy Recommendation", invScore: "Investment Score" },
  ru: { overview: "Обзор", commission: "Калькулятор комиссии", security: "Проверка безопасности", aiReco: "Рекомендация ИИ по покупке", invScore: "Инвест-балл" },
  ar: { overview: "نظرة عامة", commission: "حاسبة العمولة", security: "التحقق الأمني", aiReco: "توصية الذكاء الاصطناعي بالشراء", invScore: "درجة الاستثمار" },
};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 1400 } });
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
  await page.waitForTimeout(2500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const html = await page.content();
  const txt = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: `_audit/dil-11g/ilan-${locale}.png`, fullPage: false });

  const exp = expected[locale];
  // TR-orijinal sızıntısı (non-TR dillerde TR başlık görünmemeli)
  const trLeak = locale !== "tr"
    ? ["Komisyon Hesaplayıcı", "Güvenlik Doğrulaması", "AI Alım Tavsiyesi"].filter((s) => html.includes(s))
    : [];

  out[locale] = {
    locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    overview: html.includes(exp.overview),
    commission: html.includes(exp.commission),
    security: html.includes(exp.security),
    aiReco: html.includes(exp.aiReco),
    invScore: html.includes(exp.invScore),
    // currency korundu
    has_try: /₺/.test(txt),
    has_usd_ref: locale === "tr" ? "n/a" : /≈\s*\$/.test(txt),
    // countdown (info — sadece canlı ihalede)
    countdown_present: /Bitişe kalan|Time left|До конца|حتى الانتهاء|Gün|Days|Дней|أيام/.test(txt),
    tr_leak: trLeak,
    errs: errs.slice(0, 6),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
