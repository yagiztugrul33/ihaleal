import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { YiUfeRecord } from "./TaxSimulatorService";

export type TcmbYiUfeFetchResult =
  | { ok: true; records: YiUfeRecord[]; seriesUsed: string; itemCount: number }
  | { ok: false; code: "not_configured" | "invoke_failed" | "bad_response"; message: string };

interface EdgePayload {
  ok?: boolean;
  records?: Array<{ yearMonth: string; indexValue: number }>;
  seriesUsed?: string;
  itemCount?: number;
  error?: string;
}

/** Fetch monthly YI-UFE from TCMB EVDS via Supabase Edge Function (key stays server-side). */
export async function fetchYiUfeFromTcmbEdge(): Promise<TcmbYiUfeFetchResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      code: "not_configured",
      message: "Supabase not configured — cannot call TCMB proxy.",
    };
  }

  const { data, error } = await supabase.functions.invoke<EdgePayload>("tcmb_yiufe", {
    method: "GET",
  });

  if (error) {
    return {
      ok: false,
      code: "invoke_failed",
      message: error.message || "Edge function error",
    };
  }

  const payload = data;
  if (!payload || payload.ok !== true || !Array.isArray(payload.records)) {
    return {
      ok: false,
      code: "bad_response",
      message: payload?.error || "Invalid response",
    };
  }

  const records: YiUfeRecord[] = payload.records.map((r) => ({
    yearMonth: r.yearMonth,
    indexValue: r.indexValue,
    source: "tcmb_evds",
    stale: false,
  }));

  return {
    ok: true,
    records,
    seriesUsed: payload.seriesUsed ?? "TP.FG.J0",
    itemCount: payload.itemCount ?? records.length,
  };
}