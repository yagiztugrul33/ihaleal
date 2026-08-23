/**
 * ANAYASA TAM SİTE 500 / EB / hata taraması.
 *
 * Tüm önemli rotaları desktop + iPhone 13 viewport'unda dolaşır,
 * her sayfa için:
 *  - HTTP status
 *  - console.error sayısı (EB)
 *  - pageerror (uncaught exception) stack
 *  - h1 görünür mü
 *  - body innerText boş mu
 * sonucu yazdırır + stack trace'leri özetler.
 *
 * /ilan/prop-XXX + /ilan/1..12 + bilinçli olmayan id + UUID dahil edilir.
 */

import { chromium, devices } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname);

const ROUTES = [
  "/",
  "/arama",
  "/ihaleler",
  "/borsa",
  "/borsa/sehir/istanbul",
  "/borsa/sehir/izmir",
  "/borsa/sehir/ankara",
  "/borsa/varliklar",
  "/borsa/izleme",
  "/borsa/veri",
  "/borsa/portfoy",
  "/raporlar",
  "/harita",
  "/degerleme",
  "/ihale-ac",
  "/panel",
  "/profil",
  "/aramalarim",
  "/iletisim",
  "/giris",
  "/kayit",
  "/favoriler",
  "/bildirimler",
  "/nasil-calisir",
  "/hakkimizda",
  "/kunye",
  "/destek",
  "/sss",
  // /ilan varyantları — demo ID kapsamı:
  "/ilan/1",
  "/ilan/2",
  "/ilan/3",
  "/ilan/4",
  "/ilan/5",
  "/ilan/6",
  "/ilan/7",
  "/ilan/8",
  "/ilan/9",
  "/ilan/10",
  "/ilan/11",
  "/ilan/12",
  "/ilan/prop-001",
  "/ilan/prop-005",
  "/ilan/prop-010",   // ← Master'ın bildirdiği 500
  "/ilan/prop-030",
  "/ilan/prop-060",
  "/ilan/prop-999",   // olmayan
  "/ilan/00000000-0000-0000-0000-000000000000",  // UUID format
  "/ilan/saçma-id",   // tamamen geçersiz
  // SEO landing örnekleri:
  "/satilik/istanbul",
  "/kiralik/istanbul",
  // Modüller (tek örnek):
  "/modul/bina-risk-sorgu",
  "/modul/deprem-risk-haritasi",
];

async function scan(browser, label, viewport, ua) {
  console.log(`\n══════ ${label} (${viewport.width}x${viewport.height}) ══════`);
  const ctx = await browser.newContext({ viewport, userAgent: ua, serviceWorkers: "allow" });
  const page = await ctx.newPage();
  const allRows = [];
  for (const route of ROUTES) {
    const errors = [];
    const pageErrors = [];
    const consoleErrors = [];
    const onConsole = (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    };
    const onPageError = (err) => {
      pageErrors.push(String(err?.stack || err));
    };
    page.on("console", onConsole);
    page.on("pageerror", onPageError);
    let status = 0;
    let h1 = "";
    let bodyLen = 0;
    let errorBoundaryShown = false;
    try {
      const resp = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      status = resp ? resp.status() : 0;
      // SPA → wait for content
      await page.waitForTimeout(800);
      try {
        h1 = await page.$eval("h1", (el) => el.textContent?.trim().slice(0, 80) || "").catch(() => "");
      } catch {}
      try {
        bodyLen = await page.evaluate(() => document.body.innerText.length);
      } catch {}
      // ErrorBoundary signature
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 200));
      errorBoundaryShown = /Bir sorun oluştu|Bir hata oluştu|Something went wrong/i.test(bodyText);
    } catch (e) {
      errors.push(`NAV: ${String(e).slice(0, 200)}`);
    }
    page.off("console", onConsole);
    page.off("pageerror", onPageError);

    const row = {
      route,
      status,
      h1,
      bodyLen,
      eb: errorBoundaryShown,
      consoleErrors,
      pageErrors,
      navErrors: errors,
    };
    allRows.push(row);
    const fail = errorBoundaryShown || pageErrors.length > 0 || consoleErrors.length > 0 || errors.length > 0;
    const mark = fail ? "❌" : status === 200 ? "✅" : "⚠️";
    console.log(
      `  ${mark} ${route.padEnd(48)} HTTP=${status} | EB=${consoleErrors.length} | PE=${pageErrors.length} | EBox=${errorBoundaryShown ? "Y" : "N"} | h1="${h1.slice(0, 30)}"`,
    );
    if (pageErrors.length) {
      console.log(`     PAGE_ERROR: ${pageErrors[0].split("\n").slice(0, 3).join(" | ").slice(0, 300)}`);
    }
    if (consoleErrors.length) {
      console.log(`     CONSOLE: ${consoleErrors[0].slice(0, 200)}`);
    }
  }
  await ctx.close();
  return allRows;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const desktop = await scan(
    browser,
    "DESKTOP",
    { width: 1440, height: 900 },
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  );
  const mobile = await scan(
    browser,
    "iPhone 13",
    { width: 390, height: 844 },
    devices["iPhone 13"].userAgent,
  );
  await browser.close();

  // Özet
  const fails = [];
  for (const row of [...desktop.map((r) => ({ ...r, vp: "desktop" })), ...mobile.map((r) => ({ ...r, vp: "mobile" }))]) {
    if (row.eb || row.pageErrors.length || row.consoleErrors.length || row.navErrors.length || row.status >= 500) {
      fails.push(row);
    }
  }
  console.log("\n══════════════════════════════════");
  console.log(`TOPLAM ROTA: ${ROUTES.length} × 2 = ${ROUTES.length * 2}`);
  console.log(`HATALI    : ${fails.length}`);
  console.log("══════════════════════════════════");
  for (const f of fails) {
    console.log(`  [${f.vp}] ${f.route}`);
    if (f.pageErrors.length) console.log(`    PE: ${f.pageErrors[0].slice(0, 240)}`);
    if (f.consoleErrors.length) console.log(`    CE: ${f.consoleErrors[0].slice(0, 240)}`);
    if (f.eb) console.log(`    EB: ErrorBoundary tetiklendi`);
  }

  // JSON dump
  const dump = { desktop, mobile, fails };
  await writeFile(resolve(OUT, "_scan-result.json"), JSON.stringify(dump, null, 2), "utf8");
  console.log(`\nJSON: ${resolve(OUT, "_scan-result.json")}`);

  if (fails.length > 0) process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
