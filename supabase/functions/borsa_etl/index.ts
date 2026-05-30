/**
 * borsa_etl — platform ilanlarından price_index + transaction_stats üretir.
 * CC-deploy: supabase functions deploy borsa_etl
 * Tetik: GET ?secret=INTERNAL_CRON_SECRET veya Authorization: Bearer <service_role>
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { env } from "../_shared/env.ts";

type RegionCode = "istanbul" | "ege" | "akdeniz" | "ankara" | "bodrum";

function inferRegion(city: string | null, district: string | null): RegionCode {
  const basis = `${city ?? ""} ${district ?? ""}`.toLocaleLowerCase("tr-TR");
  if (/istanbul|şişli|kadıköy|beşiktaş|levent|sarıyer/.test(basis)) return "istanbul";
  if (/ankara|çankaya|keçiören/.test(basis)) return "ankara";
  if (/bodrum|muğla|çeşme|alaçatı/.test(basis)) return "bodrum";
  if (/antalya|muratpaşa|akdeniz/.test(basis)) return "akdeniz";
  if (/izmir|ege|bornova|karşıyaka/.test(basis)) return "ege";
  return "istanbul";
}

function authorize(req: Request): boolean {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? req.headers.get("x-cron-secret") ?? "";
  if (env.INTERNAL_CRON_SECRET && secret === env.INTERNAL_CRON_SECRET) return true;
  const auth = req.headers.get("Authorization") ?? "";
  return auth.startsWith("Bearer ") && auth.length > 20;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions(req);
  const cors = corsHeaders(req);

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (!authorize(req)) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const admin = supabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);

  const { data: listings, error: listErr } = await admin
    .from("listings")
    .select("id, city, district, start_price_try, status")
    .in("status", ["active", "closed"])
    .limit(2000);

  if (listErr) {
    return new Response(JSON.stringify({ ok: false, error: listErr.message }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const byRegion = new Map<RegionCode, { prices: number[]; count: number }>();
  for (const row of listings ?? []) {
    const region = inferRegion(row.city as string | null, row.district as string | null);
    const price = Number(row.start_price_try ?? 0);
    if (!byRegion.has(region)) byRegion.set(region, { prices: [], count: 0 });
    const bucket = byRegion.get(region)!;
    if (price > 0) bucket.prices.push(price);
    bucket.count += 1;
  }

  let indexUpserts = 0;
  let statsUpserts = 0;

  for (const [region, bucket] of byRegion) {
    const avg = bucket.prices.length
      ? bucket.prices.reduce((a, b) => a + b, 0) / bucket.prices.length
      : 0;
    const volume = bucket.prices.reduce((a, b) => a + b, 0);

    const { data: prev } = await admin
      .from("price_index")
      .select("index_value")
      .eq("region_code", region)
      .eq("source", "platform")
      .order("index_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const prevVal = Number(prev?.index_value ?? avg);
    const changePct = prevVal > 0 ? Number((((avg - prevVal) / prevVal) * 100).toFixed(2)) : 0;

    const { error: idxErr } = await admin.from("price_index").upsert(
      {
        index_date: today,
        region_code: region,
        segment: "konut",
        source: "platform",
        index_value: Math.round(avg),
        change_pct: changePct,
      },
      { onConflict: "region_code,index_date,segment,source" },
    );
    if (!idxErr) indexUpserts += 1;

    const { error: statErr } = await admin.from("transaction_stats").upsert(
      {
        stat_date: today,
        region_code: region,
        volume_try: Math.round(volume),
        trade_count: bucket.count,
        active_listings: bucket.count,
        avg_price_try: Math.round(avg),
      },
      { onConflict: "region_code,stat_date" },
    );
    if (!statErr) statsUpserts += 1;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      date: today,
      regions: byRegion.size,
      indexUpserts,
      statsUpserts,
    }),
    { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
  );
});
