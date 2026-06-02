// ADIM 19 — FAZ 1-L değerleme form çevirisi
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

  const r = await page.goto(BASE + "/modul/degerleme", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1l/valuation-form-${locale}.png`, fullPage: false });

  const expected = {
    tr: { city: "İl", room: "Oda sayısı", m2: "Brüt m²", heating: "Isıtma", explainable: "Açıklanabilir model", parking: "Otopark" },
    en: { city: "City", room: "Room count", m2: "Gross m²", heating: "Heating", explainable: "Explainable model", parking: "Parking" },
    ru: { city: "Город", room: "Количество комнат", m2: "Площадь брутто", heating: "Отопление", explainable: "Объяснимая модель", parking: "Парковка" },
    ar: { city: "المدينة", room: "عدد الغرف", m2: "المساحة الإجمالية", heating: "التدفئة", explainable: "نموذج قابل للتفسير", parking: "موقف سيارات" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    form_city: html.includes(exp.city),
    form_room: html.includes(exp.room),
    form_m2: html.includes(exp.m2),
    form_heating: html.includes(exp.heating),
    form_explainable: html.includes(exp.explainable),
    form_parking: html.includes(exp.parking),
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
