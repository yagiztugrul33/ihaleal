// UI-PRIMITIVE RTL TURU — kanıt testi
// Strateji: sandbox'ta Sheet/dropdown auth/veri-kapılı → gerçek derlenmiş CSS'i
// RUNTIME'da sentetik DOM ile test et (logical/rtl: sınıfları gerçek elemana
// uygula, LTR=fiziksel / RTL=aynalı computed-style doğrula). + smoke (0 pageerror)
// + frozen navbar (DirectionProvider global bozmadı).
import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:4173";
const OUT = "_audit/ui-primitive-rtl";
const results = { smoke: {}, synthetic: {}, frozen: {}, errors: [] };

function pad(s, n) { return String(s).padEnd(n); }

async function collectErrors(page) {
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push("console:" + m.text()); });
  return errs;
}

const browser = await chromium.launch();

// ---------- 1) SMOKE: 0 pageerror, LTR + AR, DirectionProvider güvenli ----------
const smokePages = ["/", "/kat-karsiligi/studio", "/ihaleler"];
for (const loc of ["tr", "ar"]) {
  for (const path of smokePages) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const errs = await collectErrors(page);
    await page.addInitScript((l) => {
      try { localStorage.setItem("ihaleal_locale", l); } catch {}
    }, loc);
    await page.goto(BASE + path, { waitUntil: "networkidle" }).catch((e) => errs.push("goto:" + e.message));
    await page.waitForTimeout(800);
    const dir = await page.evaluate(() => document.documentElement.dir);
    const key = `${loc}:${path}`;
    results.smoke[key] = { dir, pageerrors: errs.filter((e) => !e.startsWith("console:")).length, anyErr: errs.length, sample: errs.slice(0, 2) };
    await ctx.close();
  }
}

// ---------- 2) SENTETIK: gerçek CSS ile logical/rtl: sınıf davranışı ----------
// Sheet side="right" (end-0 + border-s + rtl slide) + Toast (animate-slide-in-right)
// + menü içi (start-2 indikatör, ms-auto, end-2 select-check) computed-style.
async function syntheticFor(dir) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const data = await page.evaluate((d) => {
    document.documentElement.dir = d;
    function probe(html) {
      const host = document.createElement("div");
      host.innerHTML = html;
      document.body.appendChild(host);
      const el = host.firstElementChild;
      const cs = getComputedStyle(el);
      const r = {
        insetInlineEnd: cs.insetInlineEnd,
        insetInlineStart: cs.insetInlineStart,
        left: cs.left, right: cs.right,
        borderLeftWidth: cs.borderLeftWidth,
        borderRightWidth: cs.borderRightWidth,
        marginLeft: cs.marginLeft, marginRight: cs.marginRight,
        paddingLeft: cs.paddingLeft, paddingRight: cs.paddingRight,
        textAlign: cs.textAlign,
        animationName: cs.animationName,
      };
      host.remove();
      return r;
    }
    return {
      // Sheet side=right gövdesi: end-0 + border-s (Sheet primitive className'inden)
      sheetRight: probe('<div class="fixed end-0 border-s w-3/4" style="position:fixed;border-style:solid"></div>'),
      // Sheet close: top-4 end-4
      sheetClose: probe('<div class="absolute end-4" style="position:absolute"></div>'),
      // Toast: animate-slide-in-right (RTL'de animation-name slide-in-left olmalı)
      toast: probe('<div class="animate-slide-in-right"></div>'),
      // menü check indikatörü: absolute start-2
      menuIndicator: probe('<div class="absolute start-2" style="position:absolute"></div>'),
      // select check: absolute end-2
      selectCheck: probe('<div class="absolute end-2" style="position:absolute"></div>'),
      // kısayol: ms-auto
      shortcut: probe('<div class="ms-auto" style="display:block"></div>'),
      // inset item: ps-8 / pe-2
      insetItem: probe('<div class="ps-8 pe-2"></div>'),
      // table header: text-start
      tableHead: probe('<div class="text-start"></div>'),
    };
  }, dir);
  await ctx.close();
  return data;
}
results.synthetic.ltr = await syntheticFor("ltr");
results.synthetic.rtl = await syntheticFor("rtl");

// ---------- 3) FROZEN navbar LTR (DirectionProvider global layout bozmadı) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("ihaleal_locale", "tr"); } catch {} });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const nav = page.locator("nav").first();
  if (await nav.count()) {
    await nav.screenshot({ path: `${OUT}/navbar-ltr-after.png`, animations: "disabled" });
    results.frozen.navbarShot = "navbar-ltr-after.png";
  }
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/result.json`, JSON.stringify(results, null, 2));

// ---------- ÖZET ----------
console.log("\n=== SMOKE (0 pageerror bekleniyor) ===");
for (const [k, v] of Object.entries(results.smoke)) {
  console.log(`${pad(k, 32)} dir=${pad(v.dir, 4)} pageerror=${v.pageerrors} anyErr=${v.anyErr}${v.sample.length ? " | " + v.sample.join(" ; ") : ""}`);
}
const L = results.synthetic.ltr, R = results.synthetic.rtl;
console.log("\n=== SENTETIK (LTR=fiziksel / RTL=aynalı) ===");
function row(name, lv, rv, expectFlip) {
  const flipped = lv !== rv;
  const ok = expectFlip ? flipped : true;
  console.log(`${pad(name, 18)} LTR=${pad(lv, 22)} RTL=${pad(rv, 22)} ${expectFlip ? (flipped ? "✓aynalandı" : "✗AYNALANMADI") : ""}`);
  return ok;
}
console.log("-- Sheet side=right: end-0 --");
row("  insetEnd", L.sheetRight.insetInlineEnd, R.sheetRight.insetInlineEnd, false);
row("  border-s L/R", `${L.sheetRight.borderLeftWidth}/${L.sheetRight.borderRightWidth}`, `${R.sheetRight.borderLeftWidth}/${R.sheetRight.borderRightWidth}`, true);
console.log("-- Sheet close: end-4 (left/right) --");
row("  left/right", `${L.sheetClose.left}/${L.sheetClose.right}`, `${R.sheetClose.left}/${R.sheetClose.right}`, true);
console.log("-- Toast animationName --");
row("  anim", L.toast.animationName, R.toast.animationName, true);
console.log("-- menü start-2 indikatör (left/right) --");
row("  left/right", `${L.menuIndicator.left}/${L.menuIndicator.right}`, `${R.menuIndicator.left}/${R.menuIndicator.right}`, true);
console.log("-- select end-2 check (left/right) --");
row("  left/right", `${L.selectCheck.left}/${L.selectCheck.right}`, `${R.selectCheck.left}/${R.selectCheck.right}`, true);
console.log("-- ms-auto kısayol (mL/mR) --");
row("  margin", `${L.shortcut.marginLeft}/${L.shortcut.marginRight}`, `${R.shortcut.marginLeft}/${R.shortcut.marginRight}`, true);
console.log("-- ps-8 pe-2 inset (pL/pR) --");
row("  padding", `${L.insetItem.paddingLeft}/${L.insetItem.paddingRight}`, `${R.insetItem.paddingLeft}/${R.insetItem.paddingRight}`, true);
console.log("-- text-start --");
row("  align", L.tableHead.textAlign, R.tableHead.textAlign, true);
console.log("\nDETAY: _audit/ui-primitive-rtl/result.json");
