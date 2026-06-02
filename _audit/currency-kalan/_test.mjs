// ADIM 8 — kalan currency dilimleri canlı testi
// USD seçili kur ile sayfalar açılır → ₺ ana + ≈ $ referans var mı kontrol
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const out = {};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});

// USD'yi localStorage'a yaz
await ctx.addInitScript(() => {
  try { localStorage.setItem("ihaleal_currency", "USD"); } catch {}
});

async function test(name, path, opts = {}) {
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  const r = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);

  // Form'a tıkla varsa
  if (opts.fillForm) {
    try {
      await opts.fillForm(page);
      await page.waitForTimeout(600);
    } catch (e) { errs.push(`fill: ${String(e)}`); }
  }

  const html = await page.content();
  const has_try = /₺|TRY/.test(html);
  const has_usd_ref = /≈\s*\$/.test(html);

  await page.screenshot({ path: `_audit/currency-kalan/${name}.png`, fullPage: false });
  out[name] = {
    http: r?.status() ?? 0,
    has_try,
    has_usd_ref,
    errs: errs.slice(0, 5),
  };
  await page.close();
}

// 1. Konut Kredisi Hesaplayıcı
await test("kredi-hesaplayici", "/konut-kredisi-hesaplayici?amount=3000000");

// 2. Mortgage sayfası (varsa)
await test("mortgage", "/mortgage");

// 3. Emlakçı Panel
await test("emlakci-panel", "/emlakci/panel");

// 4. Valuation Tool (Workbench tetiklemez ama anasayfa açılır)
await test("valuation", "/valuation");

await browser.close();
console.log(JSON.stringify(out, null, 2));
