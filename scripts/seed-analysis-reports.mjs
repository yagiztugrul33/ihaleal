/**
 * Supabase'teki ilk 24 ilan için mock AI raporu + isteğe bağlı buy_now_price_try.
 *
 * Kullanım (Windows PowerShell):
 *   node --env-file=.env.local scripts/seed-analysis-reports.mjs
 *
 * Gerekli env:
 *   VITE_SUPABASE_URL veya SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (RLS bypass önerilir — üretim anahtarını paylaşmayın)
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function disclaimer() {
  return "Bu rapor bilgilendirme amaçlıdır, profesyonel ekspertiz veya hukuki tavsiye yerine geçmez.";
}

function mockReportRow(listingId, seed) {
  const legalRisk = 4 + (seed % 4);
  const overallRisk = Math.min(10, legalRisk + (seed % 2));
  const fairPrice = Math.min(10, Math.max(1, 10 - overallRisk));
  return {
    listing_id: listingId,
    legal_title_deed_status: overallRisk > 7 ? "unknown" : "clean",
    legal_mortgages: [],
    legal_liens: overallRisk > 7 ? [{ type: "mock_lien" }] : [],
    legal_zoning_status: "Konut (mock)",
    legal_building_permit_status: "mock",
    legal_municipal_records: { is_mock: true },
    legal_risk_score: legalRisk,
    legal_warnings: ["Taslak seed — resmi kaynak doğrulaması gerekir."],
    socio_income_level: "middle",
    socio_education_score: 7,
    socio_cultural_indicators: { is_mock: true },
    socio_crime_index: 4,
    socio_political_lean: null,
    socio_employment_rate: 92,
    socio_demographics: { is_mock: true },
    location_metro_distance_km: 0.8,
    location_highway_distance_km: 2.1,
    location_airport_distance_km: 28,
    location_school_distance_km: 0.5,
    location_hospital_distance_km: 1.8,
    location_shopping_distance_km: 0.4,
    location_park_distance_km: 0.3,
    location_green_area_pct: 14,
    location_pollution_index: 48,
    location_earthquake_risk: overallRisk > 7 ? "medium" : "low",
    location_commerce_potential: "Orta (mock)",
    economic_avg_rent_try: null,
    economic_price_trend_3y_pct: 20 + (seed % 8),
    economic_price_trend_5y_pct: 40 + (seed % 15),
    economic_municipal_plan_alignment: "mock",
    economic_fair_market_value_try: null,
    economic_fair_price_score: fairPrice,
    economic_lower_bound_try: null,
    economic_upper_bound_try: null,
    overall_risk_score: overallRisk,
    overall_recommendation_buyer: "Seed mock — gerçek API sonrası güncellenecek.",
    overall_recommendation_seller: "Seed mock — fiyatlandırmayı uzmanla doğrulayın.",
    overall_red_flags: overallRisk >= 7 ? ["Yüksek risk (seed)"] : [],
    overall_disclaimer: disclaimer(),
    status: "ready",
    ai_provider: "mock",
    ai_model_version: "seed-mjs-v1",
    generated_at: new Date().toISOString(),
    raw_data: { is_mock: true, seed },
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  if (!url || !serviceKey) {
    console.error("Eksik SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — çıkılıyor.");
    process.exit(1);
  }
  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: listings, error } = await sb
    .from("listings")
    .select("id, start_price_try")
    .order("created_at", { ascending: true })
    .limit(24);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!listings?.length) {
    console.log("İlan yok — önce ilan oluşturun.");
    return;
  }
  let n = 0;
  for (let i = 0; i < listings.length; i++) {
    const row = listings[i];
    const seed = i + 1;
    const start = row.start_price_try != null ? Number(row.start_price_try) : 5_000_000;
    const buyNow = Math.round(start * (1.32 + (seed % 8) / 100));
    const reportPayload = mockReportRow(row.id, seed);
    reportPayload.economic_avg_rent_try = Math.round(start * 0.004);
    reportPayload.economic_fair_market_value_try = Math.round(start * 1.05);
    reportPayload.economic_lower_bound_try = Math.round(start * 0.9);
    reportPayload.economic_upper_bound_try = Math.round(start * 1.15);

    const { data: rep, error: upErr } = await sb
      .from("property_analysis_reports")
      .upsert(reportPayload, { onConflict: "listing_id" })
      .select("id")
      .maybeSingle();
    if (upErr) {
      console.error("Report upsert:", row.id, upErr.message);
      continue;
    }
    const { error: lErr } = await sb
      .from("listings")
      .update({
        analysis_report_id: rep?.id,
        buy_now_price_try: buyNow,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    if (lErr) {
      console.error("Listing update:", row.id, lErr.message);
      continue;
    }
    n++;
    console.log("OK", row.id, "buy_now", buyNow);
  }
  console.log("Tamam:", n, "/", listings.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
