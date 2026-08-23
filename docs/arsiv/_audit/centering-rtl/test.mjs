// CENTERING/ARBITRARY RTL TURU — kanıt testi (FAZ 2 finali)
// 1) NEGATİF KONTROL: merkez idiom (left-1/2, left-[50%]+translate) AR'da MERKEZDE kalır.
// 2) Orb logical-arbitrary (-start/-end/start-[%]) LTR=fiziksel / RTL=aynalı.
// 3) TAŞMA: gerçek homepage AR'da yatay scroll YOK (overflow-hidden orb'ları tutar).
// 4) SMOKE: 0 pageerror LTR+AR.
import { chromium } from "playwright";
import fs from "fs";
const BASE = "http://localhost:4173";
const OUT = "_audit/centering-rtl";
const R = { negativeControl: {}, orb: {}, overflow: {}, smoke: {} };
const b = await chromium.launch();

// ---- SENTETIK: merkez idiom (negatif kontrol) + orb aynalama ----
async function synth(dir) {
  const ctx = await b.newContext({ viewport: { width: 1000, height: 700 } });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const d = await p.evaluate((dir) => {
    document.documentElement.dir = dir;
    const VW = 1000;
    function box(html, parentW) {
      const par = document.createElement("div");
      par.style.cssText = `position:relative;width:${parentW}px;height:100px`;
      par.innerHTML = html;
      document.body.appendChild(par);
      const el = par.firstElementChild;
      const er = el.getBoundingClientRect(), pr = par.getBoundingClientRect();
      const r = { centerXrel: Math.round(er.left + er.width / 2 - pr.left), leftRel: Math.round(er.left - pr.left), rightRel: Math.round(pr.right - er.right) };
      par.remove();
      return r;
    }
    return {
      // merkez idiom 1: left-1/2 + -translate-x-1/2 → parent merkezinde (500)
      center1: box('<div class="absolute left-1/2 -translate-x-1/2" style="width:40px;height:20px"></div>', 1000),
      // merkez idiom 2: left-[50%] + translate-x-[-50%] (dialog/alert) → merkez
      center2: box('<div class="absolute left-[50%] translate-x-[-50%]" style="width:40px;height:20px"></div>', 1000),
      // orb: -start-[20%] (parent 400 → -80px) LTR sol-dışı / RTL sağ-dışı
      orb1: box('<div class="absolute -start-[20%]" style="width:50px;height:20px"></div>', 400),
      // orb: start-[30%] (parent 400 → 120px) LTR sol / RTL sağ
      orb3: box('<div class="absolute start-[30%]" style="width:50px;height:20px"></div>', 400),
    };
  }, dir);
  await ctx.close();
  return d;
}
R.negativeControl.ltr = await synth("ltr");
R.negativeControl.rtl = await synth("rtl");

// ---- GERÇEK homepage: taşma + smoke (LTR + AR) ----
for (const loc of ["tr", "ar"]) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.addInitScript((l) => { try { localStorage.setItem("ihaleal_locale", l); } catch {} }, loc);
  await p.goto(BASE + "/", { waitUntil: "networkidle" }).catch((e) => errs.push("goto:" + e.message));
  await p.waitForTimeout(900);
  const ov = await p.evaluate(() => ({
    dir: document.documentElement.dir,
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollW: document.body.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
  R.overflow[loc] = ov;
  R.smoke[loc] = { pageerrors: errs.length, sample: errs.slice(0, 2) };
  // mobil de (375) taşma
  await p.setViewportSize({ width: 375, height: 720 });
  await p.waitForTimeout(400);
  const ovm = await p.evaluate(() => ({ horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  R.overflow[loc + "_mobile"] = ovm;
  await ctx.close();
}

await b.close();
fs.writeFileSync(`${OUT}/result.json`, JSON.stringify(R, null, 2));

// ---- ÖZET ----
const cl = R.negativeControl.ltr, cr = R.negativeControl.rtl;
console.log("=== 1) NEGATİF KONTROL: merkez idiom AR'da MERKEZDE kalır mı (turun ana kanıtı) ===");
function ctr(name, l, r) {
  const lc = l.centerXrel, rc = r.centerXrel;
  const ok = Math.abs(lc - 500) <= 2 && Math.abs(rc - 500) <= 2;
  console.log(`  ${name.padEnd(10)} LTR merkez=${lc}  RTL merkez=${rc}  (beklenen 500) → ${ok ? "✓ HER İKİSİ MERKEZDE (dokunulmadı)" : "✗"}`);
}
ctr("left-1/2", cl.center1, cr.center1);
ctr("left-[50%]", cl.center2, cr.center2);
console.log("\n=== 2) ORB logical-arbitrary: LTR=sol / RTL=sağ (aynalandı) ===");
function mir(name, l, r) {
  // LTR'de leftRel küçük (sola yakın/dışı), RTL'de rightRel aynı değere kayar
  const mirrored = Math.abs(l.leftRel - r.rightRel) <= 2;
  console.log(`  ${name.padEnd(8)} LTR(left=${l.leftRel},right=${l.rightRel})  RTL(left=${r.leftRel},right=${r.rightRel}) → ${mirrored ? "✓ aynalandı (LTR.left==RTL.right)" : "✗"}`);
}
mir("-start20", cl.orb1, cr.orb1);
mir("start30", cl.orb3, cr.orb3);
console.log("\n=== 3) TAŞMA KONTROLÜ (gerçek homepage, yatay scroll OLMAMALI) ===");
for (const k of ["tr", "ar", "tr_mobile", "ar_mobile"]) {
  const o = R.overflow[k];
  console.log(`  ${k.padEnd(10)} overflow=${o.horizontalOverflow}  (scrollW=${o.scrollWidth} clientW=${o.clientWidth}) → ${o.horizontalOverflow ? "✗ TAŞMA VAR" : "✓ taşma yok"}`);
}
console.log("\n=== 4) SMOKE (0 pageerror) ===");
for (const k of ["tr", "ar"]) console.log(`  ${k}: pageerror=${R.smoke[k].pageerrors} ${R.smoke[k].sample.join(";")}`);
console.log("\nDETAY: _audit/centering-rtl/result.json");
