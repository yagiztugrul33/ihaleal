import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });
let resp; let where = 'local-4173';
try {
  resp = await page.goto('http://localhost:4173/guvenlik', { waitUntil: 'networkidle', timeout: 15000 });
} catch {
  try {
    where = 'local-4254';
    resp = await page.goto('http://localhost:4254/guvenlik', { waitUntil: 'networkidle', timeout: 15000 });
  } catch {
    where = 'canli';
    resp = await page.goto('https://www.ihaleal.com/guvenlik', { waitUntil: 'networkidle', timeout: 25000 });
  }
}
await page.waitForTimeout(3500);
const txt = await page.evaluate(() => document.body.innerText);
const r = {
  where, http: resp?.status(), finalUrl: page.url(),
  has_aktif_baslik: /Şu An Aktif|AKTİF/i.test(txt),
  has_anti_sniping: /Anti-sniping/i.test(txt),
  has_race_lock: /FOR UPDATE|Race koruması/i.test(txt),
  has_idempotency: /Idempotency/i.test(txt),
  has_teminat: /Teminat blokajı %5|%5.*teminat/i.test(txt),
  has_sealed: /Sealed teklif|listing_offers_safe/i.test(txt),
  has_7_header: /7 güvenlik header/i.test(txt),
  has_jwt: /JWT zorunlu/i.test(txt),
  has_owner_rls: /Owner-only RLS/i.test(txt),
  has_pii_sanitize: /PII sanitize|11\/11/i.test(txt),
  has_yol_haritasi: /Yol Haritası|YOL HARİTASI/.test(txt),
  has_gelistiriliyor: /Geliştiriliyor|GELİŞTİRİLİYOR/.test(txt),
  has_hedef: /Hedef:/.test(txt),
  has_henuz_canlida_degil: /henüz canlıda DEĞİL|aktif gösterilmez/i.test(txt),
  has_eski_ml_edilir: /ML modeli ile analiz edilir/i.test(txt),
  has_eski_ip_ban: /otomatik IP ban, CAPTCHA veya session sonlandırma/i.test(txt),
  has_eski_aynisip: /Aynı IP'den çoklu hesap engellenir/i.test(txt),
  errs,
};
await page.screenshot({ path: '_audit/guvenlik-kart-durust/guvenlik-sonra.png', fullPage: true });
console.log(JSON.stringify(r, null, 2));
await browser.close();
