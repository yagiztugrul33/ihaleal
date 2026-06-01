import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });

// USD seçili olarak başla — localStorage
await p.addInitScript(() => { localStorage.setItem("ihaleal_currency", "USD"); });

const out = {};

// /odeme/baslat?paket=yatirimci&periyot=monthly
const r1 = await p.goto('http://localhost:4173/odeme/baslat?paket=yatirimci&periyot=monthly', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(4000);
const t1 = await p.evaluate(() => document.body.innerText);
out.odeme_baslat = {
  http: r1.status(),
  has_499: /₺499/.test(t1),
  has_dolar_referans: /≈ \$/.test(t1),
  has_tahsilat_try: /tahsilat ₺/i.test(t1),
  has_sandbox: /Sandbox|sandbox/.test(t1),
};

// /odeme/basarili
const r2 = await p.goto('http://localhost:4173/odeme/basarili?paket=emlak_pro&periyot=monthly&sandbox=1', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(4000);
const t2 = await p.evaluate(() => document.body.innerText);
out.odeme_basarili = {
  http: r2.status(),
  has_4500: /₺4\.500/.test(t2),
  has_dolar_referans: /≈ \$/.test(t2),
  has_tahsilat_try: /tahsilat ₺/i.test(t2),
};

// /degerleme — yatırımcı modu, sonuç beklemek için tetikle
const r3 = await p.goto('http://localhost:4173/degerleme', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(3000);

// Form gönderme dene
try {
  const submitBtn = p.locator('button[type="submit"]').first();
  await submitBtn.click({ timeout: 5000 }).catch(() => null);
  await p.waitForTimeout(3000);
} catch {}

const t3 = await p.evaluate(() => document.body.innerText);
out.degerleme = {
  http: r3.status(),
  has_tahmini_sonuc: /Tahmini Sonuç|tahmin/i.test(t3),
  has_dolar_referans: /≈ \$/.test(t3),
  has_degerleme_try: /değerleme ₺|TRY referans/i.test(t3),
};

await p.screenshot({ path: '_audit/currency-odeme-degerleme/odeme-usd.png', fullPage: false });
out.errs = errs.slice(0, 5);
console.log(JSON.stringify(out, null, 2));
await browser.close();
