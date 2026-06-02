// ADIM 11-N-3 — Profile çevirisi
// user yoksa guest görünüm; mock user enjekte ederek tam profili test et
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/profil`;
const browser = await chromium.launch();
const out = {};

async function testLang(locale) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
  await ctx.addInitScript((l) => {
    try {
      localStorage.setItem("ihaleal_locale", l);
      localStorage.setItem("ihaleal_currency", l === "tr" ? "TRY" : "USD");
      // Mock user (profil dolu görünüm)
      localStorage.setItem("ihaleal_user", JSON.stringify({
        id: "demo-user", name: "Demo Kullanici", email: "demo@ihaleal.com",
        phone: "", verified: true, memberSince: "2024", auctionsCreated: 3, auctionsWon: 1,
        authBackend: "local",
      }));
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
  await page.screenshot({ path: `_audit/dil-11n3/profile-${locale}.png`, fullPage: false });

  const expected = {
    tr: { profileInfo: "Profil Bilgileri", security: "Güvenlik", logout: "Çıkış Yap", notify: "Bildirim Tercihleri" },
    en: { profileInfo: "Profile Information", security: "Security", logout: "Log Out", notify: "Notification Preferences" },
    ru: { profileInfo: "Информация профиля", security: "Безопасность", logout: "Выйти", notify: "Настройки уведомлений" },
    ar: { profileInfo: "معلومات الملف الشخصي", security: "الأمان", logout: "تسجيل الخروج", notify: "تفضيلات الإشعارات" },
  };
  const exp = expected[locale];

  out[locale] = {
    locale,
    http: r?.status() ?? 0,
    html_lang: lang,
    html_dir: dir,
    profile_info: html.includes(exp.profileInfo),
    security: html.includes(exp.security),
    logout: html.includes(exp.logout),
    notify: html.includes(exp.notify),
    email_ltr_preserved: html.includes("demo@ihaleal.com"),
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) {
  await testLang(l);
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
