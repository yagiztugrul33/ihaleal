import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });
const resp = await p.goto('http://localhost:4173/ihale-ac', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(4500);
const txt = await p.evaluate(() => document.body.innerText);
const r = {
  http: resp.status(),
  // LocationPicker entegrasyonu
  has_location_picker: (await p.locator('.leaflet-container').count()) > 0,
  has_il_dropdown: /İl seçiniz|34 — İstanbul/.test(txt),
  has_osm: /OpenStreetMap/.test(txt),
  // EİDS akışı
  has_eids: /EİDS|Elektronik İlan Doğrulama/.test(txt),
  has_tasinmaz_no: /Taşınmaz numarası|Taşınmaz No/.test(txt),
  has_kasim_2024: /1 Kasım 2024/.test(txt),
  has_e_devlet: /e-Devlet/.test(txt),
  has_tapum_yok: /Tapum yok/.test(txt),
  has_yabanci: /Yabancı uyruklu/.test(txt),
  has_ada_parsel: /Ada \/ Parsel|ada.*parsel/i.test(txt),
  has_durust_not: /Dürüst not|beyan modelidir/i.test(txt),
  // Eski hard-coded city kaldı mı? 
  has_eski_harita_yakinda: /Harita entegrasyonu yakında/.test(txt),
  errs: errs.slice(0, 5),
};
await p.screenshot({ path: '_audit/yukleme-kolaylik/ihale-ac-canli.png', fullPage: true });
console.log(JSON.stringify(r, null, 2));
await browser.close();
