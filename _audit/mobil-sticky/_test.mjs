// Mobil sticky CTA bar — viewport testleri
// Hedef: mobil (390x844) bar görünür, masaüstü (1280x800) bar gizli
import { chromium } from "playwright";

const BASE = "http://127.0.0.1:4173";
const URL = `${BASE}/ilan/1`;

const browser = await chromium.launch();
const out = {};

async function test(name, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

  const r = await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(800);

  // Mobil bar selektör: role="region" aria-label="İlan aksiyon barı"
  const bar = await page.locator('[aria-label="İlan aksiyon barı"]').first();
  const barCount = await bar.count();
  const barVisible = barCount > 0 ? await bar.isVisible() : false;

  // Bar içinde fiyat + buton var mı
  const barHTML = barCount > 0 ? await bar.innerHTML().catch(() => "") : "";
  const has_try = barHTML.includes("₺");
  const has_button = barHTML.includes("Teklif") || barHTML.includes("teklif");
  const has_heart = barHTML.includes("Favori") || barHTML.includes("favori") || /aria-label="Favori/i.test(barHTML);

  // Masaüstü sağ panel (lg:col-span-1 + card-luxury sticky) — line 1205 ile uyumlu
  const desktopPanel = await page.locator('.card-luxury.sticky').first();
  const desktopPanelCount = await desktopPanel.count();
  const desktopPanelVisible = desktopPanelCount > 0 ? await desktopPanel.isVisible() : false;

  // Screenshot
  const ss = `_audit/mobil-sticky/${name}.png`;
  await page.screenshot({ path: ss, fullPage: false });

  out[name] = {
    http: r?.status() ?? 0,
    viewport,
    bar_count: barCount,
    bar_visible: barVisible,
    bar_has_try: has_try,
    bar_has_button: has_button,
    bar_has_heart_button: has_heart,
    desktop_panel_visible: desktopPanelVisible,
    errs: errs.slice(0, 5),
  };
  await ctx.close();
}

// Mobil iPhone 12 boyutu
await test("mobil-390x844", { width: 390, height: 844 });

// Masaüstü
await test("masaustu-1280x800", { width: 1280, height: 800 });

await browser.close();
console.log(JSON.stringify(out, null, 2));
