#!/usr/bin/env node
// Kalıcı smoke testi — gece sprintinin regresyon kalkanı.
// Bugünkü Gavel crash gibi global JS hatalarını yakalar.
//
// Kullanım:  BASE=https://www.ihaleal.com npm run smoke
//            BASE=http://localhost:4173 npm run smoke   (lokal preview)
//
// PASS: exit 0  ·  FAIL: exit 1 (hangi rota, ne hata)

import { chromium, devices } from "playwright";

const BASE = process.env.BASE || "https://www.ihaleal.com";
const SAMPLE_LISTING_ID = process.env.SAMPLE_LISTING_ID || "8d9bb650-fbef-44df-b5b2-cd5c92b9c5f4";
const SAMPLE_PROJECT_ID = process.env.SAMPLE_PROJECT_ID || "00000000-0000-0000-0000-000000000000";

const ROUTES = [
  "/",
  "/borsa",
  "/komisyon-hesaplayici",
  "/konut-kredisi-hesaplayici",
  "/hizmet-bedelleri",
  "/modul/deprem-egitimi",
  "/modul/degerleme",
  "/modul/canli-deprem-takip",
  "/modul/ges-analizi",
  `/ilan/${SAMPLE_LISTING_ID}`,
  "/giris",
  "/kayit?profil=muteahhit",
  "/muteahhit/panel",
  `/proje/${SAMPLE_PROJECT_ID}`,
  "/uluslararasi",
  "/kampanyalar",
  "/mesajlar",
  "/kyc",
];

const VIEWPORTS = [
  { name: "desktop", opts: { viewport: { width: 1366, height: 768 } } },
  { name: "iphone13", opts: devices["iPhone 13"] },
];

// Yoksay edilecek desensiz CSP/font hataları (smoke odaklı kalsın)
const IGNORE_PATTERNS = [
  /Content Security Policy/i,
  /fonts\.googleapis/i,
  /Failed to load resource.*401/i, // auth-bound endpoint 401'leri (beklenen)
  /Failed to load resource.*406/i, // Supabase .single() eksik kayıt (sample id boş olabilir)
  /Failed to load resource.*404/i, // 404 — public sayfada ham JSON kayıp; runtime crash değil
];

function shouldIgnore(text) {
  return IGNORE_PATTERNS.some((rx) => rx.test(text));
}

async function checkRoute(browser, route, viewport) {
  const ctx = await browser.newContext(viewport.opts);
  const page = await ctx.newPage();

  const errors = [];
  page.on("pageerror", (e) => {
    const msg = (e.stack || e.message || "").split("\n")[0];
    if (!shouldIgnore(msg)) errors.push(`pageerror: ${msg}`);
  });
  page.on("console", (m) => {
    if (m.type() === "error") {
      const text = m.text();
      if (!shouldIgnore(text)) errors.push(`console.error: ${text.split("\n")[0].slice(0, 220)}`);
    }
  });

  let httpStatus = null;
  const response = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => null);
  if (response) httpStatus = response.status();
  await page.waitForTimeout(1500);

  const errorBoundaryVisible = await page.locator("text=Bir Hata Oluştu").count();
  const fiveHundredText = await page.locator("text=500").count();

  await ctx.close();

  return {
    route,
    viewport: viewport.name,
    httpStatus,
    errorBoundary: errorBoundaryVisible > 0,
    fiveHundredOverlay: fiveHundredText > 0 && errorBoundaryVisible > 0, // 500 yalnız ErrorBoundary'de varsa fail
    errorCount: errors.length,
    errors: errors.slice(0, 5),
  };
}

async function main() {
  console.log(`SMOKE BASE = ${BASE}`);
  console.log(`Routes: ${ROUTES.length}  ·  Viewports: ${VIEWPORTS.length}  ·  Total checks: ${ROUTES.length * VIEWPORTS.length}`);
  console.log("─".repeat(80));

  const browser = await chromium.launch();
  const results = [];

  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      const r = await checkRoute(browser, route, viewport);
      results.push(r);
      const ok = r.httpStatus === 200 && !r.errorBoundary && r.errorCount === 0;
      const tag = ok ? "PASS" : "FAIL";
      console.log(
        `[${tag}] [${r.viewport.padEnd(9)}] HTTP=${r.httpStatus} 500=${r.errorBoundary ? "Y" : "n"} errs=${r.errorCount}  ${r.route}`,
      );
      if (!ok && r.errors.length) {
        for (const e of r.errors) console.log(`    • ${e}`);
      }
    }
  }

  await browser.close();

  const failed = results.filter((r) => r.httpStatus !== 200 || r.errorBoundary || r.errorCount > 0);
  console.log("─".repeat(80));
  if (failed.length === 0) {
    console.log(`SMOKE PASS  (${results.length}/${results.length})`);
    process.exit(0);
  } else {
    console.log(`SMOKE FAIL  (${failed.length}/${results.length} hatalı)`);
    process.exit(1);
  }
}

await main().catch((e) => {
  console.error("smoke runner crashed:", e);
  process.exit(2);
});
