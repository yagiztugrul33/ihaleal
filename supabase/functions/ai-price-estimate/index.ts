import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { preflight, parseBody, json, fail } from "../_shared/http.ts";
import { getAuthContext } from "../_shared/auth.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

const Body = z.object({
  city: z.string().min(2),
  district: z.string().min(2),
  area_m2: z.number().positive(),
  property_type: z.enum(["apartment", "house", "land", "commercial"]).optional(),
});

Deno.serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;
  if (req.method !== "POST") return fail(req, 405, "method_not_allowed");

  const ctx = await getAuthContext(req);
  if (!ctx) return fail(req, 401, "unauthenticated");

  let input: z.infer<typeof Body>;
  try {
    input = await parseBody(req, Body);
  } catch (resp) {
    return resp as Response;
  }

  const db = supabaseAdmin();
  const { data } = await db
    .from("listings")
    .select("start_price_try, area_m2")
    .eq("city", input.city)
    .eq("district", input.district)
    .eq("status", "active")
    .limit(50);

  const prices = (data ?? [])
    .filter((r) => r.area_m2 && Number(r.area_m2) > 0)
    .map((r) => Number(r.start_price_try) / Number(r.area_m2))
    .sort((a, b) => a - b);

  const median = prices.length
    ? prices[Math.floor(prices.length / 2)] * input.area_m2
    : 0;

  return json(req, {
    ok: true,
    source: prices.length >= 8 ? "heuristic" : "fallback_static",
    method: "heuristic",
    point: Math.round(median),
    low: Math.round(median * 0.9),
    high: Math.round(median * 1.1),
    confidence: prices.length >= 8 ? 0.65 : 0.2,
    sample_size: prices.length,
  });
});
