import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });

const resp = await p.goto('http://localhost:4173/konum-risk-sorgu', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(4500);

// Full page text bekle
await p.locator('h1').first().waitFor({ timeout: 5000 });
const txt = await p.evaluate(() => document.body.innerText);

const r = {
  http: resp.status(),
  txtLen: txt.length,
  has_il_dropdown: (await p.locator('select').count()) >= 2,
  has_il_secimi: /İl seçiniz/.test(txt),
  has_leaflet: (await p.locator('.leaflet-container').count()) > 0,
  has_osm: /OpenStreetMap/.test(txt),
  has_afad_tdth: /TDTH 2018/.test(txt),
  has_ibb: /İBB Mikrobölgeleme/.test(txt),
  has_sivilasma: /Sıvılaşma nedir/.test(txt),
  has_heyelan: /Heyelan nedir/.test(txt),
  has_buyutme: /Zemin Büyütme nedir/.test(txt),
  has_jeo_sart: /jeoloji mühendisi şart|zemin etüt raporu/i.test(txt),
};

// İl seçimi: doğru API
try {
  await p.locator('select').first().selectOption("İstanbul");
  await p.waitForTimeout(3500);
  const after = await p.evaluate(() => document.body.innerText);
  r.istanbul = {
    afterLen: after.length,
    has_afad_grup_1: /AFAD Grup 1/.test(after),
    has_pga: /0\.[34]\d g/.test(after),
    has_kuzey_anadolu: /Kuzey Anadolu|KAF/.test(after),
    has_alluvyon: /alüvyon/i.test(after),
    has_marmara: /Marmara/i.test(after),
  };

  // İlçe: Avcılar
  await p.locator('select').nth(1).selectOption("Avcılar");
  await p.waitForTimeout(2000);
  const avc = await p.evaluate(() => document.body.innerText);
  r.avcilar = {
    has_cok_yuksek: /Çok Yüksek/.test(avc),
    has_kucukcekmece: /Küçükçekmece/.test(avc),
    has_ibb_kaynak: /İBB Mikrobölgeleme/.test(avc),
  };
  await p.screenshot({ path: '_audit/konum-zemin/istanbul-avcilar.png', fullPage: true });
} catch (e) {
  r.error = String(e).slice(0, 150);
}

// Veri olmayan il test (Bayburt)
try {
  await p.locator('select').first().selectOption("Bayburt");
  await p.waitForTimeout(2500);
  const bayburt = await p.evaluate(() => document.body.innerText);
  r.bayburt = {
    has_veri_yok: /detaylı veri yok|Veri yok/i.test(bayburt),
    has_durust_sinir: /Dürüst sınır|Uydurma değer/i.test(bayburt),
    has_il_geneli_yonlendirme: /İl geneli|il geneli/.test(bayburt),
  };
  await p.screenshot({ path: '_audit/konum-zemin/bayburt-veri-yok.png', fullPage: false });
} catch (e) {
  r.bayburt_error = String(e).slice(0, 100);
}

r.errs = errs.slice(0, 3);
console.log(JSON.stringify(r, null, 2));
await browser.close();
