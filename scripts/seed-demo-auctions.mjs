/**
 * Kimi A_01 çıktısı src/data/demo-auctions.json içinde beklenir (şimdilik [] olabilir).
 * Çalıştırma: node --env-file=.env.local scripts/seed-demo-auctions.mjs
 *
 * Not: profiles.id auth.users'a bağlıdır; sahte UUID ile INSERT yapılamaz.
 * DEMO_SEED_SELLER_ID = gerçek auth kullanıcı uuid (.env.local)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!existsSync(p)) return {};
  const env = {};
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([^#=]+)=(.*)$/);
    if (!m) continue;
    env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnvLocal();
const url = (process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const sellerId = process.env.DEMO_SEED_SELLER_ID || env.DEMO_SEED_SELLER_ID;

const demoPath = path.join(root, "src/data/demo-auctions.json");
if (!existsSync(demoPath)) {
  console.error("Eksik: src/data/demo-auctions.json");
  process.exit(1);
}

const demoData = JSON.parse(readFileSync(demoPath, "utf8"));
if (!Array.isArray(demoData)) {
  console.error("demo-auctions.json dizi olmalı.");
  process.exit(1);
}

if (demoData.length === 0) {
  console.log("demo-auctions.json boş — çıktı yok (Kimi A_01 bekleniyor).");
  process.exit(0);
}

if (!url || !serviceRole) {
  console.error("VITE_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

if (!sellerId) {
  console.error("DEMO_SEED_SELLER_ID eksik — gerçek bir auth.users id yazın (.env.local).");
  process.exit(1);
}

const supabase = createClient(url, serviceRole);

async function clearDemoListings() {
  const { data: lids, error: qe } = await supabase.from("listings").select("id").eq("is_demo", true);
  if (qe) console.error("Demo listing sorgusu:", qe.message);
  const ids = (lids ?? []).map((x) => x.id);
  if (ids.length > 0) {
    const { error: de } = await supabase.from("auctions").delete().in("listing_id", ids);
    if (de) console.error("Auction silme:", de.message);
  }
  const { error: le } = await supabase.from("listings").delete().eq("is_demo", true);
  if (le) console.error("Listing silme:", le.message);
}

async function seedOne(item, idx) {
  const title = item.title ?? `Demo ilan ${idx + 1}`;
  const body = {
    description: item.description ?? "",
    ...(typeof item.body === "object" && item.body ? item.body : {}),
    seed_meta: { tur: "tur21_demo_seed", demo_id: item.id ?? idx },
  };
  if (item.size_m2 != null) body.size_m2 = item.size_m2;
  if (item.rooms != null) body.rooms = item.rooms;
  if (item.neighborhood != null) body.neighborhood = item.neighborhood;

  const { data: listing, error: le } = await supabase
    .from("listings")
    .insert({
      seller_id: sellerId,
      title,
      body,
      category: item.category ?? "real_estate_residential",
      city: item.city ?? "İstanbul",
      district: item.district ?? "Şişli",
      start_price_try: Number(item.starting_bid_try ?? item.start_price_try ?? 1_000_000),
      reserve_price_try: item.reserve_price_try != null ? Number(item.reserve_price_try) : null,
      status: item.listing_status ?? "active",
      is_demo: true,
    })
    .select()
    .single();

  if (le || !listing) {
    console.error("Listing insert:", le?.message);
    return;
  }

  const startsAt = item.starts_at ?? new Date().toISOString();
  const endsAt = item.ends_at ?? new Date(Date.now() + 7 * 86400000).toISOString();

  const { error: ae } = await supabase.from("auctions").insert({
    listing_id: listing.id,
    starts_at: startsAt,
    ends_at: endsAt,
    status: item.status ?? "scheduled",
    current_high_bid_try: item.current_bid_try != null ? Number(item.current_bid_try) : null,
    bid_count: item.bid_count != null ? Number(item.bid_count) : 0,
  });

  if (ae) console.error("Auction insert:", ae.message);
}

async function main() {
  await clearDemoListings();
  for (let i = 0; i < demoData.length; i++) {
    await seedOne(demoData[i], i);
  }
  console.log(`İşlem bitti — işlenen kayıt: ${demoData.length} (hataları konsola yazdı).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
