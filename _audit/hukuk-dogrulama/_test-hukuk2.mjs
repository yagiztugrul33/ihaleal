import { chromium } from 'playwright';
const URLS = {
  hub: 'https://www.ihaleal.com/yasal',
  kvkk: 'https://www.ihaleal.com/kvkk',
  gizlilik: 'https://www.ihaleal.com/gizlilik',
  cerez: 'https://www.ihaleal.com/cerez-politikasi',
  kullanim: 'https://www.ihaleal.com/kullanim-kosullari',
  mesafeli: 'https://www.ihaleal.com/mesafeli-satis-sozlesmesi',
  aydinlatma: 'https://www.ihaleal.com/aydinlatma-metni',
  ihaleKosul: 'https://www.ihaleal.com/ihale-kosullari',
  iadeIptal: 'https://www.ihaleal.com/iade-iptal',
  hukukiCozucu: 'https://www.ihaleal.com/arastirma/hukuki-cozucu',
  riskUyari: 'https://www.ihaleal.com/yasal/risk-uyarilari',
  sablonlar: 'https://www.ihaleal.com/yasal/sablonlar',
};
const out = { ts: new Date().toISOString(), tests: {} };
const browser = await chromium.launch();
try {
  for (const [key, url] of Object.entries(URLS)) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 180)); });
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(2200);
      const txt = (await page.evaluate(() => document.body.innerText)).slice(0, 1500);
      const charLen = txt.length;
      out.tests[key] = {
        http: resp?.status(), finalUrl: page.url(), title: await page.title(),
        charLen,
        hasAvukat: /avukat|hukuki danışman/i.test(txt),
        hasIade: /cayma|iade|14 g[üu]n|fesih|abonelik/i.test(txt),
        has5070: /5070|nitelikli|elektronik imza|e-imza|ESHS/i.test(txt),
        has404: /404|bulunamadı|sayfa yok/i.test(txt),
        preview: txt.replace(/\s+/g, ' ').slice(0, 280),
        errs: errs.slice(0, 3),
      };
    } catch (e) {
      out.tests[key] = { url, error: String(e).slice(0, 180) };
    }
    await ctx.close();
  }
  // cozucu sayfa detay
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('https://www.ihaleal.com/arastirma/hukuki-cozucu', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(3500);
  const senaryoButtons = await page.locator('button, [role=button]').count();
  const h2h3 = await page.locator('h1, h2, h3').allTextContents();
  const fullTxt = await page.evaluate(() => document.body.innerText);
  out.cozucu = {
    allButtons: senaryoButtons,
    headings: h2h3.slice(0, 30),
    textLen: fullTxt.length,
    has_para_baba: /para.*ebeveyn|para.*baba|muvazaa|tapu.*[oç]ocuk/i.test(fullTxt),
    has_miras: /miras|tenkis|saklı pay/i.test(fullTxt),
    has_ipotek: /ipotek|haciz/i.test(fullTxt),
    has_disclaimer: /hukuki tavsiye|avukat şart|bilgi amaçlı/i.test(fullTxt),
  };
  await page.screenshot({ path: '_audit/hukuk-dogrulama/cozucu-canli.png', fullPage: false });
  await ctx.close();
  // sablonlar
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page2 = await ctx2.newPage();
  await page2.goto('https://www.ihaleal.com/yasal/sablonlar', { waitUntil: 'networkidle', timeout: 25000 });
  await page2.waitForTimeout(3000);
  const downloadBtns = await page2.locator('button:has-text("indir"), a[download], button:has-text("PDF")').count();
  const onizleBtns = await page2.locator('button:has-text("önizle"), button:has-text("görüntüle")').count();
  const sablonHeaders = await page2.locator('h2, h3, h4').allTextContents();
  out.sablonlar = { downloadBtns, onizleBtns, headings: sablonHeaders.slice(0, 20) };
  await page2.screenshot({ path: '_audit/hukuk-dogrulama/sablonlar-canli.png', fullPage: false });
  await ctx2.close();
} finally { await browser.close(); }
console.log(JSON.stringify(out, null, 2));
