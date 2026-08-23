/**
 * /degerleme görünürlük inceleme — Ne Kadar Eder? + Adres notu fix öncesi.
 *
 * Her şüpheli element için:
 *   - getBoundingClientRect (yer, boyut)
 *   - getComputedStyle (color, backgroundColor, opacity, filter, textShadow)
 *   - parent zinciri ilk 3 katman aynı bilgilerle
 *   - WCAG contrast ratio hesaplama
 */

import { chromium } from "playwright";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:4173";

function relLuminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function parseRGB(str) {
  const m = String(str).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function contrast(fg, bg) {
  const a = relLuminance(fg);
  const b = relLuminance(bg);
  const L = Math.max(a, b);
  const D = Math.min(a, b);
  return (L + 0.05) / (D + 0.05);
}

const browser = await chromium.launch();

for (const [name, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/degerleme`, { waitUntil: "networkidle" });

  // h1 + buton + "Adres notu" label
  const data = await page.evaluate(() => {
    const inspect = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? "").trim().slice(0, 60),
        rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        color: cs.color,
        bg: cs.backgroundColor,
        opacity: cs.opacity,
        filter: cs.filter,
        textShadow: cs.textShadow,
        bgImage: cs.backgroundImage,
        mixBlendMode: cs.mixBlendMode,
      };
    };
    const h1 = document.querySelector("h1");
    const submit = Array.from(document.querySelectorAll("button[type='submit']")).find(
      (b) => b.textContent && b.textContent.includes("Ne Kadar Eder"),
    );
    const addressSpan = Array.from(document.querySelectorAll("label > span")).find(
      (s) => s.textContent && s.textContent.includes("Adres notu"),
    );
    const main = document.querySelector("main") || document.body;
    const form = document.querySelector("form");

    const chain = (el, depth = 3) => {
      const arr = [];
      let cur = el;
      while (cur && depth-- > 0) {
        arr.push(inspect(cur));
        cur = cur.parentElement;
      }
      return arr;
    };

    return {
      h1: inspect(h1),
      h1Chain: chain(h1, 4),
      submit: inspect(submit),
      submitChain: chain(submit, 4),
      addressSpan: inspect(addressSpan),
      addressChain: chain(addressSpan, 4),
      main: inspect(main),
      form: inspect(form),
      bodyBg: getComputedStyle(document.body).backgroundColor,
    };
  });

  console.log(`\n══════ ${name} (${viewport.width}×${viewport.height}) ══════`);
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      console.log(`  ${k}:`);
      v.forEach((el, i) => console.log(`    [${i}] ${el?.tag} color=${el?.color} bg=${el?.bg} filter=${el?.filter} opacity=${el?.opacity}`));
    } else if (v && typeof v === "object") {
      console.log(`  ${k}: tag=${v.tag} text="${v.text}"`);
      console.log(`     color=${v.color} bg=${v.bg} bgImage=${v.bgImage?.slice(0, 50)} filter=${v.filter}`);
      console.log(`     opacity=${v.opacity} textShadow=${v.textShadow} blend=${v.mixBlendMode}`);
      console.log(`     rect=${JSON.stringify(v.rect)}`);
    } else {
      console.log(`  ${k}: ${v}`);
    }
  }

  // Contrast oranı hesabı: submit button text vs button bg
  const subFG = parseRGB(data.submit?.color);
  const subBG = parseRGB(data.submit?.bg) || parseRGB(data.submitChain?.[1]?.bg);
  const adrFG = parseRGB(data.addressSpan?.color);
  const adrBG = parseRGB(data.addressChain?.[2]?.bg) || parseRGB(data.form?.bg);
  if (subFG && subBG) console.log(`  ▶ Submit kontrast: ${contrast(subFG, subBG).toFixed(2)} (target ≥ 4.5)`);
  if (adrFG && adrBG) console.log(`  ▶ Adres notu kontrast: ${contrast(adrFG, adrBG).toFixed(2)} (target ≥ 4.5)`);

  // Screenshot
  const png = resolve(__dirname, `degerleme-before-${name}.png`);
  await page.screenshot({ path: png, fullPage: false });
  // İkinci screenshot: form alanına scroll
  await page.evaluate(() => {
    const f = document.querySelector("form");
    if (f) f.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await page.waitForTimeout(300);
  const png2 = resolve(__dirname, `degerleme-form-before-${name}.png`);
  await page.screenshot({ path: png2, fullPage: false });
  console.log(`  📸 ${png}`);
  console.log(`  📸 ${png2}`);

  await ctx.close();
}
await browser.close();
