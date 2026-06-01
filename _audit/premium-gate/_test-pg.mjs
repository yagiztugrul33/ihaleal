import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });

// 1. /fiyatlandirma — premium gate olmayan sayfa
const r1 = await p.goto('http://localhost:4173/fiyatlandirma', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(3500);
const fTxt = await p.evaluate(() => document.body.innerText);
const out = {
  fiyatlandirma: {
    http: r1.status(),
    has_kurulus: /Kuruluş üyesi/.test(fTxt),
    has_paketler: /Yatırımcı|Emlak Pro/.test(fTxt),
    has_499: /₺499/.test(fTxt),
    errs: errs.slice(0, 3),
  }
};

// 2. /odeme/baslat?paket=emlak_pro — sandbox banner var mı (login wall olabilir)
errs.length = 0;
const r2 = await p.goto('http://localhost:4173/odeme/baslat?paket=emlak_pro&periyot=monthly', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(4000);
const oTxt = await p.evaluate(() => document.body.innerText);
out.odeme = {
  http: r2.status(),
  finalUrl: p.url(),
  has_sandbox: /sandbox|Sandbox|SANDBOX/i.test(oTxt),
  has_login_wall: /giriş yap|Giriş yap|oturum/i.test(oTxt),
  has_emlak_pro: /Emlak Pro/.test(oTxt),
  has_iyzico: /iyzico/i.test(oTxt),
  has_3ds: /3D|secure|Secure/i.test(oTxt),
  txtPreview: oTxt.replace(/\s+/g, ' ').slice(0, 600),
  errs: errs.slice(0, 3),
};

// 3. /odeme/basarili — yeni "Sandbox ödeme" metni
errs.length = 0;
const r3 = await p.goto('http://localhost:4173/odeme/basarili?paket=yatirimci&periyot=monthly&sandbox=1', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(3500);
const sTxt = await p.evaluate(() => document.body.innerText);
out.basarili = {
  http: r3.status(),
  has_yeni_sandbox: /Sandbox Ödeme Onayı/.test(sTxt),
  has_eski_mock: /MOCK'tur|tarayıcı localStorage/.test(sTxt),
  has_subscriptions_ref: /subscriptions\b/.test(sTxt),
  has_iyzico_sandbox: /iyzico sandbox/i.test(sTxt),
  errs: errs.slice(0, 3),
};
await p.screenshot({ path: '_audit/premium-gate/odeme-basarili.png', fullPage: false });

console.log(JSON.stringify(out, null, 2));
await browser.close();
