// ADIM 10 — Dil FAZ 0 regresyon testi
// 4 dil → dropdown görünür, dir/lang doğru, regresyon yok
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const browser = await chromium.launch();
const out = {};

async function test(name, locale, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
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

  // Navbar dil dropdown'u açıp 4 dil görünür mü
  let langDropdownHas = { en: false, tr: false, ru: false, ar: false };
  try {
    const trigger = page.locator('[data-testid="nav-lang-trigger"]').first();
    if (await trigger.count()) {
      await trigger.click();
      await page.waitForTimeout(400);
      const html = await page.content();
      langDropdownHas = {
        en: /English|Английский|الإنجليزية/.test(html),
        tr: /Türkçe|Турецкий|التركية/.test(html),
        ru: /Русский|Russian|Rusça|الروسية/.test(html),
        ar: /Arabic|Arapça|العربية|Арабский/.test(html),
      };
    }
  } catch (e) { errs.push(`dropdown: ${String(e)}`); }

  // RU/AR'da kanıt çevirisi görünüyor mu
  let proof_translation = false;
  if (locale === "ru") {
    proof_translation = /Войти|Регистрация|Аукционы/i.test(await page.content());
  } else if (locale === "ar") {
    proof_translation = /تسجيل الدخول|إنشاء حساب|المزادات/i.test(await page.content());
  }

  // Body'de Arapça font (AR seçili) renders
  let font_family = "";
  try {
    font_family = await page.evaluate(() => window.getComputedStyle(document.body).fontFamily);
  } catch {}

  await page.screenshot({ path: `_audit/dil-faz0/${name}.png`, fullPage: false });

  out[name] = {
    locale_local_storage: locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    dropdown_has_4_diller: langDropdownHas,
    rtl_set: dir === "rtl",
    proof_translation,
    font_family: font_family.slice(0, 80),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

await test("tr", "tr");
await test("en", "en");
await test("ru", "ru");
await test("ar", "ar");

await browser.close();
console.log(JSON.stringify(out, null, 2));
