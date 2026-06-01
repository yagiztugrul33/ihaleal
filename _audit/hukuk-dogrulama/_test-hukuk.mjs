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
    const errs = []; page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(2500);
      const mainTxt = await page.locator('main').innerText().catch(() => (page.locator('body').innerText()));
      const txt = (typeof mainTxt === 'string' ? mainTxt : await mainTxt).slice(0, 1200);
      const charLen = txt.length;
      const hasDisclaimer = /hukuki|avukat|tavsiye|önerge|öneri|bilgi amaçlı|placeholder|TODO/i.test(txt);
      const hasAvukatNote = /avukat|hukuki danışman/i.test(txt);
      const hasIade = /cayma|iade|14 g[üu]n|fesih/i.test(txt);
      const has5070 = /5070|nitelikli|elektronik imza|e-imza/i.test(txt);
      out.tests[key] = {
        url, http: resp?.status(), finalUrl: page.url(),
        title: await page.title(),
        charLen, hasDisclaimer, hasAvukatNote, hasIade, has5070,
        textPreview: txt.replace(/\s+/g, ' ').slice(0, 350),
        consoleErrs: errs.slice(0, 3),
      };
    } catch (e) {
      out.tests[key] = { url, error: String(e).slice(0, 200) };
    }
    await ctx.close();
  }

  // Senaryo test: hukuki-cozucu sayfasında senaryo butonları
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('https://www.ihaleal.com/arastirma/hukuki-cozucu', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(3500);
  const senaryoButtons = await page.locator('button:has-text("muvazaa"), button:has-text("para baba"), button:has-text("miras"), button:has-text("vesayet"), button:has-text("ipotek")').count();
  const allButtons = await page.locator('main button, main [role=button]').count();
  const senaryoHeadings = await page.locator('h2, h3').allTextContents();
  const fullText = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  out.cozucu_buttons = { senaryoButtons, allButtons, senaryoHeadings: senaryoHeadings.slice(0, 30), textLen: fullText.length };
  await page.screenshot({ path: '_audit/hukuk-dogrulama/cozucu-canli.png', fullPage: false });
  await ctx.close();

  // Şablonlar sayfası — kaç şablon var, indir butonu var mı
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page2 = await ctx2.newPage();
  await page2.goto('https://www.ihaleal.com/yasal/sablonlar', { waitUntil: 'networkidle', timeout: 25000 });
  await page2.waitForTimeout(3000);
  const downloadBtns = await page2.locator('button:has-text("indir"), a[download], button:has-text("PDF")').count();
  const onizleBtns = await page2.locator('button:has-text("önizle"), button:has-text("görüntüle")').count();
  const sablonHeaders = await page2.locator('h2, h3, h4').allTextContents();
  out.sablonlar_detay = { downloadBtns, onizleBtns, headings: sablonHeaders.slice(0, 20) };
  await page2.screenshot({ path: '_audit/hukuk-dogrulama/sablonlar-canli.png', fullPage: false });
  await ctx2.close();
} finally { await browser.close(); }
console.log(JSON.stringify(out, null, 2));
