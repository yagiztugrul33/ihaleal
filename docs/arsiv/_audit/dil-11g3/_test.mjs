// ADIM 11-G-3 — İlan detay TEKLİF MODAL + bid toast — 4 dil
// ORTAM KISITI: isSupabaseConfigured()=false (preview) → useAuth().user=null →
//   teklif butonu kaçınılmaz disabled → modal sandbox'ta açılamaz (gerçek auth gerekir).
// Bu yüzden 2 katmanlı doğrulama:
//  (1) RENDER: görünür bid-akışı chrome'u — buton etiketi (ctaBid) + tooltip (loginRequired) 4 dilde
//  (2) DERLEME: modal/toast string'leri 4 dilde dist bundle'da (binding build ile tip-güvenli)
// + AR dir=rtl + ₺ korundu + 0 pageerror
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/ilan/1`;
const browser = await chromium.launch();
const out = {};

const L = {
  tr: { bidBtn: "Teklif ver", loginReq: "Giriş gerekli" },
  en: { bidBtn: "Place bid", loginReq: "Login required" },
  ru: { bidBtn: "Сделать ставку", loginReq: "Необходимо войти" },
  ar: { bidBtn: "تقديم عرض", loginReq: "يجب تسجيل الدخول" },
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
  page.on("pageerror", (e) => errs.push("PAGEERROR:" + String(e).slice(0, 150)));
  page.on("console", (m) => { if (m.type() === "error") { const t = m.text(); if (!/ERR_NAME_NOT_RESOLVED|Failed to load resource/.test(t)) errs.push(t.slice(0, 150)); } });

  const r = await page.goto(URL, { waitUntil: "networkidle", timeout: 35000 });
  await page.waitForTimeout(2200);
  const e = L[locale];

  // Görünür bid-akışı chrome'u: buton etiketi + tooltip (disabled buton, no-auth)
  const bidChrome = await page.evaluate((exp) => {
    const btns = [...document.querySelectorAll("button")];
    const bid = btns.filter((x) => new RegExp(exp.bidBtn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(x.textContent || ""));
    return {
      count: bid.length,
      labelOk: bid.length > 0,
      tooltipOk: bid.some((x) => (x.getAttribute("title") || "").includes(exp.loginReq)),
      tooltips: bid.map((x) => x.getAttribute("title")).filter(Boolean).slice(0, 2),
    };
  }, e);

  await page.screenshot({ path: `_audit/dil-11g3/ilan-modal-${locale}.png`, fullPage: false });

  out[locale] = {
    locale, http: r?.status() ?? 0,
    html_dir: await page.evaluate(() => document.documentElement.dir),
    bidBtn_count: bidChrome.count,
    bidBtn_label: bidChrome.labelOk,
    bidBtn_tooltip: bidChrome.tooltipOk,
    tooltips: bidChrome.tooltips,
    has_try: /₺/.test(await page.evaluate(() => document.body.innerText)),
    errs: errs.slice(0, 6),
  };
  await ctx.close();
}

for (const l of ["tr", "en", "ru", "ar"]) await testLang(l);
await browser.close();
console.log(JSON.stringify(out, null, 2));
