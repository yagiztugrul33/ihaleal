import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

type PvgisMonthly = { month: number; E_m: number; H_i_m: number };

function parsePvgisResponse(data: unknown): {
  annualEnergyKwhPerKwp: number;
  annualIrradiationKwhM2: number;
  monthly: PvgisMonthly[];
} | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const outputs = root.outputs as Record<string, unknown> | undefined;
  if (!outputs) return null;
  const monthly = outputs.monthly as { fixed?: { E_m: number; "H(i)_m": number; month: number }[] } | undefined;
  const totals = outputs.totals as { fixed?: { E_y: number; "H(i)_y": number } } | undefined;
  const fixedMonthly = monthly?.fixed;
  const fixedTotals = totals?.fixed;
  if (!fixedMonthly?.length || !fixedTotals) return null;
  return {
    annualEnergyKwhPerKwp: fixedTotals.E_y,
    annualIrradiationKwhM2: fixedTotals["H(i)_y"] ?? fixedTotals.E_y,
    monthly: fixedMonthly.map((row) => ({
      month: row.month,
      E_m: row.E_m,
      H_i_m: row["H(i)_m"],
    })),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions(req);
  const cors = corsHeaders(req);

  let lat: number;
  let lon: number;
  let tilt: number;
  let aspect: number;
  let year: number;

  if (req.method === "GET") {
    const url = new URL(req.url);
    lat = Number(url.searchParams.get("lat"));
    lon = Number(url.searchParams.get("lon"));
    tilt = Number(url.searchParams.get("tilt") ?? "25");
    aspect = Number(url.searchParams.get("aspect") ?? "0");
    year = Number(url.searchParams.get("year") ?? String(new Date().getFullYear() - 1));
  } else if (req.method === "POST") {
    let body: { lat?: number; lon?: number; tilt?: number; aspect?: number; year?: number };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    lat = Number(body.lat);
    lon = Number(body.lon);
    tilt = Number(body.tilt ?? 25);
    aspect = Number(body.aspect ?? 0);
    year = Number(body.year ?? new Date().getFullYear() - 1);
  } else {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return new Response(JSON.stringify({ ok: false, error: "invalid_coordinates" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const pvgisUrl = new URL("https://re.jrc.ec.europa.eu/api/v5_2/seriescalc");
  pvgisUrl.searchParams.set("lat", String(lat));
  pvgisUrl.searchParams.set("lon", String(lon));
  pvgisUrl.searchParams.set("startyear", String(year));
  pvgisUrl.searchParams.set("endyear", String(year));
  pvgisUrl.searchParams.set("pvcalculation", "1");
  pvgisUrl.searchParams.set("peakpower", "1");
  pvgisUrl.searchParams.set("loss", "14");
  pvgisUrl.searchParams.set("angle", String(Math.max(0, Math.min(90, tilt))));
  pvgisUrl.searchParams.set("aspect", String(aspect));
  pvgisUrl.searchParams.set("outputformat", "json");

  try {
    const res = await fetch(pvgisUrl.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: "pvgis_upstream", status: res.status }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }
    const json = await res.json();
    const parsed = parsePvgisResponse(json);
    if (!parsed) {
      return new Response(JSON.stringify({ ok: false, error: "pvgis_parse_failed" }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        ok: true,
        source: "PVGIS v5.2 seriescalc",
        lat,
        lon,
        tilt,
        aspect,
        year,
        ...parsed,
        methodologyUrl: "https://joint-research-centre.ec.europa.eu/pvgis_en",
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new Response(JSON.stringify({ ok: false, error: "pvgis_fetch_failed", message: msg }), {
      status: 502,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
