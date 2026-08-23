// ADIM 21 — FAZ 1-N GES + Dashboard çevirisi
// Dashboard giriş gerektiriyor — localStorage'a mock user + flows enjekte
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const browser = await chromium.launch();
const out = {};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1100 } });
  await ctx.addInitScript((l) => {
    try {
      localStorage.setItem("ihaleal_locale", l);
      localStorage.setItem("ihaleal_currency", l === "tr" ? "TRY" : "USD");
      // Dashboard guard: mock user + flows
      localStorage.setItem("ihaleal_user", JSON.stringify({ id: "demo", email: "demo@x.co" }));
      localStorage.setItem("ihaleal_user_flows", JSON.stringify(["auction_seller", "bidder"]));
    } catch {}
  }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  // 1. GES
  const r1 = await page.goto(BASE + "/ges-analiz-arazi", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const ges_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1n/ges-${locale}.png`, fullPage: false });

  // 2. Dashboard
  const r2 = await page.goto(BASE + "/dashboard", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const dash_html = await page.content();
  await page.screenshot({ path: `_audit/dil-faz1n/dashboard-${locale}.png`, fullPage: false });

  const expected = {
    tr: { ges_step1: "Konum ve arazi", ges_continue: "Devam", dash_title: "Hesap paneli", dash_fav: "Favoriler" },
    en: { ges_step1: "Location and land", ges_continue: "Continue", dash_title: "Account panel", dash_fav: "Favorites" },
    ru: { ges_step1: "Местоположение и участок", ges_continue: "Продолжить", dash_title: "Панель аккаунта", dash_fav: "Избранное" },
    ar: { ges_step1: "الموقع والأرض", ges_continue: "متابعة", dash_title: "لوحة الحساب", dash_fav: "المفضلة" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http_ges: r1?.status() ?? 0,
    http_dash: r2?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    ges_step1: ges_html.includes(exp.ges_step1),
    ges_continue: ges_html.includes(exp.ges_continue),
    dash_title: dash_html.includes(exp.dash_title),
    dash_fav: dash_html.includes(exp.dash_fav),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
