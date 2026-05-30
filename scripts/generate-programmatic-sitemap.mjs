#!/usr/bin/env node
/**
 * Programatik SEO URL'lerini public/sitemap-programmatic.xml'e yazar.
 * Ana sitemap.xml'e Sitemap index satırı eklenmeli (deploy öncesi).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const provinces = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/trGeoProvinces.json"), "utf8"),
);

const PROPERTY_TYPES = ["konut", "daire", "arsa", "villa", "isyeri", "dukkan"];
const ORIGIN = "https://ihaleal.com";
const today = new Date().toISOString().slice(0, 10);

const urls = [];
for (const deal of ["satilik", "kiralik"]) {
  for (const p of provinces) {
    urls.push(`/${deal}/${p.slug}`);
    for (const t of PROPERTY_TYPES) urls.push(`/${deal}/${p.slug}/${t}`);
    for (const d of p.districts) urls.push(`/${deal}/${p.slug}/${d.slug}`);
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${ORIGIN}${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.72</priority></url>`,
  )
  .join("\n")}
</urlset>
`;

const outPath = path.join(root, "public/sitemap-programmatic.xml");
fs.writeFileSync(outPath, xml, "utf8");
console.log(`Wrote ${urls.length} URLs to ${outPath}`);
