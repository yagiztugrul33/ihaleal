import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 250)); });
const reqs = [];
page.on('response', r => {
  const u = r.url();
  if (u.includes('supabase') && u.includes('rest/v1')) reqs.push({ url: u.slice(0, 200), status: r.status() });
});
const resp = await page.goto('https://www.ihaleal.com/auctions', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(4000);
const counters = {
  http: resp?.status(),
  finalUrl: page.url(),
  linksToIlan: await page.locator('a[href^="/ilan/"]').count(),
  linksToIhale: await page.locator('a[href^="/ihale/"]').count(),
  buttonsOnclickIlan: await page.locator('button[onclick*="ilan"]').count(),
  cards: await page.locator('article').count(),
  cardsClass: await page.locator('[class*="card"]').count(),
  imgs: await page.locator('main img').count(),
  empty: await page.locator(':text-matches("(bulunamadı|hiç ihale|boş|herhangi)", "i")').count(),
};
const mainTxt = (await page.locator('main').innerText()).slice(0, 1500);
await page.screenshot({ path: '_audit/derin-analiz/auctions-canli.png', fullPage: false });
console.log(JSON.stringify({ counters, errs: errs.slice(0, 10), supabaseReqs: reqs.slice(0, 10), mainTxtPreview: mainTxt.replace(/\s+/g, ' ') }, null, 2));
await browser.close();
