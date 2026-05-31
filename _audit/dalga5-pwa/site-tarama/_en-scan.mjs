/**
 * EN locale taraması — Dalga 6 i18n boşluk testi.
 *
 * localStorage.setItem("ihaleal_locale", "en") yapıp tüm rotaları
 * dolaşır. Her sayfa için:
 *   - HTTP + EB + PE
 *   - <html lang> attribute
 *   - body text içinde TR-only ipucu kelimeleri (giriş, ihale, açık, kapat, vs.)
 *     yüksek oranda varsa → potansiyel hardcoded TR.
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname);

// TR-only ipucu kelimeleri — EN sayfada görmesek beklenir.
const TR_HINTS = [
  /\bve\s|\bveya\s|\bbir\s|\bbu\s|\bdaha\s/i,
  /Giriş Yap|Kayıt Ol|İhale|Şeffaf|Güvenli|Lüks|Detay|Çıkış|Ekle|Kaldır/i,
  /Türkçe|İhaleler|Borsa|Harita|Değerleme|Raporlar/i,
];

const ROUTES = [
  "/",
  "/auctions",
  "/ihaleler",
  "/borsa",
  "/raporlar",
  "/harita",
  "/degerleme",
  "/how-it-works",
  "/about",
  "/destek",
  "/giris",
  "/kayit",
  "/profil",
  "/aramalarim",
  "/iletisim",
  "/sss",
];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function main() {
  await ensureDir(OUT);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 Chrome/120",
    locale: "en-US",
  });
  const page = await ctx.newPage();

  // Locale'i ön-set et — localStorage anasayfada okunuyor.
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.setItem("ihaleal_locale", "en"));
  await page.reload({ waitUntil: "networkidle" });

  const rows = [];
  for (const route of ROUTES) {
    const errors = [];
    const pageErrors = [];
    const onConsole = (m) => m.type() === "error" && errors.push(m.text());
    const onPageError = (e) => pageErrors.push(String(e?.stack || e));
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    let status = 0;
    let htmlLang = "";
    let trHits = 0;
    let bodyLen = 0;
    let h1 = "";
    try {
      const resp = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      status = resp ? resp.status() : 0;
      await page.waitForTimeout(800);
      htmlLang = await page.evaluate(() => document.documentElement.lang);
      const body = await page.evaluate(() => document.body.innerText.slice(0, 3000));
      bodyLen = body.length;
      h1 = await page.$eval("h1", (el) => (el.textContent ?? "").trim().slice(0, 80)).catch(() => "");
      trHits = TR_HINTS.reduce((acc, rx) => acc + (rx.test(body) ? 1 : 0), 0);
    } catch (e) {
      errors.push(`NAV: ${String(e).slice(0, 200)}`);
    }
    page.off("console", onConsole);
    page.off("pageerror", onPageError);

    rows.push({ route, status, htmlLang, trHits, bodyLen, h1, errors, pageErrors });
    const fail = pageErrors.length || errors.length || status !== 200;
    const mark = fail ? "❌" : trHits >= 2 ? "⚠️" : "✅";
    console.log(
      `  ${mark} ${route.padEnd(28)} HTTP=${status} lang=${htmlLang} trHints=${trHits} EB=${errors.length} h1="${h1.slice(0, 30)}"`,
    );
  }

  await ctx.close();
  await browser.close();

  const trWarn = rows.filter((r) => r.trHits >= 2);
  const fails = rows.filter((r) => r.pageErrors.length || r.errors.length || r.status !== 200);
  console.log("\n══════════════════════════════════");
  console.log(`Toplam rota   : ${ROUTES.length}`);
  console.log(`Hatalı (EB/PE): ${fails.length}`);
  console.log(`TR sızıntısı  : ${trWarn.length} (trHints>=2)`);
  console.log("══════════════════════════════════");
  if (trWarn.length) {
    console.log("Potansiyel hardcoded TR:");
    for (const w of trWarn) console.log(`  ${w.route} (${w.trHits} hits, h1="${w.h1.slice(0, 40)}")`);
  }
  await writeFile(resolve(OUT, "_en-scan-result.json"), JSON.stringify(rows, null, 2), "utf8");
  process.exit(fails.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
