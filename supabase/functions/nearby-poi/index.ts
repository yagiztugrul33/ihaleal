// R13.2 — Nearby POI Edge function
// OSM Overpass API (ücretsiz fallback) + Supabase cache (7 gün)
// Master onayı: Sıralama C — Feature-Visible-First, OSM ile başla, Google Places sonra
//
// Deploy: supabase functions deploy nearby-poi
// Test: curl -X POST <SUPABASE>/functions/v1/nearby-poi \
//   -H "apikey: <ANON>" -H "Content-Type: application/json" \
//   -d '{"lat":41.0082,"lng":28.9784,"radius_m":1000,"category":"saglik"}'

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CATEGORY_QUERY: Record<string, string> = {
  saglik: '["amenity"~"hospital|clinic|pharmacy"]',
  egitim: '["amenity"~"school|university|kindergarten"]',
  devlet: '["amenity"~"townhall|post_office|police|courthouse"]',
  ticaret: '["amenity"~"marketplace"]["shop"~"supermarket|mall"]',
  ulasim: '["highway"="bus_stop"]["railway"~"station|subway_entrance"]',
  sosyal: '["leisure"~"park|garden"]["amenity"~"library|museum"]',
};

interface POIResult {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceM: number;
  type: string;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

async function fetchFromOSM(
  lat: number,
  lng: number,
  radius: number,
  category: string,
): Promise<POIResult[]> {
  const filter = CATEGORY_QUERY[category] ?? CATEGORY_QUERY.saglik;
  const query = `[out:json][timeout:25];(node${filter}(around:${radius},${lat},${lng});way${filter}(around:${radius},${lat},${lng}););out center 50;`;
  const url = "https://overpass-api.de/api/interpreter";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error(`OSM ${res.status}`);
  const data = (await res.json()) as { elements?: Array<Record<string, unknown>> };
  const elements = data.elements ?? [];

  return elements
    .map((el): POIResult | null => {
      const tags = (el.tags ?? {}) as Record<string, string>;
      const elemLat = typeof el.lat === "number" ? el.lat : (el.center as { lat?: number } | undefined)?.lat;
      const elemLng = typeof el.lon === "number" ? el.lon : (el.center as { lon?: number } | undefined)?.lon;
      if (typeof elemLat !== "number" || typeof elemLng !== "number") return null;
      const name = tags.name || tags["name:tr"] || tags.amenity || tags.shop || "İsimsiz";
      return {
        id: String(el.id),
        name,
        lat: elemLat,
        lng: elemLng,
        distanceM: haversine(lat, lng, elemLat, elemLng),
        type: tags.amenity || tags.shop || tags.highway || tags.railway || tags.leisure || "other",
      };
    })
    .filter((x): x is POIResult => x !== null)
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, 30);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supaUrl = Deno.env.get("SUPABASE_URL");
    const supaKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
    const sb = supaUrl && supaKey ? createClient(supaUrl, supaKey) : null;

    const body = (await req.json()) as {
      lat?: number;
      lng?: number;
      radius_m?: number;
      category?: string;
    };

    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const radius = Number(body.radius_m ?? 1000);
    const category = String(body.category ?? "saglik");

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_coordinates" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Cache check (4 decimal precision)
    const latGrid = Math.round(lat * 10000) / 10000;
    const lngGrid = Math.round(lng * 10000) / 10000;

    if (sb) {
      const { data: cached } = await sb
        .from("nearby_poi_cache")
        .select("pois, cached_at")
        .eq("lat_grid", latGrid)
        .eq("lng_grid", lngGrid)
        .eq("radius_m", radius)
        .eq("category", category)
        .maybeSingle();

      if (cached) {
        const cachedAt = new Date(cached.cached_at as string).getTime();
        const ageDays = (Date.now() - cachedAt) / (1000 * 60 * 60 * 24);
        if (ageDays < 7) {
          return new Response(
            JSON.stringify({ ok: true, source: "cache", pois: cached.pois }),
            { headers: { ...cors, "Content-Type": "application/json" } },
          );
        }
      }
    }

    // Fetch fresh from OSM
    const pois = await fetchFromOSM(lat, lng, radius, category);

    // Store cache
    if (sb && pois.length > 0) {
      await sb.from("nearby_poi_cache").upsert(
        {
          lat_grid: latGrid,
          lng_grid: lngGrid,
          radius_m: radius,
          category,
          pois,
          cached_at: new Date().toISOString(),
        },
        { onConflict: "lat_grid,lng_grid,radius_m,category" },
      );
    }

    return new Response(JSON.stringify({ ok: true, source: "osm", pois }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});
