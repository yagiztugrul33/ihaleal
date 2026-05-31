/**
 * PDF → PNG render (pdfjs-dist CDN + Playwright Chromium).
 *
 * dist/_pdf-viewer.html'i Playwright ile aç + her sayfa canvas'ını PNG'ye al.
 * pdf-to-png-converter trailing-slash bug'sına karşı bağımsız yol.
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = "http://localhost:4173";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 1700 },
  serviceWorkers: "block",
});
const page = await ctx.newPage();

const TARGETS = [
  { pdf: "pdf-_ilan_2.pdf", prefix: "sayfa-villa" },
  { pdf: "pdf-_ilan_4.pdf", prefix: "sayfa-rezidans" },
];

for (const t of TARGETS) {
  console.log(`\n══════ ${t.pdf} ══════`);
  await page.goto(`${BASE}/_pdf-viewer.html?pdf=${encodeURIComponent(t.pdf)}&scale=1.8`, {
    waitUntil: "domcontentloaded",
  });
  // Bekle: __renderDone__ = true
  await page.waitForFunction(() => window.__renderDone__ === true, null, { timeout: 60000 });
  const pageCount = await page.$$eval("canvas.page", (els) => els.length);
  console.log(`  Sayfa sayısı: ${pageCount}`);

  for (let i = 1; i <= pageCount; i++) {
    const png = resolve(OUT, `${t.prefix}-${i}.png`);
    await page.locator(`#page-${i}`).screenshot({ path: png });
    console.log(`  📸 ${png}`);
  }
}

await ctx.close();
await browser.close();
console.log("\nBitti.");
