// ANASAYFA BOŞLUK DOLDURMA TURU — kanıt testi
// "—" çevrimiçi kutusu kaldırıldı; 3'lü dengeli grid + 4 dil etiket + RTL kanıtı.
import { chromium } from "playwright";
import fs from "fs";
const BASE = "http://localhost:4173";
const OUT = "_audit/dil-anasayfa";
const R = { byLocale: {}, regression: {} };
const b = await chromium.launch();

// Beklenen etiket sözcükleri (her dil için cinematicStats: activeAuctions + seoPages + liveLabel + exchangeTerminal)
const EXPECTED = {
  tr: ["aktif ihale", "SEO sayfa", "CANLI", "borsa terminali"],
  en: ["active auctions", "SEO pages", "LIVE", "exchange terminal"],
  ru: ["активных торгов", "SEO страниц", "В ЭФИРЕ", "терминал биржи"],
  ar: ["مزاد نشط", "صفحات SEO", "مباشر", "محطة البورصة"],
};

for (const loc of ["tr", "en", "ru", "ar"]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.addInitScript((l) => { try { localStorage.setItem("ihaleal_locale", l); } catch {} }, loc);
  await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1400);

  const dir = await p.evaluate(() => document.documentElement.dir);

  // Stat bar yapısı — 3 item olmalı (önceden 4 idi)
  const statBar = await p.evaluate(() => {
    const bar = document.querySelector('[data-testid="cinematic-stats"]');
    if (!bar) return { exists: false };
    const items = bar.querySelectorAll(".cinematic-stats-bar__item");
    const dividers = bar.querySelectorAll(".cinematic-stats-bar__divider");
    const labels = [...items].map((it) => it.querySelector(".cinematic-stats-bar__label")?.textContent || "");
    const values = [...items].map((it) => it.querySelector(".cinematic-stats-bar__value")?.textContent || "");
    const hasEmDash = (bar.textContent || "").includes("—");
    return { exists: true, itemCount: items.length, dividerCount: dividers.length, labels, values, hasEmDash };
  });

  // Beklenen etiketler/değerler bu dilde göründü mü? (liveLabel VALUE'da, diğerleri LABEL'da)
  const expected = EXPECTED[loc];
  const combined = [...(statBar.labels || []), ...(statBar.values || [])].join("|");
  const expectedFound = expected.map((e) => combined.includes(e));
  const allLabelsFound = expectedFound.every(Boolean);

  // Yasaklı: "çevrimiçi"/"online"/"онлайн"/"متصل" stat bar'da olmamalı
  const forbiddenInBar = /çevrimiçi|онлайн|متصل|\bonline\b/i.test(combined);

  // Sayı varlığı (aktif ihale + SEO sayfa)
  const hasDigits = (statBar.values || []).some((v) => /\d/.test(v));

  // Stat bar'a kaydır + element bbox ile odaklı screenshot al
  await p.evaluate(() => {
    const bar = document.querySelector('[data-testid="cinematic-stats"]');
    if (bar) bar.scrollIntoView({ block: "center", inline: "center" });
  });
  await p.waitForTimeout(300);
  const barEl = await p.$('[data-testid="cinematic-stats"]');
  if (barEl) {
    const bbox = await barEl.boundingBox();
    if (bbox) {
      const pad = 24;
      await p.screenshot({
        path: `${OUT}/stat-${loc}.png`,
        clip: {
          x: Math.max(0, Math.floor(bbox.x - pad)),
          y: Math.max(0, Math.floor(bbox.y - pad)),
          width: Math.min(1280, Math.ceil(bbox.width + 2 * pad)),
          height: Math.ceil(bbox.height + 2 * pad),
        },
      });
    } else {
      await p.screenshot({ path: `${OUT}/stat-${loc}.png`, fullPage: false });
    }
  } else {
    await p.screenshot({ path: `${OUT}/stat-${loc}.png`, fullPage: false });
  }

  R.byLocale[loc] = {
    dir,
    statBarExists: statBar.exists,
    itemCount: statBar.itemCount,
    dividerCount: statBar.dividerCount,
    labels: statBar.labels,
    values: statBar.values,
    hasEmDashInBar: statBar.hasEmDash,
    allLabelsFound,
    forbiddenInBar,
    hasDigits,
    pageerror: errs.length,
  };
  await ctx.close();
}

// REGRESYON: konum rafı + PWA + i18n korundu mu (sayfa açılıyor + 0 error)
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

console.log("=== STAT BAR (3 item — çevrimiçi kaldırıldı) ===");
for (const loc of ["tr", "en", "ru", "ar"]) {
  const r = R.byLocale[loc];
  console.log(`  ${loc} dir=${r.dir} items=${r.itemCount} dividers=${r.dividerCount} digits=${r.hasDigits} labelsOK=${r.allLabelsFound} forbiddenInBar=${r.forbiddenInBar} hasEmDash=${r.hasEmDashInBar} pageerr=${r.pageerror}`);
  console.log(`    labels: ${(r.labels || []).join(" | ")}`);
}
console.log("\n=== REGRESYON (/ihaleler + konum rafı + SW) ===");
console.log(`  ihaleler=${R.regression.ihalelerLoaded} konum-rafi=${R.regression.hasNearbyShelf} SW=${R.regression.swRegCount} pageerr=${R.regression.pageerror}`);
console.log("\nDETAY: _audit/dil-anasayfa/result.json");
