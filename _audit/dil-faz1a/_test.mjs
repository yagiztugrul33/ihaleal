// ADIM 11 — FAZ 1-A çekirdek UI çevirisi testi
// 3 alan × 4 dil + regresyon
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const browser = await chromium.launch();
const out = {};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((l) => {
    try { localStorage.setItem("ihaleal_locale", l); localStorage.setItem("ihaleal_onboarding_seen", "1"); } catch {}
  }, locale);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  // 1. Ana sayfa — Navbar + Hero
  const r1 = await page.goto(BASE + "/", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const dir = await page.evaluate(() => document.documentElement.dir);
  const home_html = await page.content();

  // Beklenen string'ler (sözlük)
  const expected = {
    tr: { nav_borsa: "Borsaya Gir", nav_login: "Giriş", hero_borsa: "Borsa terminaline geç" },
    en: { nav_borsa: "Go to Exchange", nav_login: "Log In", hero_borsa: "Go to exchange terminal" },
    ru: { nav_borsa: "Перейти на биржу", nav_login: "Войти", hero_borsa: "Перейти на терминал биржи" },
    ar: { nav_borsa: "الذهاب إلى البورصة", nav_login: "تسجيل الدخول", hero_borsa: "الانتقال إلى محطة البورصة" },
  };
  const exp = expected[locale];

  const home_screenshot = `_audit/dil-faz1a/home-${locale}.png`;
  await page.screenshot({ path: home_screenshot, fullPage: false });

  // 2. Onboarding
  const r2 = await page.goto(BASE + "/onboarding/akis", { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(800);
  const ob_html = await page.content();

  const onboardingExpected = {
    tr: { title: "Hoş geldin", discover: "Keşfet", sell: "Sat / İlan ver", buy: "Al / Teklif ver" },
    en: { title: "Welcome", discover: "Explore", sell: "Sell / List", buy: "Buy / Bid" },
    ru: { title: "Добро пожаловать", discover: "Исследовать", sell: "Продать", buy: "Купить" },
    ar: { title: "مرحباً", discover: "استكشاف", sell: "بيع", buy: "شراء" },
  };
  const obExp = onboardingExpected[locale];

  const ob_screenshot = `_audit/dil-faz1a/onboarding-${locale}.png`;
  await page.screenshot({ path: ob_screenshot, fullPage: false });

  out[locale] = {
    locale,
    http_home: r1?.status() ?? 0,
    http_onboarding: r2?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    nav_borsa_cta: home_html.includes(exp.nav_borsa),
    nav_login: home_html.includes(exp.nav_login),
    hero_borsa: home_html.includes(exp.hero_borsa),
    onboarding_title: ob_html.includes(obExp.title),
    onboarding_discover: ob_html.includes(obExp.discover),
    onboarding_sell: ob_html.includes(obExp.sell),
    onboarding_buy: ob_html.includes(obExp.buy),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
