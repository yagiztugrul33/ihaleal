import { useCallback, useEffect, useRef, useState } from "react";
import { useBorsaAnalytics } from "@/hooks/useBorsaAnalytics";
import type { BorsaRegionCode } from "@/lib/borsa/regions";
import { regionLabel } from "@/lib/borsa/regions";

const STORAGE_KEY = "borsa_region_watchlist";
const THRESHOLD_PCT = 0.5;

function loadIds(): BorsaRegionCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) as BorsaRegionCode[] : [];
  } catch {
    return [];
  }
}

export function useBorsaRegionWatchlist() {
  const [watched, setWatched] = useState<BorsaRegionCode[]>(loadIds);
  const { rankings } = useBorsaAnalytics();
  const prevRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
  }, [watched]);

  useEffect(() => {
    for (const r of rankings) {
      if (!watched.includes(r.regionCode)) continue;
      const prev = prevRef.current.get(r.regionCode);
      if (prev != null && Math.abs(r.changePct - prev) >= THRESHOLD_PCT) {
        window.dispatchEvent(
          new CustomEvent("ihaleal:add-toast", {
            detail: {
              message: `${regionLabel(r.regionCode)} endeks değişimi: ${r.changePct >= 0 ? "+" : ""}${r.changePct.toFixed(2)}%`,
              type: "info",
            },
          }),
        );
      }
      prevRef.current.set(r.regionCode, r.changePct);
    }
  }, [rankings, watched]);

  const toggle = useCallback((code: BorsaRegionCode) => {
    setWatched((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }, []);

  return { watched, toggle };
}
