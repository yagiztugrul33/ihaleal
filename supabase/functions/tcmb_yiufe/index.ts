import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_SERIES = "TP.FG.J0";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatDdMmYyyy(d: Date): string {
  return `${pad2(d.getUTCDate())}-${pad2(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`;
}

function normalizeYearMonth(tarih: string): string | null {
  const t = tarih.trim();
  let m = /^(\d{4})-(\d{1,2})$/.exec(t);
  if (!m) {
    m = /^(\d{4})-(\d{1,2})-\d{1,2}$/.exec(t);
  }
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return `${m[1]}-${pad2(month)}`;
}

function pickSeriesValue(row: Record<string, unknown>, seriesCode: string): number | null {
  const underscored = seriesCode.replace(/\./g, "_");
  const raw = row[underscored] ?? row[seriesCode];
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace(",", ".").trim());
  return Number.isFinite(n) ? n : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }
  if (req.method !== "GET") {
    const body = JSON.stringify({ ok: false, error: "method_not_allowed" });
    return new Response(body, {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("TCMB_EVDS_API_KEY")?.trim();
  if (!apiKey) {
    const body = JSON.stringify({ ok: false, error: "TCMB_EVDS_API_KEY missing" });
    return new Response(body, { status: 503, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const series = (Deno.env.get("TCMB_EVDS_SERIES") || DEFAULT_SERIES).trim();
  const end = new Date();
  const start = new Date(Date.UTC(end.getUTCFullYear() - 25, 0, 1));

  const url = new URL("https://evds2.tcmb.gov.tr/service/evds/");
  url.searchParams.set("series", series);
  url.searchParams.set("startDate", formatDdMmYyyy(start));
  url.searchParams.set("endDate", formatDdMmYyyy(end));
  url.searchParams.set("type", "json");
  url.searchParams.set("frequency", "5");
  url.searchParams.set("formulas", "0");
  url.searchParams.set("aggregationTypes", "last");

  let evdsJson: { items?: Array<Record<string, unknown>> };
  try {
    const res = await fetch(url.toString(), { headers: { key: apiKey } });
    const text = await res.text();
    if (!res.ok) {
      const body = JSON.stringify({
        ok: false,
        error: "evds_http_" + String(res.status),
        detail: text.slice(0, 200),
      });
      return new Response(body, { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
    evdsJson = JSON.parse(text) as { items?: Array<Record<string, unknown>> };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const body = JSON.stringify({ ok: false, error: "evds_parse_failed", detail: msg });
    return new Response(body, { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const items = evdsJson.items;
  if (!Array.isArray(items)) {
    const body = JSON.stringify({ ok: false, error: "evds_no_items" });
    return new Response(body, { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const records: Array<{ yearMonth: string; indexValue: number }> = [];
  for (const row of items) {
    const tarih = row["Tarih"];
    if (typeof tarih !== "string") continue;
    const ym = normalizeYearMonth(tarih);
    if (!ym) continue;
    const val = pickSeriesValue(row, series);
    if (val == null) continue;
    records.push({ yearMonth: ym, indexValue: Math.round(val * 10000) / 10000 });
  }

  const out = JSON.stringify({
    ok: true,
    records,
    seriesUsed: series,
    itemCount: records.length,
  });
  return new Response(out, { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
});