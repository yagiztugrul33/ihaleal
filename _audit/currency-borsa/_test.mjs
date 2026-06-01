import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
await p.addInitScript(() => { localStorage.setItem("ihaleal_currency", "USD"); });
const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 150)); });

const out = {};
const URLs = [
  ['borsa', '/borsa'],
  ['portfoy', '/borsa/portfoy'],
  ['izleme', '/borsa/izleme'],
  ['analiz', '/borsa/analiz'],
];

for (const [key, url] of URLs) {
  errs.length = 0;
  const r = await p.goto(`http://localhost:4173${url}`, { waitUntil: 'networkidle', timeout: 25000 }).catch(() => null);
  await p.waitForTimeout(3500);
  const txt = await p.evaluate(() => document.body.innerText);
  out[key] = {
    http: r?.status() ?? null,
    has_try: /₺/.test(txt),
    has_usd_ref: /≈ \$/.test(txt),
    errs: errs.slice(0, 3),
  };
}

// Bir asset detayı tıkla — varsa
try {
  await p.goto('http://localhost:4173/borsa', { waitUntil: 'networkidle', timeout: 20000 });
  await p.waitForTimeout(2500);
  const firstLink = p.locator('a[href*="/borsa/varlik/"]').first();
  const hasLink = await firstLink.count() > 0;
  if (hasLink) {
    await firstLink.click({ timeout: 5000 });
    await p.waitForTimeout(3500);
    const txt = await p.evaluate(() => document.body.innerText);
    out.assetDetail = {
      finalUrl: p.url(),
      has_try: /₺/.test(txt),
      has_usd_ref: /≈ \$/.test(txt),
      has_emir_defteri: /Emir Defteri/.test(txt),
      has_24s: /24s Yüksek/.test(txt),
    };
  } else {
    out.assetDetail = { skipped: "no asset link" };
  }
} catch (e) {
  out.assetDetail_err = String(e).slice(0, 150);
}

await p.screenshot({ path: '_audit/currency-borsa/asset-detail-usd.png', fullPage: false });
console.log(JSON.stringify(out, null, 2));
await browser.close();
