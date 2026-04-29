import type { SupabaseClient } from "@supabase/supabase-js";

/** Veritabanı kolonlarıyla uyumlu AI rapor satırı (mock veya gerçek API sonrası). */
export type PropertyAnalysisReportRecord = {
  id?: string;
  listing_id: string;
  legal_title_deed_status: "clean" | "encumbered" | "disputed" | "unknown";
  legal_mortgages: unknown[];
  legal_liens: unknown[];
  legal_zoning_status: string | null;
  legal_building_permit_status: string | null;
  legal_municipal_records: Record<string, unknown>;
  legal_risk_score: number | null;
  legal_warnings: string[] | null;
  socio_income_level: "low" | "lower_middle" | "middle" | "upper_middle" | "high";
  socio_education_score: number | null;
  socio_cultural_indicators: Record<string, unknown>;
  socio_crime_index: number | null;
  socio_political_lean: string | null;
  socio_employment_rate: number | null;
  socio_demographics: Record<string, unknown>;
  location_metro_distance_km: number | null;
  location_highway_distance_km: number | null;
  location_airport_distance_km: number | null;
  location_school_distance_km: number | null;
  location_hospital_distance_km: number | null;
  location_shopping_distance_km: number | null;
  location_park_distance_km: number | null;
  location_green_area_pct: number | null;
  location_pollution_index: number | null;
  location_earthquake_risk: "low" | "medium" | "high" | "very_high";
  location_commerce_potential: string | null;
  economic_avg_rent_try: number | null;
  economic_price_trend_3y_pct: number | null;
  economic_price_trend_5y_pct: number | null;
  economic_municipal_plan_alignment: string | null;
  economic_fair_market_value_try: number | null;
  economic_fair_price_score: number | null;
  economic_lower_bound_try: number | null;
  economic_upper_bound_try: number | null;
  overall_risk_score: number | null;
  overall_recommendation_buyer: string | null;
  overall_recommendation_seller: string | null;
  overall_red_flags: string[] | null;
  overall_disclaimer: string;
  status: "pending" | "generating" | "ready" | "failed";
  ai_provider?: string | null;
  ai_model_version?: string | null;
  generated_at?: string | null;
  raw_data?: Record<string, unknown>;
};

export const AI_REPORT_DISCLAIMER_TR =
  "Bu rapor bilgilendirme amaçlıdır, profesyonel ekspertiz veya hukuki tavsiye yerine geçmez.";

export type GenerateMockReportInput = {
  listingId: string;
  titleHint?: string;
  cityHint?: string;
  districtHint?: string;
  startPriceTry?: number;
};

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

/** Demo — gerçek API yok; raw_data.is_mock: true ile işaretlenir. */
export function generateMockReport(input: GenerateMockReportInput): Omit<PropertyAnalysisReportRecord, "listing_id"> & {
  listing_id: string;
} {
  const seed = hashSeed(input.listingId);
  const jitter = (base: number, spread: number) => base + (seed % (spread * 2 + 1)) - spread;

  const legalRisk = jitter(5, 2);
  const overallRisk = Math.min(10, Math.max(1, legalRisk + (seed % 3) - 1));
  const fairPrice = Math.min(10, Math.max(1, 10 - overallRisk + (seed % 2)));

  const fairMV = input.startPriceTry
    ? Math.round(input.startPriceTry * (1 + (seed % 15) / 100))
    : null;

  const redFlags: string[] = [];
  if (overallRisk >= 7) redFlags.push("Genel risk skoru yüksek — ek hukuki ve finansal kontrol önerilir.");
  if (legalRisk >= 7) redFlags.push("Hukuksal başlıkta uyarılar artmış görünüyor.");
  if ((seed % 11) === 0) redFlags.push("Belediye kayıtlarında ek doğrulama gerekebilir (mock senaryo).");

  return {
    listing_id: input.listingId,
    legal_title_deed_status: overallRisk > 7 ? "unknown" : "clean",
    legal_mortgages: [{ holder: "Örnek Bank A.Ş.", rank: 1, approximate_try: input.startPriceTry ? input.startPriceTry * 0.35 : null }],
    legal_liens: overallRisk > 7 ? [{ type: "İhtiyati haciz (mock)", status: "araştırma_gerekli" }] : [],
    legal_zoning_status: input.cityHint?.includes("İstanbul") ? "Konut + ticari karma alan (mock)" : "Konut (mock)",
    legal_building_permit_status: "Ruhsat izleri uyumlu (mock)",
    legal_municipal_records: { zoning_note: "İmar planı uyumu bilgilendirme amaçlıdır.", is_mock: true },
    legal_risk_score: legalRisk,
    legal_warnings:
      legalRisk >= 6
        ? ["İpotek / şerh kalemleri resmi tapu senedinden teyit edilmelidir.", "Bu çıktı taslak mock veridir."]
        : ["Standart uyarı: profesyonel ekspertiz önerilir."],

    socio_income_level: fairPrice >= 7 ? "upper_middle" : "middle",
    socio_education_score: jitter(7, 1),
    socio_cultural_indicators: { theaters_per_100k: 4.2, museums_nearby: 6, is_mock: true },
    socio_crime_index: jitter(4, 2),
    socio_political_lean: "Çok geniş çevre — sosyo-politik etiket bilgilendirme amaçlı değildir.",
    socio_employment_rate: 93 + (seed % 5),
    socio_demographics: { youth_pct: 28, aging_index: 42, is_mock: true },

    location_metro_distance_km: Number((0.4 + (seed % 25) / 10).toFixed(1)),
    location_highway_distance_km: Number((1.2 + (seed % 40) / 10).toFixed(1)),
    location_airport_distance_km: Number((25 + (seed % 30)).toFixed(1)),
    location_school_distance_km: Number((0.6 + (seed % 20) / 10).toFixed(1)),
    location_hospital_distance_km: Number((1.5 + (seed % 35) / 10).toFixed(1)),
    location_shopping_distance_km: Number((0.3 + (seed % 15) / 10).toFixed(1)),
    location_park_distance_km: Number((0.25 + (seed % 12) / 10).toFixed(1)),
    location_green_area_pct: Number((12 + (seed % 18)).toFixed(1)),
    location_pollution_index: jitter(45, 15),
    location_earthquake_risk: overallRisk > 7 ? "medium" : "low",
    location_commerce_potential: input.districtHint ? `${input.districtHint} çevresinde orta-yüksek ticari potansiyel (mock)` : "Orta düzey (mock)",

    economic_avg_rent_try: input.startPriceTry ? Math.round(input.startPriceTry * 0.0045) : null,
    economic_price_trend_3y_pct: Number((18 + (seed % 12)).toFixed(1)),
    economic_price_trend_5y_pct: Number((42 + (seed % 20)).toFixed(1)),
    economic_municipal_plan_alignment: "Plan notları ile uyum hedefi — kesin beyan değildir.",
    economic_fair_market_value_try: fairMV,
    economic_fair_price_score: fairPrice,
    economic_lower_bound_try: fairMV ? Math.round(fairMV * 0.88) : null,
    economic_upper_bound_try: fairMV ? Math.round(fairMV * 1.12) : null,

    overall_risk_score: overallRisk,
    overall_recommendation_buyer:
      overallRisk <= 4
        ? "Mock özet: Fiyat bandı makul görünüyor; yine de tapu ve finansmanı doğrulayın."
        : "Mock özet: Ek hukuki ve finansal kontroller önerilir.",
    overall_recommendation_seller:
      overallRisk >= 7
        ? "Bu fiyatla satılma şansı düşük olabilir — fiyat stratejisini gözden geçirmeniz önerilir."
        : "Pozisyon dengeli görünüyor (mock); talebi izleyin.",
    overall_red_flags: redFlags,
    overall_disclaimer: AI_REPORT_DISCLAIMER_TR,
    status: "ready",
    ai_provider: "mock",
    ai_model_version: "mock-v1",
    generated_at: new Date().toISOString(),
    raw_data: {
      is_mock: true,
      title_hint: input.titleHint ?? null,
      city_hint: input.cityHint ?? null,
      seed_version: 1,
    },
  };
}

/** Üretim — OpenAI / Claude entegrasyonu için yer tutucu. */
export async function generateRealReport(_input: GenerateMockReportInput): Promise<PropertyAnalysisReportRecord> {
  throw new Error("generateRealReport henüz bağlı değil — mock kullanın.");
}

export async function saveReportToDb(
  supabase: SupabaseClient,
  listingId: string,
  report: PropertyAnalysisReportRecord,
): Promise<{ data: PropertyAnalysisReportRecord | null; error: Error | null }> {
  const row = {
    ...report,
    listing_id: listingId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("property_analysis_reports")
    .upsert(row, { onConflict: "listing_id" })
    .select()
    .maybeSingle();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  if (data?.id) {
    await supabase.from("listings").update({ analysis_report_id: data.id, updated_at: new Date().toISOString() }).eq("id", listingId);
  }

  return { data: data as PropertyAnalysisReportRecord, error: null };
}

export async function approveReport(
  supabase: SupabaseClient,
  reportId: string,
  userId: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from("report_approvals").insert({
    report_id: reportId,
    user_id: userId,
  });
  return { error: error ? new Error(error.message) : null };
}

export async function fetchReportForListing(
  supabase: SupabaseClient,
  listingId: string,
): Promise<{ data: PropertyAnalysisReportRecord | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("property_analysis_reports")
    .select("*")
    .eq("listing_id", listingId)
    .maybeSingle();
  return { data: data as PropertyAnalysisReportRecord | null, error: error ? new Error(error.message) : null };
}

export async function userHasApprovedReport(
  supabase: SupabaseClient,
  reportId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("report_approvals")
    .select("id")
    .eq("report_id", reportId)
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data?.id);
}
