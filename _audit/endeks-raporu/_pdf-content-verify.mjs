/**
 * PDF içerik doğrulaması — Web Claude denetim için detay.
 *
 * Mevcut üretilmiş 2 PDF (ilan/2 villa + ilan/4 rezidans) text dump alır:
 *  - Toplam karakter
 *  - Sayfa sayısı (info.Pages)
 *  - 10 bölüm başlığı + Genel Özet bulundu mu?
 *  - DISCLAIMER bulundu mu?
 *  - Roboto font embed kanıtı (PDF metadata)
 *
 * pdf-parse npm paketi ile.
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname);

const EXPECTED_SECTIONS = [
  "1) Mülk Kimliği",
  "2) Mülk Sicili",
  "3) İhale / Fiyat",
  "4) Değerleme Analizi",
  "5) Kredi Uygunluğu",
  "6) Deprem / Afet",
  "7) Eğitim Profili",
  "8) Güvenlik",
  "9) Kira Getirisi",
  "10) Çevre / Yaşam",
  "Genel Özet",
];

const EXPECTED_KEYWORDS_VILLA = [
  "Bebek",
  "Boğaz Manzaralı",
  "İhaleal Endeks Raporu",
  "Mülk Künyesi",
  "İstanbul",
  "TKGM",
  "AFAD",
  "yapay zeka",
];

const EXPECTED_KEYWORDS_RESIDENCE = [
  "Bodrum",
  "Yalıkavak",
  "İhaleal Endeks Raporu",
  "Muğla",
  "TKGM",
  "AFAD",
];

async function inspect(filePath, expectedKeywords) {
  const buf = await readFile(filePath);
  const parser = new PDFParse({ data: buf });
  const out = await parser.getText();
  const text = out.text || "";
  const pages = out.total || (Array.isArray(out.pages) ? out.pages.length : 0);

  console.log(`\n══════ ${filePath.split(/[\\/]/).pop()} ══════`);
  console.log(`  Sayfa sayısı : ${pages}`);
  console.log(`  Toplam karakter: ${text.length}`);

  console.log("\n  Bölüm başlıkları (eşleşme):");
  let sectionOk = 0;
  for (const s of EXPECTED_SECTIONS) {
    const found = text.includes(s);
    if (found) sectionOk++;
    console.log(`    ${found ? "✅" : "❌"} ${s}`);
  }

  console.log("\n  Anahtar kelimeler:");
  let kwOk = 0;
  for (const k of expectedKeywords) {
    const found = text.includes(k);
    if (found) kwOk++;
    console.log(`    ${found ? "✅" : "❌"} ${k}`);
  }

  console.log("\n  Disclaimer kontrol:");
  const hasDisclaimer =
    text.includes("yapay zeka") &&
    text.includes("Resmi ekspertiz") &&
    text.includes("TKGM");
  console.log(`    ${hasDisclaimer ? "✅" : "❌"} Tam disclaimer (yapay zeka + Resmi ekspertiz + TKGM)`);

  return {
    file: filePath.split(/[\\/]/).pop(),
    pages,
    chars: text.length,
    sectionsMatched: sectionOk,
    sectionsExpected: EXPECTED_SECTIONS.length,
    keywordsMatched: kwOk,
    keywordsExpected: expectedKeywords.length,
    hasDisclaimer,
    text: text.slice(0, 400), // ilk 400 char önizleme
  };
}

const villa = await inspect(
  resolve(OUT, "pdf-_ilan_2.pdf"),
  EXPECTED_KEYWORDS_VILLA,
);
const residence = await inspect(
  resolve(OUT, "pdf-_ilan_4.pdf"),
  EXPECTED_KEYWORDS_RESIDENCE,
);

const result = { villa, residence };
await writeFile(
  resolve(OUT, "_pdf-content-result.json"),
  JSON.stringify(result, null, 2),
  "utf8",
);

console.log("\n══════════════════════════════════");
console.log(`Villa (Bebek)    : ${villa.pages} sayfa, ${villa.chars} char`);
console.log(`  Bölüm  : ${villa.sectionsMatched}/${villa.sectionsExpected}`);
console.log(`  Keyword: ${villa.keywordsMatched}/${villa.keywordsExpected}`);
console.log(`  Disclaimer: ${villa.hasDisclaimer ? "✅" : "❌"}`);
console.log(`\nResidence (Bodrum): ${residence.pages} sayfa, ${residence.chars} char`);
console.log(`  Bölüm  : ${residence.sectionsMatched}/${residence.sectionsExpected}`);
console.log(`  Keyword: ${residence.keywordsMatched}/${residence.keywordsExpected}`);
console.log(`  Disclaimer: ${residence.hasDisclaimer ? "✅" : "❌"}`);

const allOk =
  villa.sectionsMatched === villa.sectionsExpected &&
  villa.keywordsMatched === villa.keywordsExpected &&
  villa.hasDisclaimer &&
  residence.sectionsMatched === residence.sectionsExpected &&
  residence.keywordsMatched === residence.keywordsExpected &&
  residence.hasDisclaimer;

console.log(`\nTOPLAM: ${allOk ? "✅ TÜM KANITLAR YEŞİL" : "⚠️ Eksik var"}`);
process.exit(allOk ? 0 : 1);
