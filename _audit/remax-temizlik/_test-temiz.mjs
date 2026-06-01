import { chromium } from 'playwright';
const URLS = ['http://localhost:4173/kurumsal', 'http://localhost:4173/arastirma', 'http://localhost:4173/ihale-ac'];
const browser = await chromium.launch();
const out = { ts: new Date().toISOString(), tests: {} };
try {
  for (const url of URLS) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const p = await ctx.newPage();
    const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });
    const r = await p.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await p.waitForTimeout(3500);
    const txt = await p.evaluate(() => document.body.innerText);
    const key = url.split('/').pop();
    out.tests[key] = {
      http: r.status(),
      finalUrl: p.url(),
      has_remax: /remax|re\/max|re-max/i.test(txt),
      has_murat: /murat bey/i.test(txt),
      bodyLen: txt.length,
      errs: errs.slice(0, 3),
    };
    await ctx.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify(out, null, 2));
