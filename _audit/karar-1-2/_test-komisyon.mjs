import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
let resp = null;
try { resp = await page.goto('http://localhost:4173/komisyon', { waitUntil: 'networkidle', timeout: 15000 }); } catch {}
if (!resp) {
  try { resp = await page.goto('http://localhost:4254/komisyon', { waitUntil: 'networkidle', timeout: 15000 }); } catch {}
}
if (!resp) {
  console.log("Local preview yok — canlı dene (push sonrası)");
  try { resp = await page.goto('https://www.ihaleal.com/komisyon', { waitUntil: 'networkidle', timeout: 25000 }); } catch (e) {
    console.log("Error:", e.message);
  }
}
await page.waitForTimeout(3500);
const txt = await page.evaluate(() => document.body.innerText);
const result = {
  http: resp?.status() ?? null,
  finalUrl: page.url(),
  title: await page.title(),
  has_2plus2: /satıcı.{0,30}%2|%2.{0,30}satıcı|%2.{0,30}alıcı|alıcı.{0,30}%2/i.test(txt),
  has_4_total: /%4.{0,20}matrah|toplam.{0,20}%4|matrah.{0,20}%4/i.test(txt),
  has_KDV: /KDV/.test(txt),
  has_tasinmaz_yon: /Taşınmaz Ticareti/i.test(txt),
  has_kademeli_eski: /kademeli.*%3|%3.*%2\.5|%3 \/ %2\.5/i.test(txt),
  preview: txt.replace(/\s+/g, ' ').slice(0, 1000),
  errs: errs.slice(0, 5),
};
await page.screenshot({ path: '_audit/karar-1-2/komisyon-canli.png', fullPage: false });
console.log(JSON.stringify(result, null, 2));
await browser.close();
