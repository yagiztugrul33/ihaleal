/**
 * PDF → PNG renderer (Web Claude görsel kanıt için).
 *
 * pdf-to-png-converter ile her sayfayı ayrı PNG'ye dökerek
 * Roboto TR font, layout, tablo, disclaimer yerleşimini görsel olarak kanıtlar.
 */

import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { pdfToPng } = require("pdf-to-png-converter");

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = __dirname;

const TARGETS = [
  { src: "pdf-_ilan_2.pdf", prefix: "sayfa-villa" },
  { src: "pdf-_ilan_4.pdf", prefix: "sayfa-rezidans" },
];

for (const t of TARGETS) {
  console.log(`\n══════ ${t.src} ══════`);
  const pages = await pdfToPng(resolve(OUT, t.src), {
    outputFolder: OUT,
    outputFileMaskFunc: (p) => `${t.prefix}-${p}.png`,
    viewportScale: 2.0, // 2x = ~144 DPI (yüksek çözünürlük)
  });
  for (const p of pages) {
    console.log(`  📸 ${p.path} (page ${p.pageNumber}, ${p.content.length} bytes)`);
  }
}

console.log("\nBitti.");
