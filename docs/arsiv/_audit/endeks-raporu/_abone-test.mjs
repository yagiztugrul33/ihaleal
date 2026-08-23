/**
 * /abone/onay + /abone/iptal sayfa testi.
 *
 * 4 senaryo:
 *  1) /abone/onay (token yok)  → "Geçersiz onay bağlantısı" h1
 *  2) /abone/onay?token=DUMMY → RPC çağrı + (no-backend veya error)
 *  3) /abone/iptal (token yok) → "Geçersiz iptal bağlantısı"
 *  4) /abone/iptal?token=DUMMY → RPC çağrı + (no-backend veya error)
 *
 * Console error = 0 ve h1 anlamlı.
 */

import { chromium } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:4173";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  serviceWorkers: "block",
});
const page = await ctx.newPage();

const SCENARIOS = [
  { url: "/abone/onay", label: "onay-notoken" },
  { url: "/abone/onay?token=DUMMY12345678", label: "onay-dummy" },
  { url: "/abone/iptal", label: "iptal-notoken" },
  { url: "/abone/iptal?token=DUMMY12345678", label: "iptal-dummy" },
];

for (const s of SCENARIOS) {
  const errors = [];
  const pageErrors = [];
  const onCons = (m) => m.type() === "error" && errors.push(m.text());
  const onPe = (e) => pageErrors.push(String(e?.stack || e));
  page.on("console", onCons);
  page.on("pageerror", onPe);

  console.log(`\n══════ ${s.url} ══════`);
  const resp = await page.goto(`${BASE}${s.url}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000); // RPC için süre tanı
  const status = resp ? resp.status() : 0;
  const h1 = await page.$eval("h1", (el) => (el.textContent || "").trim()).catch(() => "");
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 800));
  console.log(`  HTTP: ${status} | EB: ${errors.length} | PE: ${pageErrors.length}`);
  console.log(`  h1: "${h1}"`);
  // mesaj kontrolü
  const hasMsg = /onay|iptal|abone|geçersiz|servis|tamamlanamadı|bekleyin/i.test(bodyText);
  console.log(`  Anlamlı mesaj: ${hasMsg ? "✅" : "❌"}`);

  const ssPath = resolve(__dirname, `abone-${s.label}.png`);
  await page.screenshot({ path: ssPath, fullPage: false });
  console.log(`  📸 ${ssPath}`);

  page.off("console", onCons);
  page.off("pageerror", onPe);
}

await ctx.close();
await browser.close();
console.log("\nBitti.");
