// ADIM 15 — FAZ 1-E mega menü + footer çeviri testi
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const browser = await chromium.launch();
const out = {};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 } });
  await ctx.addInitScript((l) => {
    try { localStorage.setItem("ihaleal_locale", l); } catch {}
  }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  const r = await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);

  // Mega menü aç
  let mega_html = "";
  try {
    const trigger = page.locator('[data-testid="nav-services-trigger"]').first();
    if (await trigger.count()) {
      await trigger.click();
      await page.waitForTimeout(400);
      mega_html = await page.content();
    }
  } catch (e) { errs.push(`mega: ${String(e)}`); }

  // Footer scroll
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  const footer_html = await page.content();

  await page.screenshot({ path: `_audit/dil-faz1e/page-${locale}.png`, fullPage: false });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.screenshot({ path: `_audit/dil-faz1e/footer-${locale}.png`, fullPage: false });

  const expected = {
    tr: { investor: "Yatırımcı", realtor: "Emlakçı", contractor: "Müteahhit",
          platform: "Platform", legal: "Kurumsal & Hukuki", rights: "Tüm hakları saklıdır" },
    en: { investor: "Investor", realtor: "Realtor", contractor: "Contractor",
          platform: "Platform", legal: "Corporate & Legal", rights: "All rights reserved" },
    ru: { investor: "Инвестор", realtor: "Риелтор", contractor: "Подрядчик",
          platform: "Платформа", legal: "Корпоративное и юридическое", rights: "Все права защищены" },
    ar: { investor: "مستثمر", realtor: "وسيط عقاري", contractor: "مقاول",
          platform: "المنصة", legal: "الشركة والقانوني", rights: "جميع الحقوق محفوظة" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    mega_investor: mega_html.includes(exp.investor),
    mega_realtor: mega_html.includes(exp.realtor),
    mega_contractor: mega_html.includes(exp.contractor),
    footer_platform: footer_html.includes(exp.platform),
    footer_legal: footer_html.includes(exp.legal),
    footer_rights: footer_html.includes(exp.rights),
    brand_ihaleal_ltr: footer_html.includes("ihaleal.com"),
    official_ltr: footer_html.includes("İHALEAL GAYRİMENKUL"),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
