/**
 * /ilan/:id Endeks Raporu PDF kanıt scripti.
 *
 * - /ilan/2 (Bebek villa) açar.
 * - "Endeks Raporu" butonuna tıklar.
 * - Download intercept eder → PDF dosya kaydeder + içerik header'ını kontrol eder.
 * - Screenshot: PDF buton görünür + sayfa h1.
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:4173";
const OUT = resolve(__dirname);

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
  serviceWorkers: "block",
});
const page = await ctx.newPage();
await ensureDir(OUT);

for (const route of ["/ilan/2", "/ilan/4"]) {
  console.log(`\n══════ ${route} ══════`);
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const h1 = await page.$eval("h1", (el) => el.textContent?.trim().slice(0, 80) || "");
  console.log(`  h1: "${h1}"`);

  // Endeks Raporu butonunu bul + screenshot
  const btn = await page.locator("button:has-text('Endeks Raporu')").first();
  const btnVisible = await btn.isVisible().catch(() => false);
  console.log(`  Endeks Raporu butonu: ${btnVisible ? "✅ görünür" : "❌ yok"}`);

  if (btnVisible) {
    await btn.scrollIntoViewIfNeeded();
    const ssPath = resolve(OUT, `screenshot-button-${route.replace(/\//g, "_")}.png`);
    await page.screenshot({ path: ssPath, fullPage: false });
    console.log(`  📸 ${ssPath}`);

    // Download bekle + tıkla
    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await btn.click();
    try {
      const dl = await downloadPromise;
      const sugg = dl.suggestedFilename();
      const dlPath = resolve(OUT, `pdf-${route.replace(/\//g, "_")}.pdf`);
      await dl.saveAs(dlPath);
      console.log(`  ✅ İndirilen PDF: ${sugg} (${dlPath})`);
      // Header check (magic bytes %PDF)
      const { readFile } = await import("node:fs/promises");
      const buf = await readFile(dlPath);
      const head = buf.subarray(0, 5).toString("ascii");
      const isPdf = head.startsWith("%PDF-");
      console.log(`  PDF magic: ${head} → ${isPdf ? "✅" : "❌"}`);
      console.log(`  Boyut: ${buf.length} byte`);
    } catch (e) {
      console.log(`  ❌ Download timeout veya hata: ${String(e).slice(0, 200)}`);
    }
  }
}

await ctx.close();
await browser.close();
console.log("\nBitti.");
