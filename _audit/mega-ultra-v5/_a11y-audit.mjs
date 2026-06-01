/**
 * v5 CEPHE 2 — Erişilebilirlik audit.
 *
 * Çıkarır:
 *  - Buton aria-label/text eksikleri (icon-only butonlar)
 *  - Touch target küçük (<44x44) olan butonlar
 *  - Heading sequence (h1→h2→h3) atlama
 *  - Image alt missing/empty
 *  - Identical link metni (3+ aynı text, farklı href)
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;
const BASE = "http://localhost:4173";

await mkdir(OUT, { recursive: true });

const ROUTES = [
  "/", "/arama", "/ihaleler", "/borsa", "/raporlar", "/harita", "/degerleme",
  "/ihale-ac", "/panel", "/profil", "/aramalarim", "/iletisim", "/giris",
  "/kayit", "/favoriler", "/bildirimler", "/nasil-calisir", "/hakkimizda",
  "/kunye", "/destek", "/sss", "/ilan/2", "/arastirma/ges",
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  serviceWorkers: "block",
});
const page = await ctx.newPage();

const report = {};

for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => {
    // 1. Icon-only butonlar — aria-label kontrol
    const buttons = Array.from(document.querySelectorAll("button"));
    const iconOnly = buttons.filter((b) => {
      const txt = (b.textContent || "").trim();
      const aria = b.getAttribute("aria-label");
      const title = b.getAttribute("title");
      return !txt && !aria && !title;
    });
    // 2. Touch target — width × height < 44 × 44
    const tooSmall = buttons.filter((b) => {
      const r = b.getBoundingClientRect();
      return r.width > 4 && r.height > 4 && (r.width < 44 || r.height < 44);
    }).slice(0, 10); // limit
    // 3. Heading sequence
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
    const seq = headings.map((h) => parseInt(h.tagName.slice(1)));
    const jumps = [];
    for (let i = 1; i < seq.length; i++) {
      if (seq[i] > seq[i - 1] + 1) {
        jumps.push({ from: `h${seq[i - 1]}`, to: `h${seq[i]}`, text: headings[i].textContent?.slice(0, 40) });
      }
    }
    // 4. Image alt
    const imgs = Array.from(document.querySelectorAll("img"));
    const noAlt = imgs.filter((i) => !i.hasAttribute("alt"));
    const emptyAlt = imgs.filter((i) => i.getAttribute("alt") === "" && i.getAttribute("role") !== "presentation");
    // 5. Identical link text (3+ aynı text, farklı href)
    const anchors = Array.from(document.querySelectorAll("a[href]"));
    const textMap = new Map();
    for (const a of anchors) {
      const t = (a.textContent || "").trim();
      const h = a.getAttribute("href") || "";
      if (!t || t.length > 60) continue;
      if (!textMap.has(t)) textMap.set(t, new Set());
      textMap.get(t).add(h);
    }
    const dupLinks = [];
    for (const [t, hrefs] of textMap) {
      if (hrefs.size >= 3) dupLinks.push({ text: t, count: hrefs.size });
    }
    return {
      iconOnlyButtons: iconOnly.length,
      iconOnlySamples: iconOnly.slice(0, 3).map((b) => b.outerHTML.slice(0, 100)),
      tooSmall: tooSmall.length,
      tooSmallSamples: tooSmall.slice(0, 3).map((b) => ({
        text: (b.textContent || "").slice(0, 30),
        w: Math.round(b.getBoundingClientRect().width),
        h: Math.round(b.getBoundingClientRect().height),
      })),
      headingJumps: jumps,
      noAltImgs: noAlt.length,
      emptyAltImgs: emptyAlt.length,
      duplicateLinks: dupLinks,
    };
  });
  report[route] = data;
  console.log(`${route}: iconOnly=${data.iconOnlyButtons} small=${data.tooSmall} hJumps=${data.headingJumps.length} noAlt=${data.noAltImgs}`);
}

await writeFile(resolve(OUT, "a11y-result.json"), JSON.stringify(report, null, 2), "utf8");

const summary = {
  totalIconOnly: Object.values(report).reduce((a, b) => a + b.iconOnlyButtons, 0),
  totalSmall: Object.values(report).reduce((a, b) => a + b.tooSmall, 0),
  totalHJumps: Object.values(report).reduce((a, b) => a + b.headingJumps.length, 0),
  totalNoAlt: Object.values(report).reduce((a, b) => a + b.noAltImgs, 0),
  totalDupLinks: Object.values(report).reduce((a, b) => a + b.duplicateLinks.length, 0),
};
console.log("\n══════ ÖZET ══════");
console.log("Aria-label eksik (icon-only):", summary.totalIconOnly);
console.log("Touch target küçük (<44):", summary.totalSmall);
console.log("Heading hierarchy jump:", summary.totalHJumps);
console.log("Alt eksik:", summary.totalNoAlt);
console.log("Yinelenen link metni:", summary.totalDupLinks);

await ctx.close();
await browser.close();
