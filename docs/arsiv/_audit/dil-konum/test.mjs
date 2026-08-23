import { chromium } from "playwright";
import fs from "fs";
const BASE = "http://localhost:4173";
const OUT = "_audit/dil-konum";
const R = { grant: {}, deny: {}, kvkk: {}, regression: {} };
const b = await chromium.launch();
const IST = { latitude: 41.05, longitude: 29.0 }; // İstanbul Asya yakası (ilanlara yakın)

// ---- İZİN VER: 4 dil, mesafe + sıralama + screenshot + KVKK ----
for (const loc of ["tr","en","ru","ar"]) {
  const ctx = await b.newContext({ geolocation: IST, permissions: ["geolocation"], viewport:{width:1280,height:1400} });
  const p = await ctx.newPage();
  const errs=[]; p.on("pageerror", e=>errs.push(String(e)));
  await p.addInitScript((l)=>{try{localStorage.setItem("ihaleal_locale",l)}catch{}}, loc);
  await p.goto(BASE+"/ihaleler", {waitUntil:"networkidle"});
  await p.waitForTimeout(700);
  const dir = await p.evaluate(()=>document.documentElement.dir);
  // localStorage anahtarları (konum öncesi)
  const keysBefore = await p.evaluate(()=>Object.keys(localStorage));
  // "Yakınımdaki" butonunu bul + tıkla
  const btn = p.getByRole("button", { name: /Yakınımdaki|near me|рядом|قريبة/i }).first();
  const btnVisible = await btn.count() > 0;
  if (btnVisible) await btn.click();
  await p.waitForTimeout(1200);
  // mesafe rozetleri + sonuç sayısı
  const data = await p.evaluate(()=>{
    const badges = [...document.querySelectorAll("section")].some(s=>/km|км|كم/.test(s.textContent||""));
    const cards = document.querySelectorAll('section button[type="button"]');
    return { hasKmText: badges, sectionCardCount: cards.length };
  });
  // mesafe değerleri (rozetlerden)
  const kmValues = await p.evaluate(()=>{
    const t = document.body.innerText;
    const m = [...t.matchAll(/(\d+\.\d)\s*(?:km|км|كم)/g)].map(x=>parseFloat(x[1]));
    return m.slice(0,8);
  });
  const sorted = kmValues.length<2 || kmValues.every((v,i,a)=>i===0||a[i-1]<=v+0.05);
  const keysAfter = await p.evaluate(()=>Object.keys(localStorage));
  const newKeys = keysAfter.filter(k=>!keysBefore.includes(k));
  const locationLeak = keysAfter.some(k=>/lat|lng|geo|location|konum|coord|pos/i.test(k)) ||
    keysAfter.some(k=>{ try { return /41\.0|29\.0/.test(localStorage.getItem(k)||""); } catch { return false; } });
  await p.screenshot({ path:`${OUT}/yakinimdaki-${loc}.png`, fullPage:false });
  R.grant[loc] = { dir, btnVisible, hasKmText:data.hasKmText, kmValues, sorted, pageerror:errs.length };
  if (loc==="tr") R.kvkk = { keysBefore: keysBefore.length, newKeysAfterLocation: newKeys, locationLeak };
  await ctx.close();
}

// ---- İZİN REDDET: nazik fallback (permission verilmez) ----
{
  const ctx = await b.newContext({ viewport:{width:1280,height:900} }); // geolocation izni YOK
  const p = await ctx.newPage();
  const errs=[]; p.on("pageerror", e=>errs.push(String(e)));
  await p.addInitScript(()=>{try{localStorage.setItem("ihaleal_locale","tr")}catch{}});
  await p.context().clearPermissions();
  await p.goto(BASE+"/ihaleler", {waitUntil:"networkidle"});
  await p.waitForTimeout(500);
  const btn = p.getByRole("button", { name: /Yakınımdaki/i }).first();
  if (await btn.count()) await btn.click();
  await p.waitForTimeout(1500);
  const fallback = await p.evaluate(()=>/izni verilmedi|şehir seçerek/i.test(document.body.innerText));
  R.deny = { gentleFallback: fallback, pageerror: errs.length };
  await ctx.close();
}

// ---- REGRESYON: mevcut shelf/auctions + 0 pageerror ----
{
  const ctx = await b.newContext({ viewport:{width:1280,height:900} });
  const p = await ctx.newPage();
  const errs=[]; p.on("pageerror", e=>errs.push(String(e)));
  await p.goto(BASE+"/ihaleler", {waitUntil:"networkidle"});
  await p.waitForTimeout(600);
  const reg = await p.evaluate(()=>({
    shelves: /Bitmeye Yaklaşan|Yakında Açılacak/.test(document.body.innerText),
    borsa: document.querySelectorAll("table, [class*='borsa'], [class*='terminal']").length>0,
    bodyLen: document.body.innerText.length,
  }));
  R.regression = { ...reg, pageerror: errs.length };
  await ctx.close();
}

await b.close();
fs.writeFileSync(`${OUT}/result.json`, JSON.stringify(R,null,2));
console.log("=== İZİN VER (4 dil): mesafe + sıralama + 0 hata ===");
for (const loc of ["tr","en","ru","ar"]){ const r=R.grant[loc]; console.log(`  ${loc} dir=${r.dir} buton=${r.btnVisible} kmRozet=${r.hasKmText} mesafeler=[${r.kmValues.join(", ")}] sıralı=${r.sorted} pageerr=${r.pageerror}`); }
console.log("\n=== İZİN REDDET: nazik fallback ===");
console.log(`  fallback=${R.deny.gentleFallback} pageerr=${R.deny.pageerror} → ${R.deny.gentleFallback?"✓":"✗"}`);
console.log("\n=== KVKK: konum localStorage'a YAZILMADI mı ===");
console.log(`  yeni anahtarlar=[${R.kvkk.newKeysAfterLocation.join(", ")}] konumSızıntısı=${R.kvkk.locationLeak} → ${!R.kvkk.locationLeak?"✓ konum saklanmıyor":"✗ SIZINTI"}`);
console.log("\n=== REGRESYON ===");
console.log(`  shelf=${R.regression.shelves} borsa=${R.regression.borsa} bodyLen=${R.regression.bodyLen} pageerr=${R.regression.pageerror}`);
