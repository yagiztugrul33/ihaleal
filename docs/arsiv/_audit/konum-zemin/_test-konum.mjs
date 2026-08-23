import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });

const resp = await p.goto('http://localhost:4173/konum-risk-sorgu', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(4500);

const txt = await p.evaluate(() => document.body.innerText);
const r = {
  http: resp.status(),
  finalUrl: p.url(),
  // LocationPicker
  has_il_dropdown: (await p.locator('select').count()) >= 2,
  has_il_secimi: /İl seçiniz/.test(txt),
  has_ilce: /İlçe/.test(txt),
  // Harita
  has_leaflet: (await p.locator('.leaflet-container').count()) > 0,
  has_osm_attribution: /OpenStreetMap/.test(txt),
  // Sayfa içerikleri
  has_kapsam: /Veri Kapsamı/.test(txt),
  has_afad_tdth: /AFAD.*TDTH 2018|TDTH 2018/.test(txt),
  has_ibb_mikro: /İBB Mikrobölgeleme/.test(txt),
  has_uydurma_yok: /Uydurma değer|Dürüst sınır/.test(txt),
  has_egitici_sivilasma: /Sıvılaşma nedir/.test(txt),
  has_egitici_heyelan: /Heyelan nedir/.test(txt),
  has_disclaimer: /zemin etüt|jeoloji mühendisi şart/i.test(txt),
  errs: errs.slice(0, 5),
};

// İl seçimi simülasyonu: İstanbul seç
try {
  const ilSelect = p.locator('select').first();
  await ilSelect.selectOption({ label: /İstanbul/ });
  await p.waitForTimeout(2500);
  const afterTxt = await p.evaluate(() => document.body.innerText);
  r.istanbul_selected = {
    has_afad_grup_1: /AFAD Grup 1/.test(afterTxt),
    has_pga: /0\.4. g/.test(afterTxt),
    has_kuzey_anadolu: /Kuzey Anadolu/i.test(afterTxt),
    has_alluvyon: /alüvyon|Alüvyon/.test(afterTxt),
  };
  await p.screenshot({ path: '_audit/konum-zemin/istanbul-secili.png', fullPage: false });
} catch (e) {
  r.istanbul_error = String(e).slice(0, 100);
}

console.log(JSON.stringify(r, null, 2));
await browser.close();
