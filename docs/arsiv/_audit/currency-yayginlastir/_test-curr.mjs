import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });

// /fiyatlandirma — kur seçici Navbar'da var mı + TRY default
const r1 = await p.goto('http://localhost:4173/fiyatlandirma', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(3500);
const t1 = await p.evaluate(() => document.body.innerText);

const out = {
  fiyatlandirma_TRY: {
    http: r1.status(),
    has_kur_selector: (await p.locator('[data-testid="currency-selector"]').count()) > 0,
    has_499: /₺499/.test(t1),
    has_eski_donusum_yok: !/\$\d|\€\d/.test(t1),  // TRY default'ta yabancı para görünmemeli
  }
};

// Kur seçiciyi USD'ye al
try {
  await p.locator('[data-testid="currency-selector"] button').first().click();
  await p.waitForTimeout(500);
  await p.locator('button:has-text("US Dollar")').first().click();
  await p.waitForTimeout(2500);
  const t2 = await p.evaluate(() => document.body.innerText);
  out.fiyatlandirma_USD = {
    has_499_korundu: /₺499/.test(t2),  // ana TRY fiyat hâlâ görünmeli
    has_dolar_referans: /≈\s*\$/.test(t2),
    has_tahsilat_try: /tahsilat ₺/i.test(t2),
  };
} catch (e) {
  out.fiyatlandirma_USD_error = String(e).slice(0, 100);
}

// /magaza addon
const r3 = await p.goto('http://localhost:4173/magaza', { waitUntil: 'networkidle', timeout: 25000 }).catch(() => null);
await p.waitForTimeout(3500);
if (r3) {
  const t3 = await p.evaluate(() => document.body.innerText);
  out.magaza_USD = {
    http: r3.status(),
    has_dolar_referans: /≈\s*\$/.test(t3),
    has_tahsilat_try: /tahsilat ₺/i.test(t3),
  };
}

// /komisyon
const r4 = await p.goto('http://localhost:4173/komisyon', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(3500);
const t4 = await p.evaluate(() => document.body.innerText);
out.komisyon_USD = {
  http: r4.status(),
  has_dolar_referans: /≈\s*\$/.test(t4),
  has_komisyon_try_uyari: /Komisyon ₺ üzerinden hesaplanır|yasal matrah/i.test(t4),
  has_200000_korundu: /200\.000/.test(t4),  // komisyon hâlâ ₺ olarak görünür
};

await p.screenshot({ path: '_audit/currency-yayginlastir/komisyon-usd.png', fullPage: false });
console.log(JSON.stringify(out, null, 2));
await browser.close();
