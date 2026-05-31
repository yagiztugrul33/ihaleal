/**
 * TCMB EVDS client — Konut Fiyat Endeksi + Kira Endeksi + Ticari Endeks.
 *
 * Edge function `tcmb_evds` üzerinden çağırır.
 * Cache: in-memory (sayfa ömrü) — backend rate limit'i destekler.
 *
 * Fallback (TCMB key yoksa veya offline): regionalPriceData'dan sentetik
 * 5 yıllık seri üretir (yıllık %18 ortalama artış + ±%3 gürültü) — Endeks
 * grafiği boş kalmasın.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface TcmbPoint {
  date: string; // "MM-yyyy" veya "yyyy-MM"
  value: number | null;
}

export interface TcmbSeriesResult {
  series: string;
  label: string;
  points: TcmbPoint[];
  source: "tcmb_evds" | "fallback_synthetic" | "regional_demo";
  lastValue: number | null;
  yoyPct: number | null; // Yıllık değişim %
}

// Standart seri kataloğu — Konut Fiyat Endeksi, Kira, Ticari
export const TCMB_SERIES = {
  KFE_TURKEY: "TP.HKFE01",   // Türkiye geneli
  KFE_BIG3: "TP.HKFE02",     // Üç büyük il (İst+Ank+İzm)
  KFE_OTHER: "TP.HKFE03",    // Diğer iller
  RENT_NEW: "TP.UR.S05.A001", // Yeni kiracı kira endeksi (örnek)
} as const;

// Sentetik fallback — TCMB key yoksa
function syntheticSeries(label: string, base: number, monthsBack = 60): TcmbPoint[] {
  const out: TcmbPoint[] = [];
  const now = new Date();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    // Aylık %1.5 artış + ±%0.3 gürültü (yıllık ~%18)
    const monthsAgo = i;
    const noise = Math.sin(monthsAgo * 0.7) * 0.03;
    const trend = Math.pow(1 + 0.015 + noise, monthsBack - 1 - monthsAgo);
    out.push({
      date: `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`,
      value: Math.round(base * trend * 10) / 10,
    });
  }
  return out;
}

async function fetchOne(series: string): Promise<TcmbSeriesResult> {
  const fallback = (lab: string): TcmbSeriesResult => {
    const points = syntheticSeries(lab, 100);
    const lv = points[points.length - 1]?.value ?? null;
    const yo = points[points.length - 13]?.value ?? null;
    return {
      series,
      label: lab,
      points,
      source: "fallback_synthetic",
      lastValue: lv,
      yoyPct: lv && yo ? Math.round(((lv - yo) / yo) * 1000) / 10 : null,
    };
  };

  const label =
    series === TCMB_SERIES.KFE_TURKEY
      ? "Konut Fiyat Endeksi (Türkiye)"
      : series === TCMB_SERIES.KFE_BIG3
        ? "Konut Fiyat Endeksi (3 Büyük İl)"
        : series === TCMB_SERIES.KFE_OTHER
          ? "Konut Fiyat Endeksi (Diğer İller)"
          : series === TCMB_SERIES.RENT_NEW
            ? "Yeni Kiracı Kira Endeksi"
            : series;

  if (!isSupabaseConfigured()) return fallback(label);

  try {
    const { data, error } = await supabase.functions.invoke<{
      ok: boolean;
      data?: Record<string, TcmbPoint[]>;
      error?: string;
    }>("tcmb_evds", {
      body: { series: [series] },
    });
    if (error || !data?.ok || !data.data?.[series]) {
      return fallback(label);
    }
    const points = data.data[series];
    const lv = points[points.length - 1]?.value ?? null;
    const yo = points[points.length - 13]?.value ?? null;
    return {
      series,
      label,
      points,
      source: "tcmb_evds",
      lastValue: lv,
      yoyPct: lv && yo ? Math.round(((lv - yo) / yo) * 1000) / 10 : null,
    };
  } catch {
    return fallback(label);
  }
}

const cache = new Map<string, Promise<TcmbSeriesResult>>();

export function fetchTcmbSeries(series: string): Promise<TcmbSeriesResult> {
  if (!cache.has(series)) {
    cache.set(series, fetchOne(series));
  }
  return cache.get(series)!;
}

export async function fetchTcmbAll(): Promise<TcmbSeriesResult[]> {
  return Promise.all([
    fetchTcmbSeries(TCMB_SERIES.KFE_TURKEY),
    fetchTcmbSeries(TCMB_SERIES.KFE_BIG3),
    fetchTcmbSeries(TCMB_SERIES.RENT_NEW),
  ]);
}
