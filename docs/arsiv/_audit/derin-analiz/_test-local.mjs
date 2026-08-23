import { chromium } from 'playwright';
const URLS = ['http://localhost:4254/ilanlar', 'http://localhost:4173/ilanlar'];
const browser = await chromium.launch();
const out = [];
for (const url of URLS) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);
    out.push({
      url, http: resp?.status(), finalUrl: page.url(), title: await page.title(),
      cards: await page.locator('[class*="card"]').count(),
      imgs: await page.locator('main img, body img').count(),
      mainTxt: (await page.locator('body').innerText()).slice(0, 400).replace(/\s+/g, ' '),
      errs: errs.slice(0, 5),
    });
  } catch (e) {
    out.push({ url, error: String(e).slice(0, 200) });
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
