import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AvmEstimateResult = {
  ok: boolean;
  point: number;
  low: number;
  high: number;
  confidence: number;
  sampleSize: number;
  source: string;
};

export async function fetchAvmPriceEstimate(input: {
  city: string;
  district: string;
  areaM2: number;
  propertyType?: "apartment" | "house" | "land" | "commercial";
}): Promise<AvmEstimateResult | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.functions.invoke("ai-price-estimate", {
    body: {
      city: input.city,
      district: input.district,
      area_m2: input.areaM2,
      property_type: input.propertyType ?? "apartment",
    },
  });
  if (error || !data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  if (row.ok !== true) return null;
  return {
    ok: true,
    point: Number(row.point ?? 0),
    low: Number(row.low ?? 0),
    high: Number(row.high ?? 0),
    confidence: Number(row.confidence ?? 0),
    sampleSize: Number(row.sample_size ?? 0),
    source: String(row.source ?? "heuristic"),
  };
}
