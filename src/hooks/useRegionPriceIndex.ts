import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { slugifyTr } from "@/lib/seo/programmaticSeo";

export type RegionPriceIndex = {
  regionCode: string;
  indexValue: number;
  changePct: number;
  indexDate: string | null;
};

function inferRegionCode(city: string): string {
  const basis = city.toLocaleLowerCase("tr-TR");
  if (/istanbul|kadikoy|besiktas|sisli|uskudar|atasehir|maltepe|kartal|pendik|basaksehir|sariyer|beylikduzu/.test(basis)) {
    return "istanbul";
  }
  if (/ankara|cankaya|kecioren|yenimahalle|mamak|etimesgut|sincan|altindag|pursaklar/.test(basis)) {
    return "ankara";
  }
  if (/izmir|konak|karsiyaka|bornova|buca|cigli|bayrakli|gaziemir|menemen|torbali/.test(basis)) {
    return "ege";
  }
  if (/antalya|muratpasa|konyaalti|kepez|alanya|manavgat|serik|kumluca|akdeniz/.test(basis)) {
    return "akdeniz";
  }
  if (/bodrum|mugla|fethiye|marmaris|milas|datca|dalaman|mentese/.test(basis)) {
    return "bodrum";
  }
  const slug = slugifyTr(city);
  if (slug.includes("istanbul")) return "istanbul";
  if (slug.includes("ankara")) return "ankara";
  if (slug.includes("izmir")) return "ege";
  if (slug.includes("antalya")) return "akdeniz";
  return "istanbul";
}

export function useRegionPriceIndex(cityName: string) {
  const [data, setData] = useState<RegionPriceIndex | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!cityName || !isSupabaseConfigured()) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const regionCode = inferRegionCode(cityName);
      const { data: row, error } = await supabase
        .from("price_index")
        .select("region_code, index_value, change_pct, index_date")
        .eq("region_code", regionCode)
        .order("index_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !row) {
        setData(null);
        return;
      }

      setData({
        regionCode: String(row.region_code),
        indexValue: Number(row.index_value ?? 0),
        changePct: Number(row.change_pct ?? 0),
        indexDate: row.index_date ? String(row.index_date) : null,
      });
    } finally {
      setLoading(false);
    }
  }, [cityName]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, reload };
}
