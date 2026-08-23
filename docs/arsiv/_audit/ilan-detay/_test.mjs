import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
await p.addInitScript(() => { localStorage.setItem("ihaleal_currency", "USD"); });
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });

// Önce ihale listesini aç + bir ilan tıkla
const r0 = await p.goto('http://localhost:4173/ihaleler', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(3500);

// İlk ilan butonuna tıkla — onClick navigate(/ilan/X)
const firstCard = p.locator('button, a').filter({ hasText: /İlan|İhale/i }).first();
let detailUrl = null;
try {
  // Önce direkt /ilan/1 git
  await p.goto('http://localhost:4173/ilan/1', { waitUntil: 'networkidle', timeout: 25000 });
  await p.waitForTimeout(4000);
  detailUrl = p.url();
} catch {}

const txt = await p.evaluate(() => document.body.innerText);
const out = {
  detailUrl,
  has_try: /₺/.test(txt),
  has_usd_ref: /≈ \$/.test(txt),
  has_tahmini: /Tahmini değer/.test(txt),
  has_dogrulanmis: /Doğrulanmış ilan/.test(txt),
  has_birim_fiyat: /\/ m²/.test(txt),
  has_galeri: /Galer|galer|fotoğraf/i.test(txt),
  has_priceHistory: /Fiyat Geçmişi/.test(txt),
  errs: errs.slice(0, 5),
};
await p.screenshot({ path: '_audit/ilan-detay/ilan-usd.png', fullPage: false });
console.log(JSON.stringify(out, null, 2));
await browser.close();
