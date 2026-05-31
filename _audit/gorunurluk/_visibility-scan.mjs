/**
 * Tam site görünürlük taraması — Anayasa boşluk maddesi.
 *
 * Her rota için: tüm <button>, <a> (önemli aksiyon), label/span (form içi)
 *   - text color + bg color (recursive parent fallback for transparent bg)
 *   - opacity
 *   - WCAG contrast ratio
 *   - "DÜŞÜK KONTRAST" eşik: 4.5 (normal text) veya 3.0 (büyük text ≥18px bold)
 *
 * Çıktı:
 *   - Her rota başına düşük-kontrast element listesi
 *   - Toplam tablo
 */

import { chromium, devices } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || "http://localhost:4173";
const OUT = resolve(__dirname);

const ROUTES = [
  "/", "/arama", "/ihaleler", "/borsa", "/borsa/sehir/istanbul",
  "/raporlar", "/harita", "/degerleme", "/ihale-ac",
  "/panel", "/profil", "/aramalarim", "/iletisim",
  "/giris", "/kayit", "/favoriler", "/bildirimler",
  "/nasil-calisir", "/hakkimizda", "/kunye", "/destek", "/sss",
  "/ilan/1", "/ilan/prop-010",
  "/satilik/istanbul", "/modul/bina-risk-sorgu",
];

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function scanPage(page) {
  return await page.evaluate(() => {
    function parseRGB(str) {
      const m = String(str).match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
      if (!m) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
    }
    function relLum({ r, g, b }) {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    function contrast(fg, bg) {
      const a = relLum(fg);
      const b = relLum(bg);
      const L = Math.max(a, b);
      const D = Math.min(a, b);
      return (L + 0.05) / (D + 0.05);
    }
    function effectiveBG(el) {
      // Parent zinciri tarayarak ilk opak (alpha>=0.5 ya da kalın renk) rengi bul
      let cur = el;
      let layered = { r: 0, g: 0, b: 0 };
      let aSum = 0;
      while (cur && aSum < 0.95) {
        const cs = getComputedStyle(cur);
        const c = parseRGB(cs.backgroundColor);
        if (c && c.a > 0) {
          const cw = c.a * (1 - aSum);
          layered.r += c.r * cw;
          layered.g += c.g * cw;
          layered.b += c.b * cw;
          aSum += cw;
        }
        cur = cur.parentElement;
      }
      if (aSum < 0.6) {
        // bodyBg fallback (#0A0E1A)
        const bw = 1 - aSum;
        layered.r += 10 * bw;
        layered.g += 14 * bw;
        layered.b += 26 * bw;
      }
      return { r: Math.round(layered.r), g: Math.round(layered.g), b: Math.round(layered.b) };
    }
    function inViewportLike(el) {
      const r = el.getBoundingClientRect();
      return r.width > 8 && r.height > 8 && r.top < window.innerHeight * 4;
    }
    function isLargeText(cs) {
      const size = parseFloat(cs.fontSize);
      const weight = parseInt(cs.fontWeight) || 400;
      return size >= 24 || (size >= 18.66 && weight >= 700);
    }

    const targets = [];
    document.querySelectorAll("button, a[href], label > span, h1, h2").forEach((el) => {
      if (!inViewportLike(el)) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") return;
      if (parseFloat(cs.opacity) < 0.1) return;
      const text = (el.textContent ?? "").trim().slice(0, 60);
      if (!text) return; // empty button (icon only) — skip
      const fg = parseRGB(cs.color);
      if (!fg) return;
      const bg = effectiveBG(el);
      const ratio = contrast(fg, bg);
      const large = isLargeText(cs);
      const target = large ? 3.0 : 4.5;
      if (ratio < target) {
        targets.push({
          tag: el.tagName.toLowerCase(),
          text,
          ratio: Math.round(ratio * 100) / 100,
          target,
          large,
          color: cs.color,
          bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`,
          rect: el.getBoundingClientRect().toJSON(),
          className: (el.className && typeof el.className === "string" ? el.className : "").slice(0, 200),
        });
      }
    });
    return targets;
  });
}

async function main() {
  await ensureDir(OUT);
  const browser = await chromium.launch();
  const report = {};

  for (const [vpName, vp, ua] of [
    ["desktop", { width: 1440, height: 900 }, "Mozilla/5.0 Chrome/120"],
    ["mobile", { width: 390, height: 844 }, devices["iPhone 13"].userAgent],
  ]) {
    console.log(`\n══════ ${vpName} ══════`);
    const ctx = await browser.newContext({
      viewport: vp,
      userAgent: ua,
      serviceWorkers: "block",  // PWA SW eski cache vermesin
      bypassCSP: true,
    });
    const page = await ctx.newPage();
    report[vpName] = {};
    for (const route of ROUTES) {
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(400);
        const low = await scanPage(page);
        report[vpName][route] = low;
        if (low.length === 0) {
          console.log(`  ✅ ${route} — temiz`);
        } else {
          console.log(`  ⚠️  ${route} — ${low.length} düşük kontrast`);
          low.slice(0, 3).forEach((t) =>
            console.log(`     ${t.tag}@${t.ratio} "${t.text.slice(0, 30)}" fg=${t.color} bg=${t.bg}`),
          );
        }
      } catch (e) {
        console.log(`  ❌ ${route} — ${String(e).slice(0, 80)}`);
        report[vpName][route] = { error: String(e).slice(0, 200) };
      }
    }
    await ctx.close();
  }

  await browser.close();
  await writeFile(resolve(OUT, "_visibility-result.json"), JSON.stringify(report, null, 2), "utf8");

  console.log("\n══════════════════════════════════");
  let totalLow = 0;
  let totalRoutes = 0;
  for (const vp of Object.keys(report)) {
    for (const route of Object.keys(report[vp])) {
      const v = report[vp][route];
      if (Array.isArray(v)) {
        totalLow += v.length;
        if (v.length > 0) totalRoutes++;
      }
    }
  }
  console.log(`Toplam düşük-kontrast: ${totalLow}`);
  console.log(`Etkilenen rota (her viewport ayrı): ${totalRoutes}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
