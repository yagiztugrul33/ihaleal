#!/usr/bin/env node
/**
 * Build-time: aktif ihale (/ilan/:id) ve onaylı müteahhit proje (/proje/:id)
 * sayfalarını Supabase'den çekip public/sitemap-listings.xml üretir.
 *
 * Anon key + RLS ile çalışır (bkz. supabase/migrations/20260428120100_rls_policies.sql
 * "auctions_select_public", "listings_select_active" ve
 * 20260530140000_r14_developer_projects.sql "public_view_verified_projects").
 * Servis rolü gerekmez, çünkü zaten herkese açık olan satırları okuyoruz.
 *
 * Supabase kimlik bilgileri yoksa (örn. yerel build) build'i düşürmeden
 * boş bir urlset yazar — sitemap-index.xml her zaman geçerli kalır.
 *
 * Kullanım: node scripts/generate-listings-sitemap.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const ORIGIN = "https://www.ihaleal.com";
const outPath = path.join(root, "public/sitemap-listings.xml");

function loadEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!fs.existsSync(p)) return {};
  const env = {};
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!m) continue;
    env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

function writeXml(urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${ORIGIN}${u.path}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>
`;
  fs.writeFileSync(outPath, xml, "utf8");
  console.log(`[generate-listings-sitemap] Wrote ${urls.length} URLs to ${outPath}`);
}

async function main() {
  const env = loadEnvLocal();
  const url = (process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      "[generate-listings-sitemap] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY yok — boş sitemap-listings.xml yazılıyor.",
    );
    writeXml([]);
    return;
  }

  const supabase = createClient(url, anonKey);
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];

  try {
    const { data: auctions, error: auctionsErr } = await supabase
      .from("auctions")
      .select("id, ends_at, status, listings!inner(status, is_demo)")
      .in("status", ["scheduled", "live"])
      .eq("listings.status", "active")
      .eq("listings.is_demo", false);

    if (auctionsErr) throw auctionsErr;
    for (const a of auctions ?? []) {
      urls.push({
        path: `/ilan/${a.id}`,
        lastmod: today,
        changefreq: "hourly",
        priority: a.status === "live" ? "0.9" : "0.8",
      });
    }
  } catch (err) {
    console.warn(`[generate-listings-sitemap] auctions sorgusu başarısız: ${err.message}`);
  }

  try {
    const { data: projects, error: projectsErr } = await supabase
      .from("developer_projects")
      .select("id, updated_at")
      .eq("ruhsat_status", "verified");

    if (projectsErr) throw projectsErr;
    for (const p of projects ?? []) {
      urls.push({
        path: `/proje/${p.id}`,
        lastmod: p.updated_at ? String(p.updated_at).slice(0, 10) : today,
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  } catch (err) {
    console.warn(`[generate-listings-sitemap] developer_projects sorgusu başarısız: ${err.message}`);
  }

  writeXml(urls);
}

main();
