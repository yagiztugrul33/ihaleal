import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { BorsaRegionCode } from "@/lib/borsa/regions";

export type IndexPoint = {
  date: string;
  regionCode: string;
  indexValue: number;
  changePct: number | null;
};

export type VolumePoint = {
  date: string;
  regionCode: string;
  volumeTry: number;
  tradeCount: number;
};

export type RegionRanking = {
  regionCode: BorsaRegionCode;
  indexValue: number;
  changePct: number;
  volumeTry: number;
  tradeCount: number;
};

export type BorsaAnalytics = {
  indexSeries: IndexPoint[];
  volumeSeries: VolumePoint[];
  rankings: RegionRanking[];
  isLive: boolean;
};

const REGIONS: BorsaRegionCode[] = ["istanbul", "ege", "akdeniz", "ankara", "bodrum"];

async function fetchAnalytics(): Promise<BorsaAnalytics> {
  if (!isSupabaseConfigured()) {
    return { indexSeries: [], volumeSeries: [], rankings: [], isLive: false };
  }

  const since = new Date();
  since.setMonth(since.getMonth() - 12);
  const sinceStr = since.toISOString().slice(0, 10);

  const [indexRes, statsRes] = await Promise.all([
    supabase
      .from("price_index")
      .select("index_date, region_code, index_value, change_pct")
      .eq("source", "platform")
      .gte("index_date", sinceStr)
      .order("index_date", { ascending: true })
      .limit(500),
    supabase
      .from("transaction_stats")
      .select("stat_date, region_code, volume_try, trade_count")
      .gte("stat_date", sinceStr)
      .order("stat_date", { ascending: true })
      .limit(500),
  ]);

  const indexSeries: IndexPoint[] = (indexRes.data ?? []).map((row) => ({
    date: String(row.index_date),
    regionCode: String(row.region_code),
    indexValue: Number(row.index_value ?? 0),
    changePct: row.change_pct != null ? Number(row.change_pct) : null,
  }));

  const volumeSeries: VolumePoint[] = (statsRes.data ?? []).map((row) => ({
    date: String(row.stat_date),
    regionCode: String(row.region_code),
    volumeTry: Number(row.volume_try ?? 0),
    tradeCount: Number(row.trade_count ?? 0),
  }));

  const latestIndex = new Map<string, IndexPoint>();
  for (const p of indexSeries) {
    latestIndex.set(p.regionCode, p);
  }
  const latestVol = new Map<string, VolumePoint>();
  for (const p of volumeSeries) {
    latestVol.set(p.regionCode, p);
  }

  const rankings: RegionRanking[] = REGIONS.map((code) => {
    const idx = latestIndex.get(code);
    const vol = latestVol.get(code);
    return {
      regionCode: code,
      indexValue: idx?.indexValue ?? 0,
      changePct: idx?.changePct ?? 0,
      volumeTry: vol?.volumeTry ?? 0,
      tradeCount: vol?.tradeCount ?? 0,
    };
  }).sort((a, b) => b.changePct - a.changePct);

  const isLive = indexSeries.length > 0 || volumeSeries.length > 0;
  return { indexSeries, volumeSeries, rankings, isLive };
}

export function useBorsaAnalytics() {
  const [data, setData] = useState<BorsaAnalytics>({
    indexSeries: [],
    volumeSeries: [],
    rankings: [],
    isLive: false,
  });
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchAnalytics());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...data, loading, reload };
}
