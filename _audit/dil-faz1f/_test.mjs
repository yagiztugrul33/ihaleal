// ADIM 16 — FAZ 1-F tier data sabitleri çevirisi + AR künye LTR
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

  const r = await page.goto(BASE + "/fiyatlandirma", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1f/pricing-${locale}.png`, fullPage: false });

  // AR künye dir kontrol
  let address_dir = "";
  try {
    address_dir = await page.locator('address').first().getAttribute("dir") ?? "";
  } catch {}

  const expected = {
    tr: { tier_individual: "Bireysel", tier_investor: "Yatırımcı", tier_pro: "Emlak Pro", tier_corp: "Kurumsal" },
    en: { tier_individual: "Individual", tier_investor: "Investor", tier_pro: "Realtor Pro", tier_corp: "Enterprise" },
    ru: { tier_individual: "Частный", tier_investor: "Инвестор", tier_pro: "Профи риелтор", tier_corp: "Корпоративный" },
    ar: { tier_individual: "فردي", tier_investor: "مستثمر", tier_pro: "وسيط احترافي", tier_corp: "للشركات" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    tier_individual: html.includes(exp.tier_individual),
    tier_investor: html.includes(exp.tier_investor),
    tier_pro: html.includes(exp.tier_pro),
    tier_corp: html.includes(exp.tier_corp),
    address_dir,
    consistent_investor_vs_segment: html.includes(exp.tier_investor), // segment & tier aynı "Инвестор"/"مستثمر"
    has_try: /₺/.test(html),
    has_usd_ref: locale === "tr" ? "n/a" : /≈\s*\$/.test(html),
    official_name_ltr: html.includes("İHALEAL GAYRİMENKUL"),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
