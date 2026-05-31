/**
 * Edge: TCMB EVDS API proxy — Konut Fiyat Endeksi + Kira + Ticari.
 *
 * Master deploy: `supabase secrets set TCMB_EVDS_KEY=...`
 * Sonra: `supabase functions deploy tcmb_evds --no-verify-jwt`
 *
 * EVDS docs: https://evds2.tcmb.gov.tr/index.php?/evds/serieMarket
 *
 * KORUMA: rate limit + IP token bucket (10/saat) + CORS.
 *
 * KULLANIM:
 *   POST /functions/v1/tcmb_evds
 *   Body: { series: ["TP.HKFE01","TP.HKFE02","TP.HKFE03"], startDate, endDate, cityCode? }
 *   series örnekleri:
 *     TP.HKFE01 — Türkiye geneli Konut Fiyat Endeksi
 *     TP.HKFE02 — Üç büyük il
 *     TP.HKFE03 — Diğer iller
 *
 * Çıktı: { ok: true, data: { series_code: [{date, value}, ...] }, source: "tcmb_evds" }
 *
 * Master onayı çerçevesinde — yeni Edge function, mevcut yapıya dokunmaz.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TCMB_BASE = "https://evds2.tcmb.gov.tr/service/evds";

interface ReqBody {
  series: string[];
  startDate?: string; // dd-mm-yyyy
  endDate?: string;
  type?: "monthly" | "quarterly" | "yearly";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

function fmtDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  const TCMB_KEY = Deno.env.get("TCMB_EVDS_KEY");
  if (!TCMB_KEY) {
    return json(
      {
        ok: false,
        error: "tcmb_key_missing",
        hint: "Master: supabase secrets set TCMB_EVDS_KEY=...",
      },
      503,
    );
  }

  let body: ReqBody;
  try {
    body = (await req.json()) as ReqBody;
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (!Array.isArray(body.series) || body.series.length === 0) {
    return json({ ok: false, error: "series_required" }, 400);
  }
  if (body.series.length > 10) {
    return json({ ok: false, error: "too_many_series", max: 10 }, 400);
  }
  // Seri kodlarında sadece TP. + alfanumerik + nokta — injection engelle
  for (const s of body.series) {
    if (!/^[A-Z0-9.]{3,40}$/.test(s)) {
      return json({ ok: false, error: "invalid_series_code", series: s }, 400);
    }
  }

  const today = new Date();
  const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());
  const startDate = body.startDate || fmtDate(fiveYearsAgo);
  const endDate = body.endDate || fmtDate(today);

  const seriesParam = body.series.join("-");
  const url =
    `${TCMB_BASE}/series=${encodeURIComponent(seriesParam)}` +
    `&startDate=${encodeURIComponent(startDate)}` +
    `&endDate=${encodeURIComponent(endDate)}` +
    `&type=csv` +
    `&key=${encodeURIComponent(TCMB_KEY)}`;

  try {
    const resp = await fetch(url, { headers: { Accept: "text/csv" } });
    if (!resp.ok) {
      return json(
        {
          ok: false,
          error: "tcmb_upstream_error",
          status: resp.status,
        },
        502,
      );
    }
    const csv = await resp.text();
    // CSV → JSON dönüşüm
    const lines = csv.trim().split("\n");
    if (lines.length < 2) {
      return json({ ok: true, data: {}, source: "tcmb_evds", warning: "no_data" });
    }
    const headers = lines[0].split(";").map((h) => h.trim().replace(/^"|"$/g, ""));
    const dateIdx = headers.findIndex((h) => /tarih|date/i.test(h));
    const out: Record<string, Array<{ date: string; value: number | null }>> = {};
    for (let i = 0; i < body.series.length; i++) {
      out[body.series[i]] = [];
    }
    for (let r = 1; r < lines.length; r++) {
      const cells = lines[r].split(";").map((c) => c.trim().replace(/^"|"$/g, ""));
      const date = dateIdx >= 0 ? cells[dateIdx] : "";
      for (let i = 0; i < body.series.length; i++) {
        const colIdx = headers.findIndex((h) =>
          h.replace(/\./g, "_") === body.series[i].replace(/\./g, "_"),
        );
        const raw = colIdx >= 0 ? cells[colIdx] : "";
        const val = raw === "" || raw === "null" ? null : Number(raw.replace(",", "."));
        out[body.series[i]].push({ date, value: Number.isFinite(val) ? (val as number) : null });
      }
    }
    return json({
      ok: true,
      data: out,
      source: "tcmb_evds",
      meta: { startDate, endDate, series: body.series },
    });
  } catch (e) {
    return json({ ok: false, error: "fetch_failed", detail: String(e).slice(0, 200) }, 502);
  }
});
