import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });
let resp; let where = 'local-4173';
try {
  resp = await p.goto('http://localhost:4173/fiyatlandirma', { waitUntil: 'networkidle', timeout: 15000 });
} catch {
  where = 'local-4254';
  resp = await p.goto('http://localhost:4254/fiyatlandirma', { waitUntil: 'networkidle', timeout: 15000 });
}
await p.waitForTimeout(3500);
const txt = await p.evaluate(() => document.body.innerText);
const r = {
  where, http: resp?.status(),
  // YENİ LİSTE FİYATLARI
  has_499: /₺499/.test(txt),
  has_1900: /₺1\.900/.test(txt),
  has_4500: /₺4\.500/.test(txt),
  has_9900: /₺9\.900/.test(txt),
  // ESKİ FİYATLAR UZAKLAŞMIŞ MI
  has_eski_399: /₺399\/ay|₺399\b/.test(txt),
  has_eski_1500: /₺1\.500\/ay|₺1\.500\b/.test(txt),
  has_eski_3500: /₺3\.500\/ay|₺3\.500\b/.test(txt),
  has_eski_7500: /₺7\.500\b/.test(txt), // 7500 kuruluş fiyatı kalmış olabilir (üst çizili görünür)
  // ERKEN ÜYE
  has_kurulus_banner: /Kuruluş üyesi/.test(txt),
  has_sinirli: /Sınırlı/.test(txt),
  has_349: /₺349/.test(txt),
  has_1400: /₺1\.400/.test(txt),
  has_3400: /₺3\.400/.test(txt),
  // EN POPÜLER → PRO
  has_en_populer: /En Popüler/.test(txt),
  has_premium: /Premium/.test(txt),
  // ŞEFFAFLIK
  has_taahhuet_yok: /Taahhüt yok/.test(txt),
  has_iptal: /İstediğin zaman iptal/.test(txt),
  has_gizli_yok: /Gizli ücret yok/.test(txt),
  // GÜNDE
  has_gunde: /günde ₺/.test(txt),
  // SSS KOMİSYON DOĞRU
  has_2_alici_2_satici: /%2 alıcı \+ %2 satıcı/.test(txt),
  has_eski_kademeli: /kademeli: 0-3M %3/.test(txt),
  // Listing limits
  has_20_ilan: /20 ilan/.test(txt),
  has_60_ilan: /60 ilan/.test(txt),
  errs: errs.slice(0, 3),
};
await p.screenshot({ path: '_audit/fiyat-guncelleme/fiyat-canli.png', fullPage: true });
console.log(JSON.stringify(r, null, 2));
await browser.close();
