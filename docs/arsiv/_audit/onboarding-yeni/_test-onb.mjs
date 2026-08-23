import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });
const resp = await p.goto('http://localhost:4173/onboarding/akis', { waitUntil: 'networkidle', timeout: 25000 });
await p.waitForTimeout(3500);
const txt = await p.evaluate(() => document.body.innerText);
const r = {
  http: resp.status(),
  // YENİ akış
  has_hosgeldin: /Hoş geldin/.test(txt),
  has_nereden: /Nereden başlamak/.test(txt),
  has_kesfet: /Keşfet/.test(txt),
  has_sat: /Sat \/ İlan ver|Sat .{0,5}İlan ver/.test(txt),
  has_al: /Al \/ Teklif ver|Al .{0,5}Teklif ver/.test(txt),
  has_simdilik_gec: /Şimdilik geç/.test(txt),
  has_degistirebilirsin: /istediğin zaman değiştirebilirsin/i.test(txt),
  // ESKİ kaldırıldı mı
  has_eski_backend_yok: /Backend yok|§D-K/.test(txt),
  has_eski_evrak: /Birleşik evrak|DocumentUploader|Örnek evrak/.test(txt),
  has_eski_edevlet_buton: /e-Devlet yetki.*DEMO/.test(txt),
  has_eski_kullaniciakisi: /Kullanıcı akışı seçimi/.test(txt),
  has_eski_userFlows_kod: /userFlows\.ts/.test(txt),
  // Görsel
  buttonCount: await p.locator('button').count(),
  cardCount: await p.locator('[role=button]').count() + await p.locator('button').count(),
  errs: errs.slice(0, 5),
};
// Tüm kart başlıkları
r.h2 = (await p.locator('h2').allTextContents()).slice(0, 10);
// Lacivert arka plan var mı (style attribute)
const mainBg = await p.locator('main').first().evaluate(el => getComputedStyle(el).backgroundColor).catch(() => null);
r.mainBg = mainBg;
await p.screenshot({ path: '_audit/onboarding-yeni/onboarding-yeni.png', fullPage: true });

// Tıklama testi — "Keşfet" kartına tıkla
const kesfetBtn = p.locator('button:has-text("Keşfet")').first();
await kesfetBtn.click();
await p.waitForTimeout(2500);
r.afterKesfet = { finalUrl: p.url(), expectedContains_ihaleler: p.url().includes("/ihaleler") };

console.log(JSON.stringify(r, null, 2));
await browser.close();
