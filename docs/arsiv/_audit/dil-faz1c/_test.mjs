// ADIM 13 — FAZ 1-C ilan detay arayüz çevirisi testi
// Arayüz çevrildi, içerik (ilan başlık/açıklama) orijinal kaldı, currency korundu
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/ilan/1`;
const browser = await chromium.launch();
const out = {};

// İlk dilde "ilan başlığı" referansını al (içerik korundu kanıtı için)
let referenceTitle = "";

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
  await page.waitForTimeout(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const html = await page.content();

  // İlan başlığı (h1 ilk büyük başlık) — içerik korundu kanıtı
  let pageTitle = "";
  try {
    pageTitle = (await page.locator('h1').first().textContent() || "").trim().slice(0, 80);
  } catch {}
  if (locale === "tr") referenceTitle = pageTitle;

  // Beklenen ARAYÜZ string'leri (sözlük)
  const expected = {
    tr: { back: "Geri", bid: "Teklif ver", features: "Özellikler", location: "Konum", estimated: "Tahmini değer" },
    en: { back: "Back", bid: "Place bid", features: "Features", location: "Location", estimated: "Estimated value" },
    ru: { back: "Назад", bid: "Сделать ставку", features: "Характеристики", location: "Местоположение", estimated: "Оценочная стоимость" },
    ar: { back: "رجوع", bid: "تقديم عرض", features: "المواصفات", location: "الموقع", estimated: "القيمة التقديرية" },
  };
  const exp = expected[locale];

  await page.screenshot({ path: `_audit/dil-faz1c/ilan-${locale}.png`, fullPage: false });

  out[locale] = {
    locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    ui_back: html.includes(exp.back),
    ui_bid: html.includes(exp.bid),
    ui_features: html.includes(exp.features),
    ui_location: html.includes(exp.location),
    ui_estimated: html.includes(exp.estimated),
    page_title: pageTitle,
    content_preserved: locale === "tr" ? "(reference)" : (pageTitle === referenceTitle),
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
