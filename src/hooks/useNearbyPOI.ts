// R13.2 — Yakın POI gerçek API hook (Supabase Edge: nearby-poi)
// Fallback: mock veri (pantsir-mock.ts) eğer edge fail
// Cache: localStorage 1 saat (client-side, edge cache zaten 7 gün)

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface NearbyPOI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceM: number;
  type: string;
}

export type NearbyPOICategory = "saglik" | "egitim" | "devlet" | "ticaret" | "ulasim" | "sosyal";

interface State {
  pois: NearbyPOI[];
  loading: boolean;
  error: string | null;
  source: "edge" | "cache" | "fallback" | null;
}

const LS_PREFIX = "ihaleal_nearby_poi_v1";
const TTL_MS = 60 * 60 * 1000; // 1 saat

function lsKey(lat: number, lng: number, radius: number, category: string): string {
  const latGrid = Math.round(lat * 10000) / 10000;
  const lngGrid = Math.round(lng * 10000) / 10000;
  return `${LS_PREFIX}::${latGrid}::${lngGrid}::${radius}::${category}`;
}

export function useNearbyPOI(
  lat: number | null,
  lng: number | null,
  category: NearbyPOICategory,
  radiusM: number = 1000,
): State {
  const [state, setState] = useState<State>({
    pois: [],
    loading: false,
    error: null,
    source: null,
  });

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;

    setState((s) => ({ ...s, loading: true, error: null }));

    // Try localStorage cache
    try {
      const key = lsKey(lat, lng, radiusM, category);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as { ts: number; pois: NearbyPOI[] };
        if (Date.now() - parsed.ts < TTL_MS) {
          if (!cancelled) {
            setState({ pois: parsed.pois, loading: false, error: null, source: "cache" });
          }
          return;
        }
      }
    } catch {
      // ignore localStorage errors
    }

    const fetchPOI = async () => {
      try {
        const { data, error } = await supabase.functions.invoke<{
          ok: boolean;
          source: "edge" | "cache";
          pois: NearbyPOI[];
          error?: string;
        }>("nearby-poi", {
          body: { lat, lng, radius_m: radiusM, category },
        });

        if (cancelled) return;

        if (error || !data?.ok) {
          throw new Error(error?.message || data?.error || "edge_failed");
        }

        const pois = data.pois ?? [];

        // Persist localStorage
        try {
          const key = lsKey(lat, lng, radiusM, category);
          localStorage.setItem(key, JSON.stringify({ ts: Date.now(), pois }));
        } catch {
          // ignore
        }

        setState({ pois, loading: false, error: null, source: data.source });
      } catch (err) {
        if (cancelled) return;
        setState({
          pois: [],
          loading: false,
          error: err instanceof Error ? err.message : "unknown",
          source: "fallback",
        });
      }
    };

    void fetchPOI();

    return () => {
      cancelled = true;
    };
  }, [lat, lng, category, radiusM]);

  return state;
}
