import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type MarketDirection = "up" | "down";

export type MarketAsset = {
  id: string;
  code: string;
  property: string;
  region: "istanbul" | "ege" | "akdeniz" | "ankara" | "bodrum";
  category: "active" | "rising" | "volume" | "ending";
  price: number;
  changePct: number;
  volume: number;
  remainingMin: number;
  dir: MarketDirection;
};

export const INITIAL_MARKET_ASSETS: MarketAsset[] = [
  { id: "1", code: "KADIKÖY-D", property: "Kadikoy daire", region: "istanbul", category: "active", price: 12_850_000, changePct: 2.1, volume: 840, remainingMin: 54, dir: "up" },
  { id: "2", code: "ÇEŞME-A", property: "Cesme arsa", region: "ege", category: "rising", price: 18_300_000, changePct: 1.4, volume: 520, remainingMin: 112, dir: "up" },
  { id: "3", code: "LEVENT-O", property: "Levent ofis", region: "istanbul", category: "volume", price: 44_000_000, changePct: -0.8, volume: 1_240, remainingMin: 36, dir: "down" },
  { id: "4", code: "BODRUM-V", property: "Bodrum villa", region: "bodrum", category: "ending", price: 37_900_000, changePct: 0.6, volume: 410, remainingMin: 18, dir: "up" },
  { id: "5", code: "BEŞİKTAŞ-D", property: "Besiktas daire", region: "istanbul", category: "active", price: 16_100_000, changePct: -1.1, volume: 910, remainingMin: 65, dir: "down" },
  { id: "6", code: "İZMİR-K", property: "Izmir konut", region: "ege", category: "rising", price: 9_450_000, changePct: 1.8, volume: 600, remainingMin: 89, dir: "up" },
  { id: "7", code: "ANKARA-O", property: "Ankara ofis", region: "ankara", category: "volume", price: 13_650_000, changePct: 0.2, volume: 1_080, remainingMin: 74, dir: "up" },
  { id: "8", code: "SARIYER-V", property: "Sariyer villa", region: "istanbul", category: "active", price: 51_200_000, changePct: -0.5, volume: 460, remainingMin: 125, dir: "down" },
  { id: "9", code: "ALACATI-A", property: "Alacati arsa", region: "ege", category: "ending", price: 22_400_000, changePct: 0.9, volume: 570, remainingMin: 22, dir: "up" },
  { id: "10", code: "MURATPAŞA-D", property: "Antalya daire", region: "akdeniz", category: "rising", price: 11_900_000, changePct: -0.3, volume: 690, remainingMin: 95, dir: "down" },
];

type RegionCode = MarketAsset["region"];

export type RegionHeatStat = {
  key: RegionCode;
  index: number;
  change: number;
  volume: number;
};

const ALL_REGIONS: RegionCode[] = ["istanbul", "ege", "akdeniz", "ankara", "bodrum"];

function buildRegionHeatFromAssets(assets: MarketAsset[]): RegionHeatStat[] {
  return ALL_REGIONS.map((key) => {
    const rows = assets.filter((a) => a.region === key);
    return {
      key,
      index: rows.reduce((acc, r) => acc + r.price, 0) / Math.max(1, rows.length),
      change: rows.reduce((acc, r) => acc + r.changePct, 0) / Math.max(1, rows.length),
      volume: rows.reduce((acc, r) => acc + r.volume, 0),
    };
  });
}

function buildRegionHeatFromDb(
  statsByRegion: Map<string, TransactionStatRow>,
  indexByRegion: Map<string, PriceIndexRow>,
): RegionHeatStat[] {
  return ALL_REGIONS.map((key) => {
    const stats = statsByRegion.get(key);
    const idx = indexByRegion.get(key);
    return {
      key,
      index: Number(idx?.index_value ?? stats?.avg_price_try ?? 0),
      change: Number(idx?.change_pct ?? 0),
      volume: Number(stats?.volume_try ?? 0),
    };
  });
}

type TransactionStatRow = {
  region_code: string;
  stat_date: string;
  volume_try: number | null;
  trade_count: number | null;
  avg_price_try: number | null;
};

type PriceIndexRow = {
  region_code: string;
  change_pct: number | null;
  index_value: number | null;
};

type ListingRow = {
  id: string;
  title: string;
  city: string | null;
  district: string | null;
  start_price_try: number | null;
  auctions: { ends_at: string | null; status: string | null }[] | null;
};

function isMissingSchemaError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes("could not find") ||
    msg.includes("schema cache")
  );
}

function inferRegion(city: string | null, district: string | null): RegionCode {
  const basis = `${city ?? ""} ${district ?? ""}`.toLocaleLowerCase("tr-TR");
  if (/istanbul|şişli|kadıköy|beşiktaş|levent|sarıyer/.test(basis)) return "istanbul";
  if (/ankara|çankaya|keçiören/.test(basis)) return "ankara";
  if (/bodrum|muğla|çeşme|alaçatı/.test(basis)) return "bodrum";
  if (/antalya|muratpaşa|akdeniz/.test(basis)) return "akdeniz";
  if (/izmir|ege|bornova|karşıyaka/.test(basis)) return "ege";
  return "istanbul";
}

function buildTickerCode(district: string | null, title: string): string {
  const raw = (district?.trim() || title.trim().split(/\s+/)[0] || "VAR").slice(0, 8);
  return `${raw.toLocaleUpperCase("tr-TR").replace(/\s+/g, "")}-D`;
}

function inferCategory(remainingMin: number, volume: number): MarketAsset["category"] {
  if (remainingMin <= 30) return "ending";
  if (volume >= 900) return "volume";
  if (volume >= 550) return "rising";
  return "active";
}

function mapListingToAsset(
  row: ListingRow,
  stats?: TransactionStatRow,
  indexRow?: PriceIndexRow,
): MarketAsset {
  const region = inferRegion(row.city, row.district);
  const auction = row.auctions?.[0];
  const endsAt = auction?.ends_at ? new Date(auction.ends_at).getTime() : Date.now() + 86_400_000;
  const remainingMin = Math.max(1, Math.round((endsAt - Date.now()) / 60_000));
  const price = Number(row.start_price_try ?? indexRow?.index_value ?? 0);
  const volume = Number(stats?.volume_try ?? stats?.trade_count ?? 0);
  const changePct = Number(indexRow?.change_pct ?? 0);

  return {
    id: row.id,
    code: buildTickerCode(row.district, row.title),
    property: row.title,
    region,
    category: inferCategory(remainingMin, volume),
    price: Math.max(1, Math.round(price)),
    changePct: Number(changePct.toFixed(2)),
    volume: Math.max(0, Math.round(volume)),
    remainingMin,
    dir: changePct >= 0 ? "up" : "down",
  };
}

async function fetchLiveMarket(): Promise<{ assets: MarketAsset[]; isLive: boolean; regionHeat: RegionHeatStat[] }> {
  if (!isSupabaseConfigured()) {
    return {
      assets: INITIAL_MARKET_ASSETS,
      isLive: false,
      regionHeat: buildRegionHeatFromAssets(INITIAL_MARKET_ASSETS),
    };
  }

  const since = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);

  const [statsRes, indexRes, listingsRes] = await Promise.all([
    supabase
      .from("transaction_stats")
      .select("region_code, stat_date, volume_try, trade_count, avg_price_try")
      .gte("stat_date", since)
      .order("stat_date", { ascending: false })
      .limit(50),
    supabase
      .from("price_index")
      .select("region_code, change_pct, index_value, index_date")
      .eq("source", "platform")
      .order("index_date", { ascending: false })
      .limit(50),
    supabase
      .from("listings")
      .select("id, title, city, district, start_price_try, auctions(ends_at, status)")
      .in("status", ["active", "closed"])
      .limit(50),
  ]);

  const schemaMissing =
    isMissingSchemaError(statsRes.error) ||
    isMissingSchemaError(indexRes.error) ||
    isMissingSchemaError(listingsRes.error);

  if (schemaMissing) {
    return {
      assets: INITIAL_MARKET_ASSETS,
      isLive: false,
      regionHeat: buildRegionHeatFromAssets(INITIAL_MARKET_ASSETS),
    };
  }

  const statsByRegion = new Map<string, TransactionStatRow>();
  for (const row of statsRes.data ?? []) {
    const r = row as TransactionStatRow;
    if (!statsByRegion.has(r.region_code)) statsByRegion.set(r.region_code, r);
  }

  const indexByRegion = new Map<string, PriceIndexRow>();
  for (const row of indexRes.data ?? []) {
    const r = row as PriceIndexRow;
    if (!indexByRegion.has(r.region_code)) indexByRegion.set(r.region_code, r);
  }

  const listingRows = (listingsRes.data ?? []) as ListingRow[];
  if (!listingRows.length) {
    return {
      assets: INITIAL_MARKET_ASSETS,
      isLive: false,
      regionHeat: buildRegionHeatFromDb(statsByRegion, indexByRegion),
    };
  }

  const assets = listingRows.map((row) => {
    const region = inferRegion(row.city, row.district);
    return mapListingToAsset(row, statsByRegion.get(region), indexByRegion.get(region));
  });

  return {
    assets,
    isLive: true,
    regionHeat: buildRegionHeatFromDb(statsByRegion, indexByRegion),
  };
}

export function useLiveMarket() {
  const [data, setData] = useState<MarketAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [regionHeat, setRegionHeat] = useState<RegionHeatStat[]>(() =>
    buildRegionHeatFromAssets(INITIAL_MARKET_ASSETS),
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLiveMarket();
      setData(result.assets);
      setIsLive(result.isLive);
      setRegionHeat(result.regionHeat);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Borsa verisi alınamadı";
      setError(msg);
      setData(INITIAL_MARKET_ASSETS);
      setIsLive(false);
      setRegionHeat(buildRegionHeatFromAssets(INITIAL_MARKET_ASSETS));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, 30_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const displayData = data.length > 0 ? data : INITIAL_MARKET_ASSETS;

  return { data: displayData, loading, error, isLive, regionHeat, refresh };
}
