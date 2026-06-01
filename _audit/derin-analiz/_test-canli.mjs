import { chromium } from 'playwright';
const URLS = [
  'https://www.ihaleal.com/ilanlar',
  'https://www.ihaleal.com/ihaleler',
  'https://www.ihaleal.com/auctions',
];
const out = { ts: new Date().toISOString(), tests: [] };
const browser = await chromium.launch();
try {
  for (const url of URLS) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const consoleErrors = [], networkErrors = [], supabaseCalls = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
    page.on('requestfailed', r => networkErrors.push({ url: r.url(), err: r.failure()?.errorText }));
    page.on('response', r => {
      const u = r.url();
      if (u.includes('supabase') && (u.includes('listings') || u.includes('rest/v1'))) {
        supabaseCalls.push({ url: u.slice(0, 150), status: r.status() });
      }
    });
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2500);
      const finalUrl = page.url();
      const title = await page.title();
      const auctionCards = await page.locator('[class*="auction"], [class*="ilan-"], a[href*="/ilan/"], a[href*="/ihale/"]').count();
      const text = (await page.locator('body').innerText()).slice(0, 500);
      const has404 = text.toLowerCase().includes('404') || text.includes('bulunamadı');
      out.tests.push({
        url, finalUrl, http: resp?.status(), title, auctionCards,
        bodyTextStart: text.replace(/\s+/g, ' ').slice(0, 300),
        has404, consoleErrors: consoleErrors.slice(0, 5),
        networkErrors: networkErrors.slice(0, 5), supabaseCalls: supabaseCalls.slice(0, 8),
      });
    } catch (e) {
      out.tests.push({ url, error: String(e).slice(0, 200) });
    }
    await ctx.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify(out, null, 2));
