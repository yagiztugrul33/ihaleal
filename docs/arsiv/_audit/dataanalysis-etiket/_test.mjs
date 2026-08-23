// ADIM 9 — DataAnalysis etiket düzeltme + FxRef
// Hedef: USD seçili → "Ortalama Fiyat" etiketi ✓, ₺ tutar ✓, ≈$ ref ✓, "Endeks" yanlış kullanımı yok
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/borsa/veri`;

const browser = await chromium.launch();
const out = {};

async function test(name, currency) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((cur) => {
    try { localStorage.setItem("ihaleal_currency", cur); } catch {}
  }, currency);
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  const r = await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  const html = await page.content();
  // Doğru etiketler
  const has_ortalama_fiyat = /Ortalama Fiyat/i.test(html);
  const has_ort_fiyat_chart = /ort\. fiyat \(₺\)/i.test(html);
  const has_platform_ort = /Platform Ortalaması/i.test(html);
  // ₺ tutar
  const has_try = /₺/.test(html);
  // ≈$ referans (yalnız USD seçiliyken görünür)
  const has_usd_ref = /≈\s*\$/.test(html);
  // Bölge ısı haritası
  const has_isi = /Bölge Isı Haritası/i.test(html);
  // ESKİ etiketler temizlendi mi?
  const has_eski_endeks_h2 = /Endeks Geçmişi/i.test(html);
  const has_eski_endeks_h2b = /Varlık vs Endeks/i.test(html);

  await page.screenshot({ path: `_audit/dataanalysis-etiket/${name}.png`, fullPage: false });
  out[name] = {
    currency,
    http: r?.status() ?? 0,
    label_ortalama_fiyat: has_ortalama_fiyat,
    label_ort_fiyat_chart: has_ort_fiyat_chart,
    label_platform_ort: has_platform_ort,
    label_isi_haritasi: has_isi,
    has_try,
    has_usd_ref,
    eski_endeks_h2_kalkti: !has_eski_endeks_h2,
    eski_endeks_h2b_kalkti: !has_eski_endeks_h2b,
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

await test("try-secili", "TRY");
await test("usd-secili", "USD");

await browser.close();
console.log(JSON.stringify(out, null, 2));
