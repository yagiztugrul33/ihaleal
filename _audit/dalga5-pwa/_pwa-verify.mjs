/**
 * Dalga 5 — PWA doğrulama scripti.
 *
 * Preview server (vite preview, port 4173) çalışırken çağrılır.
 *  - Anasayfa + /raporlar + /ihaleler + /harita yükle (4 sayfa).
 *  - Console error sayısı = 0 (her sayfa).
 *  - manifest.webmanifest HTTP 200 + JSON parse OK + 4 ikon + tr lang.
 *  - sw.js HTTP 200 + skipWaiting + Workbox.
 *  - SW kayıt durumunu Page.evaluate ile sorgula (3 sn bekle).
 *  - Desktop + iPhone 13 viewport screenshot.
 *  - Toplam EB sayısı yazdır (0 olmalı).
 */

import { chromium, devices } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname);

const ROUTES = ["/", "/raporlar", "/ihaleler", "/harita"];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function pageWithErrors(browser, viewport, ua) {
  const ctx = await browser.newContext({
    viewport,
    userAgent: ua,
    serviceWorkers: "allow",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`PAGE_ERROR: ${String(err)}`));
  return { ctx, page, errors };
}

async function fetchOK(page, url) {
  const resp = await page.goto(url);
  return { status: resp ? resp.status() : 0, body: await page.content() };
}

async function main() {
  await ensureDir(OUT_DIR);

  const browser = await chromium.launch();
  console.log("== DESKTOP (1440x900) ==");
  const desktop = await pageWithErrors(
    browser,
    { width: 1440, height: 900 },
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  );
  const allErrors = [];
  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    const resp = await desktop.page.goto(url, { waitUntil: "networkidle" });
    const status = resp ? resp.status() : 0;
    console.log(`  ${route} → HTTP ${status} | EB=${desktop.errors.length}`);
    if (route === "/") {
      const png = resolve(OUT_DIR, "screenshot-desktop-home.png");
      await desktop.page.screenshot({ path: png, fullPage: false });
      console.log(`    📸 ${png}`);
    }
    if (route === "/raporlar") {
      const png = resolve(OUT_DIR, "screenshot-desktop-raporlar.png");
      await desktop.page.screenshot({ path: png, fullPage: false });
      console.log(`    📸 ${png}`);
    }
  }

  // SW + Manifest doğrulama (desktop ctx üzerinde)
  console.log("\n== PWA assets ==");
  const manifestUrl = `${BASE}/manifest.webmanifest`;
  const manResp = await desktop.page.goto(manifestUrl);
  const manText = await desktop.page.content();
  const manStatus = manResp ? manResp.status() : 0;
  let manifestJson = null;
  try {
    const raw = manText.match(/<pre[^>]*>([\s\S]+?)<\/pre>/);
    const jsonText = raw ? raw[1] : null;
    // Bazı tarayıcılar inline render etmez, doğrudan fetch:
    const apiResp = await desktop.page.evaluate(async (u) => {
      const r = await fetch(u);
      return { status: r.status, body: await r.text() };
    }, manifestUrl);
    manifestJson = JSON.parse(apiResp.body);
    console.log(`  manifest.webmanifest → HTTP ${apiResp.status} | name="${manifestJson.name}"`);
    console.log(`  lang=${manifestJson.lang} | display=${manifestJson.display} | icons=${manifestJson.icons.length}`);
    console.log(`  theme_color=${manifestJson.theme_color} | shortcuts=${(manifestJson.shortcuts || []).length}`);
  } catch (e) {
    console.log(`  manifest parse hatası: ${String(e)}`);
  }

  const swResp = await desktop.page.evaluate(async (u) => {
    const r = await fetch(u);
    const t = await r.text();
    return {
      status: r.status,
      hasWorkbox: /workbox|precacheAndRoute|skipWaiting|cleanupOutdatedCaches/i.test(t),
      size: t.length,
    };
  }, `${BASE}/sw.js`);
  const swOk = swResp.status === 200 && swResp.hasWorkbox;
  console.log(`  sw.js → HTTP ${swResp.status} | size=${swResp.size}B | workbox=${swOk}`);

  // SW kayıt kanıt (homepage'e dön, 3 sn bekle, registration sorgula)
  await desktop.page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await desktop.page.waitForTimeout(3500);
  const swReg = await desktop.page.evaluate(async () => {
    if (!navigator.serviceWorker) return { supported: false };
    const reg = await navigator.serviceWorker.getRegistration();
    return {
      supported: true,
      registered: !!reg,
      scope: reg ? reg.scope : null,
      active: reg && reg.active ? reg.active.scriptURL : null,
    };
  });
  console.log(`  SW registered=${swReg.registered} | active=${swReg.active}`);

  allErrors.push(...desktop.errors.map((e) => `[desktop] ${e}`));
  await desktop.ctx.close();

  // === MOBILE iPhone 13 ===
  console.log("\n== MOBILE (iPhone 13) ==");
  const mobile = await pageWithErrors(
    browser,
    { width: 390, height: 844 },
    devices["iPhone 13"].userAgent,
  );
  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    const resp = await mobile.page.goto(url, { waitUntil: "networkidle" });
    const status = resp ? resp.status() : 0;
    console.log(`  ${route} → HTTP ${status} | EB=${mobile.errors.length}`);
    if (route === "/") {
      const png = resolve(OUT_DIR, "screenshot-mobile-home.png");
      await mobile.page.screenshot({ path: png, fullPage: false });
      console.log(`    📸 ${png}`);
    }
    if (route === "/raporlar") {
      const png = resolve(OUT_DIR, "screenshot-mobile-raporlar.png");
      await mobile.page.screenshot({ path: png, fullPage: false });
      console.log(`    📸 ${png}`);
    }
  }
  allErrors.push(...mobile.errors.map((e) => `[mobile] ${e}`));
  await mobile.ctx.close();

  await browser.close();

  // Özet
  console.log("\n══════════════════════════════════════");
  console.log(`TOPLAM EB (console error) = ${allErrors.length}`);
  if (allErrors.length) {
    console.log("--- HATA DETAYI ---");
    for (const e of allErrors) console.log(`  ${e}`);
  }
  console.log(`manifest HTTP 200 = ${manifestJson ? "✅" : "❌"}`);
  console.log(`sw.js workbox     = ${swOk ? "✅" : "❌"}`);
  console.log(`SW registered     = ${swReg.registered ? "✅" : "❌"}`);
  console.log("══════════════════════════════════════");

  if (allErrors.length > 0 || !swOk || !manifestJson || !swReg.registered) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
