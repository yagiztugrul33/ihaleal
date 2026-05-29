import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, handleOptions } from "../_shared/cors.ts";

type RawEvent = Record<string, unknown>;
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store",
} as const;

function asNum(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asStr(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function parseDate(v: unknown): string | null {
  const text = asStr(v);
  if (!text) return null;
  const iso = new Date(text.replace(" ", "T"));
  return Number.isNaN(iso.getTime()) ? null : iso.toISOString();
}

function normalize(raw: RawEvent, i: number) {
  const magnitude = asNum(raw.m ?? raw.mag ?? raw.magnitude);
  const place = asStr(raw.location ?? raw.lokasyon ?? raw.place ?? raw.city);
  const time = parseDate(raw.date ?? raw.time ?? raw.eventDate);
  if (magnitude == null || !place || !time) return null;
  return {
    id: asStr(raw.eventID ?? raw.id) ?? `eq-edge-${i + 1}`,
    time,
    magnitude,
    place,
    depthKm: asNum(raw.depth ?? raw.depthKm) ?? undefined,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions(req);
  const cors = corsHeaders(req);
  const headers = { ...cors, ...SECURITY_HEADERS, "Content-Type": "application/json" };
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
      status: 405,
      headers,
    });
  }

  const end = new Date();
  const start = new Date(end.getTime() - 2 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    start: start.toISOString(),
    end: end.toISOString(),
    orderby: "timedesc",
    limit: "100",
    minmag: "1",
  });

  try {
    const upstream = await fetch(`https://deprem.afad.gov.tr/apiv2/event/filter?${params.toString()}`);
    const text = await upstream.text();
    if (!upstream.ok) {
      void text;
      return new Response(JSON.stringify({ ok: false, error: `afad_http_${upstream.status}` }), {
        status: 502,
        headers,
      });
    }
    const payload = JSON.parse(text) as unknown;
    const rows = Array.isArray(payload) ? payload : Array.isArray((payload as { events?: unknown[] })?.events) ? (payload as { events?: unknown[] }).events : [];
    const events = rows
      .map((row, i) => (row && typeof row === "object" ? normalize(row as RawEvent, i) : null))
      .filter(Boolean)
      .slice(0, 80);

    return new Response(JSON.stringify({ ok: true, provider: "afad", events }), {
      status: 200,
      headers,
    });
  } catch (e) {
    void e;
    return new Response(JSON.stringify({ ok: false, error: "afad_fetch_failed" }), {
      status: 502,
      headers,
    });
  }
});
