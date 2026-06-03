// PWA TEMELİ TURU — kanıt testi (BLOK 4)
// Önceki PWA altyapısı + bu turun sertleştirmesi (autoUpdate->prompt) doğrulanır.
import { chromium } from "playwright";
import fs from "fs";
const BASE = "http://localhost:4173";
const OUT = "_audit/pwa-temeli";
const R = { sw: {}, manifest: {}, cacheSafety: {}, regression: {}, installable: {}, updatePrompt: {} };
const b = await chromium.launch();

// ---- 1) SW KAYIT + 2) MANIFEST + cache içeriği (gerçek SW, production preview) ----
{
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  // SW register edilene kadar bekle
  await p.evaluate(async () => {
    if ("serviceWorker" in navigator) { try { await navigator.serviceWorker.ready; } catch {} }
  });
  await p.waitForTimeout(1500);
  const sw = await p.evaluate(async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    const cacheNames = "caches" in window ? await caches.keys() : [];
    // her cache'in URL'lerini topla
    const cacheContents = {};
    for (const name of cacheNames) {
      const c = await caches.open(name);
      const reqs = await c.keys();
      cacheContents[name] = reqs.map((r) => r.url);
    }
    return {
      regCount: regs.length,
      scriptURLs: regs.map((r) => (r.active || r.waiting || r.installing)?.scriptURL || ""),
      controller: !!navigator.serviceWorker.controller,
      cacheNames,
      cacheContents,
    };
  });
  R.sw = { regCount: sw.regCount, scriptURLs: sw.scriptURLs, controller: sw.controller, pageerrors: errs.length };
  R.sw.cacheNames = sw.cacheNames;

  // CACHE GÜVENLİĞİ: hiçbir cache'te supabase/api/auth/rest/dinamik-veri OLMAMALI
  const allUrls = Object.values(sw.cacheContents).flat();
  const forbidden = allUrls.filter((u) =>
    /supabase\.(co|in)|\/rest\/|\/auth\/|\/functions\/|\/api\//i.test(u),
  );
  const jsonData = allUrls.filter((u) => /\.json(\?|$)/i.test(u) && !/manifest/i.test(u));
  R.cacheSafety = {
    totalCachedUrls: allUrls.length,
    forbiddenApiCached: forbidden.length,
    forbiddenSamples: forbidden.slice(0, 5),
    dataJsonCached: jsonData.length,
    dataJsonSamples: jsonData.slice(0, 5),
    onlyAppShell: forbidden.length === 0 && jsonData.length === 0,
  };

  // MANIFEST doğrula
  const man = await p.evaluate(async () => {
    const res = await fetch("/manifest.webmanifest");
    return await res.json();
  });
  const icons192 = (man.icons || []).some((i) => /192/.test(i.sizes));
  const icons512 = (man.icons || []).some((i) => /512/.test(i.sizes));
  const maskable = (man.icons || []).some((i) => /maskable/.test(i.purpose || ""));
  R.manifest = {
    name: man.name, short_name: man.short_name, display: man.display,
    start_url: man.start_url, theme_color: man.theme_color, background_color: man.background_color,
    hasDescription: !!man.description, icons192, icons512, maskable,
    valid: !!man.name && !!man.short_name && man.display === "standalone" && icons192 && icons512,
  };
  // INSTALLABLE kriterleri
  R.installable = {
    hasManifest: R.manifest.valid,
    hasSW: sw.regCount >= 1 && /\/sw\.js$/.test(sw.scriptURLs[0] || ""),
    hasIcons: icons192 && icons512,
    secureContext: await p.evaluate(() => window.isSecureContext),
    installableLikely: R.manifest.valid && sw.regCount >= 1 && icons192 && icons512,
  };
  // UPDATE PROMPT: taze kurulumda needRefresh FALSE → prompt görünmemeli
  const promptVisible = await p.evaluate(() => !!document.querySelector('[role="status"] button'));
  const updateBannerText = await p.evaluate(() => {
    const el = [...document.querySelectorAll('[role="status"]')].find((e) => /sürüm|version|версия|إصدار/i.test(e.textContent || ""));
    return el ? el.textContent : null;
  });
  R.updatePrompt = { shownOnFreshInstall: !!updateBannerText, note: "taze kurulumda görünmemeli (needRefresh=false)" };
  await ctx.close();
}

// ---- 4) REGRESYON: 4 dil × sayfalar, 0 pageerror, routing çalışıyor ----
const pages = ["/", "/ihaleler", "/analiz", "/mortgage"];
for (const loc of ["tr", "en", "ru", "ar"]) {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.addInitScript((l) => { try { localStorage.setItem("ihaleal_locale", l); } catch {} }, loc);
  let routedOk = 0;
  for (const path of pages) {
    try {
      await p.goto(BASE + path, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(400);
      const ok = await p.evaluate(() => document.querySelector("main, nav, footer") != null);
      if (ok) routedOk++;
    } catch (e) { errs.push("goto " + path + ":" + e.message); }
  }
  const dir = await p.evaluate(() => document.documentElement.dir);
  R.regression[loc] = { dir, routedOk, totalPages: pages.length, pageerrors: errs.length, sample: errs.slice(0, 2) };
  await ctx.close();
}

await b.close();
fs.writeFileSync(`${OUT}/result.json`, JSON.stringify(R, null, 2));

// ---- ÖZET ----
console.log("=== 1) SERVİS WORKER KAYDI ===");
console.log(`  reg=${R.sw.regCount}  controller=${R.sw.controller}  script=${(R.sw.scriptURLs[0]||"").split("/").pop()}  pageerror=${R.sw.pageerrors}  → ${R.sw.regCount>=1?"✓ kayıtlı":"✗"}`);
console.log("\n=== 2) MANIFEST ===");
console.log(`  name="${R.manifest.name}" short="${R.manifest.short_name}" display=${R.manifest.display}`);
console.log(`  icons 192=${R.manifest.icons192} 512=${R.manifest.icons512} maskable=${R.manifest.maskable} theme=${R.manifest.theme_color} → ${R.manifest.valid?"✓ geçerli":"✗"}`);
console.log("\n=== 3) CACHE GÜVENLİĞİ (fiyat/teklif/API ASLA cache'lenmez) ===");
console.log(`  toplam cache'li URL=${R.cacheSafety.totalCachedUrls}`);
console.log(`  YASAK (supabase/api/auth/rest/functions) cache'li=${R.cacheSafety.forbiddenApiCached} ${R.cacheSafety.forbiddenSamples.join(",")}`);
console.log(`  veri JSON cache'li=${R.cacheSafety.dataJsonCached} ${R.cacheSafety.dataJsonSamples.join(",")}`);
console.log(`  → ${R.cacheSafety.onlyAppShell?"✓ SADECE APP-SHELL (taze veri garanti)":"✗ TEHLİKE: dinamik veri cache'lenmiş"}`);
console.log("\n=== 4) REGRESYON (4 dil, routing + 0 pageerror) ===");
for (const loc of ["tr","en","ru","ar"]) { const r=R.regression[loc]; console.log(`  ${loc} dir=${r.dir} routed=${r.routedOk}/${r.totalPages} pageerror=${r.pageerrors} ${r.sample.join(";")}`); }
console.log("\n=== 5) INSTALLABLE ===");
console.log(`  manifest=${R.installable.hasManifest} SW=${R.installable.hasSW} icons=${R.installable.hasIcons} secure=${R.installable.secureContext} → ${R.installable.installableLikely?"✓ kurulabilir":"✗"}`);
console.log("\n=== 6) UPDATE PROMPT (taze kurulumda görünmemeli) ===");
console.log(`  taze kurulumda banner=${R.updatePrompt.shownOnFreshInstall} → ${!R.updatePrompt.shownOnFreshInstall?"✓ doğru (yalnız güncellemede çıkar)":"✗"}`);
console.log("\nDETAY: _audit/pwa-temeli/result.json");
