/**
 * CEPHE 1 — /ilan tüm varyantlar EB=0 + /degerleme buton kontrastı kanıtı.
 *
 * /ilan/1..12 + prop-001/005/010/030/060/999 + UUID-zero + saçma-id
 * /degerleme submit button computed style + screenshot
 */

import { chromium, devices } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = "http://localhost:4173";

await mkdir(OUT, { recursive: true });

function parseRGB(s) {
  const m = String(s).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  return m ? [+m[1], +m[2], +m[3]] : null;
}
function relLum([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(fg, bg) {
  const a = relLum(fg);
  const b = relLum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const ILAN = [
  "/ilan/1", "/ilan/2", "/ilan/3", "/ilan/4", "/ilan/5", "/ilan/6",
  "/ilan/7", "/ilan/8", "/ilan/9", "/ilan/10", "/ilan/11", "/ilan/12",
  "/ilan/prop-001", "/ilan/prop-005", "/ilan/prop-010", "/ilan/prop-030",
  "/ilan/prop-060", "/ilan/prop-999",
  "/ilan/00000000-0000-0000-0000-000000000000",
  "/ilan/sacma-id",
];

const browser = await chromium.launch();
const report = { ilan: [], degerleme: null };

// Bir context, iki viewport: desktop + iPhone 13
for (const [vpName, vp, ua] of [
  ["desktop", { width: 1440, height: 900 }, "Mozilla/5.0 Chrome/120"],
  ["mobile", { width: 390, height: 844 }, devices["iPhone 13"].userAgent],
]) {
  console.log(`\n══════ /ilan ${vpName} ══════`);
  const ctx = await browser.newContext({ viewport: vp, userAgent: ua, serviceWorkers: "block" });
  const page = await ctx.newPage();
  for (const route of ILAN) {
    const errs = [];
    const pes = [];
    const c = (m) => m.type() === "error" && errs.push(m.text().slice(0, 200));
    const p = (e) => pes.push(String(e?.stack || e).slice(0, 200));
    page.on("console", c);
    page.on("pageerror", p);
    let status = 0, h1 = "";
    try {
      const r = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 30000 });
      status = r ? r.status() : 0;
      await page.waitForTimeout(500);
      h1 = await page.$eval("h1", (el) => (el.textContent || "").trim().slice(0, 60)).catch(() => "");
    } catch (e) {
      errs.push("NAV: " + String(e).slice(0, 100));
    }
    page.off("console", c);
    page.off("pageerror", p);
    const ok = status === 200 && errs.length === 0 && pes.length === 0;
    report.ilan.push({ vp: vpName, route, status, eb: errs.length, pe: pes.length, h1, ok });
    console.log(`  ${ok ? "✅" : "❌"} ${route.padEnd(50)} HTTP=${status} EB=${errs.length} h1="${h1}"`);
  }
  await ctx.close();
}

// /degerleme buton kontrastı + screenshot
console.log(`\n══════ /degerleme submit buton ══════`);
const ctx2 = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  serviceWorkers: "block",
});
const page2 = await ctx2.newPage();
await page2.goto(`${BASE}/degerleme`, { waitUntil: "networkidle" });
await page2.waitForTimeout(800);
const btnData = await page2.evaluate(() => {
  const btn = Array.from(document.querySelectorAll("button[type='submit']")).find(
    (b) => b.textContent && b.textContent.includes("Ne Kadar Eder"),
  );
  if (!btn) return null;
  const cs = getComputedStyle(btn);
  return { color: cs.color, bg: cs.backgroundColor, bgImage: cs.backgroundImage, opacity: cs.opacity };
});
if (btnData) {
  const fg = parseRGB(btnData.color);
  const bg = parseRGB(btnData.bg);
  const ratio = fg && bg ? contrast(fg, bg) : null;
  report.degerleme = {
    color: btnData.color,
    bg: btnData.bg,
    bgImage: btnData.bgImage,
    opacity: btnData.opacity,
    ratio: ratio ? ratio.toFixed(2) : null,
    wcagAA: ratio ? ratio >= 4.5 : false,
    wcagAAA: ratio ? ratio >= 7.0 : false,
  };
  console.log(`  Submit: color=${btnData.color} bg=${btnData.bg}`);
  console.log(`  Kontrast: ${ratio ? ratio.toFixed(2) : "?"} ${ratio >= 4.5 ? "✅ AA" : "❌"} ${ratio >= 7 ? "✅ AAA" : ""}`);
}
// Screenshot
await page2.evaluate(() => {
  const f = document.querySelector("form");
  if (f) f.scrollIntoView({ behavior: "instant", block: "center" });
});
await page2.waitForTimeout(300);
const ssPath = resolve(OUT, "cephe1-degerleme-submit.png");
await page2.screenshot({ path: ssPath, fullPage: false });
console.log(`  📸 ${ssPath}`);
await ctx2.close();

await browser.close();

// Özet
const ilanFail = report.ilan.filter((r) => !r.ok);
console.log(`\n══════════════════════════════════`);
console.log(`/ilan toplam: ${report.ilan.length} | hata: ${ilanFail.length}`);
console.log(`/degerleme submit kontrast: ${report.degerleme?.ratio} (AA: ${report.degerleme?.wcagAA ? "✅" : "❌"})`);

await writeFile(resolve(OUT, "_cephe1-result.json"), JSON.stringify(report, null, 2), "utf8");
process.exit(ilanFail.length > 0 || !report.degerleme?.wcagAA ? 1 : 0);
