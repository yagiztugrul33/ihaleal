// DÜRÜSTLÜK TURU — kanıt testi
// heroMetrics + TRUST_METRICS + REGION_INDEXES + ticker mutasyonu + Kurumsal Güven Panosu
// tamamı kaldırıldı/durustlestirildi. Test: sahte sayı taraması + çelişki + 4 dil + screenshot.
import { chromium } from "playwright";
import fs from "fs";
const BASE = "http://localhost:4173";
const OUT = "_audit/durustluk-turu";
const R = { byLocale: {}, honesty: {}, conflict: {}, regression: {} };
const b = await chromium.launch();

// Yasaklı sahte/hardcoded değerler — bunlardan HİÇBİRİ anasayfada görünmemeli.
const FORBIDDEN_FAKES = [
  // heroMetrics
  "126.400.000", "126,400,000", "₺126", "126M",
  "284", "1932", "1.932",
  "%2.6",
  // TRUST_METRICS
  "12.8B", "12,8B", "68.9K", "68,9K", "12.84K", "12,84K",
  "%94", "%96.4", "%97.2",
  // REGION_INDEXES
  "Akdeniz Villa", "Ege Arsa", "Bölge Endeksleri",
  // Kurumsal Güven Panosu
  "Kurumsal Güven Panosu", "ISO 27001 (Demo)",
  // tradeFeed labels
  "SATILDI bildirimi", "Yeni teklif",
  // TRUST_METRICS rendered section
  "Canlı Güven Göstergeleri", "Canlı demo metrik",
];

// "aktif ihale" sayısı: tek değerli olmalı (heroMetrics.active=284 ve stat-bar=9 çelişkisi gitti)
async function captureActiveAuctionNumbers(page) {
  return page.evaluate(() => {
    const text = document.body.innerText;
    // "aktif ihale" / "Aktif İhale" / etiket varyantlarının önündeki/yanındaki SAYILARI yakala
    const re = /(\d{1,5})\s*[\n\s]*(?:aktif ihale|Aktif İhale|Aktif ihale)/gi;
    const matches = [...text.matchAll(re)].map((m) => Number(m[1])).filter((n) => Number.isFinite(n));
    // Etiketten önce başka rakamlar olabilir: bizim ilgilendiğimiz, sayının ETIKETIN YANINDA olması.
    return [...new Set(matches)];
  });
}

for (const loc of ["tr", "en", "ru", "ar"]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 1600 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.addInitScript((l) => { try { localStorage.setItem("ihaleal_locale", l); } catch {} }, loc);
  await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);

  const dir = await p.evaluate(() => document.documentElement.dir);
  const fullText = await p.evaluate(() => document.body.innerText);

  // Yasaklı tarama
  const found = FORBIDDEN_FAKES.filter((s) => fullText.includes(s));

  // Çelişki: TR'de "aktif ihale" sayısı
  const aktifSayilari = loc === "tr" ? await captureActiveAuctionNumbers(p) : [];

  // Stat bar 3 item korundu mu (anasayfa boşluk turunun sonucu)
  const statBar = await p.evaluate(() => {
    const bar = document.querySelector('[data-testid="cinematic-stats"]');
    if (!bar) return { exists: false };
    const items = bar.querySelectorAll(".cinematic-stats-bar__item");
    return { exists: true, itemCount: items.length };
  });

  // Ticker hâlâ var mı (gerçek auction verisi)
  const tickerExists = await p.evaluate(() => !!document.querySelector(".market-board-ticker__viewport"));

  await p.screenshot({ path: `${OUT}/anasayfa-${loc}.png`, fullPage: false, clip: { x: 0, y: 0, width: 1280, height: 1400 } });

  R.byLocale[loc] = {
    dir,
    forbiddenFound: found,
    statBarItems: statBar.itemCount,
    tickerExists,
    pageerror: errs.length,
    activeAuctionNumbers: aktifSayilari,
  };
  await ctx.close();
}

R.honesty.totalForbiddenAcrossAllLangs = Object.values(R.byLocale).reduce((s, v) => s + v.forbiddenFound.length, 0);
R.honesty.cleanInAllLangs = R.honesty.totalForbiddenAcrossAllLangs === 0;

// Çelişki: TR'de aktif ihale = tek değer (9)
const trNums = R.byLocale.tr.activeAuctionNumbers;
R.conflict = {
  trActiveAuctionNumbers: trNums,
  isSingleValue: trNums.length === 1,
  value: trNums[0] ?? null,
  noConflict: trNums.length <= 1,
};

// REGRESYON: /ihaleler (konum rafı) + SW
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto(BASE + "/ihaleler", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(800);
  const hasNearby = await p.evaluate(() => /Yakınımdaki|near me|рядом|قريبة/i.test(document.body.innerText));
  const sw = await p.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    return { regCount: regs.length };
  });
  R.regression = { ihalelerLoaded: errs.length === 0, hasNearbyShelf: hasNearby, swRegCount: sw.regCount, pageerror: errs.length };
  await ctx.close();
}

await b.close();
fs.writeFileSync(`${OUT}/result.json`, JSON.stringify(R, null, 2));

console.log("=== DÜRÜSTLÜK: yasaklı/sahte değerler taraması (4 dil) ===");
for (const loc of ["tr", "en", "ru", "ar"]) {
  const r = R.byLocale[loc];
  console.log(`  ${loc} dir=${r.dir} statItems=${r.statBarItems} ticker=${r.tickerExists} pageerr=${r.pageerror} yasakli=${r.forbiddenFound.length} ${r.forbiddenFound.length ? "→ " + r.forbiddenFound.join(",") : ""}`);
}
console.log(`\n  ✓ TÜM DİLLERDE TEMİZ: ${R.honesty.cleanInAllLangs}\n`);

console.log("=== ÇELİŞKİ TESTİ (TR aktif ihale) ===");
console.log(`  TR'de "aktif ihale" yanındaki sayılar: [${R.conflict.trActiveAuctionNumbers.join(", ")}]`);
console.log(`  Tek değer mi: ${R.conflict.isSingleValue}, çelişki yok: ${R.conflict.noConflict}, değer: ${R.conflict.value}`);

console.log("\n=== REGRESYON ===");
console.log(`  ihaleler=${R.regression.ihalelerLoaded} konum-rafi=${R.regression.hasNearbyShelf} SW=${R.regression.swRegCount} pageerr=${R.regression.pageerror}`);
console.log("\nDETAY: _audit/durustluk-turu/result.json");
