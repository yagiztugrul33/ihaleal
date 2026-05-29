import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseClient } from "../(auth)/authClient";
import type { AuctionListItem } from "./types";

type State = {
  loading: boolean;
  error: string | null;
  data: AuctionListItem[];
};

const initialState: State = { loading: true, error: null, data: [] };

// auctions.id ile listings.id AYRI (K-M1): listingId, embed edilen listings'in PK'si değil,
// auctions.listing_id FK'si üzerinden taşınır. Başlık listings(title) embed'inden gelir.
type ListingEmbed = { title: string | null };

type AuctionRow = {
  id: string | number;
  listing_id: string | number | null;
  current_high_bid_try: number | string | null;
  ends_at: string | null;
  status: string | null;
  listings: ListingEmbed | ListingEmbed[] | null;
};

function resolveTitle(listings: AuctionRow["listings"]): string {
  if (!listings) return "İlan";
  const row = Array.isArray(listings) ? listings[0] : listings;
  return row?.title?.trim() ? row.title : "İlan";
}

function toAuctionListItem(row: AuctionRow): AuctionListItem {
  return {
    id: String(row.id),
    listingId: row.listing_id != null ? String(row.listing_id) : "",
    title: resolveTitle(row.listings),
    // listings'de garanti bir görsel kolonu yok; boş bırak (kart yer tutucu gösterir).
    imageUrl: "",
    currentBidTry: Number(row.current_high_bid_try ?? 0),
    endAtIso: row.ends_at ?? new Date().toISOString(),
  };
}

export function useAuctionList() {
  const [state, setState] = useState<State>(initialState);
  const [forceError, setForceError] = useState(false);

  const fetchRows = useCallback(async (): Promise<AuctionListItem[]> => {
    if (forceError) {
      throw new Error("Mock hata modu aktif.");
    }
    const client = (await getSupabaseClient()) as unknown as SupabaseClient;
    const { data, error } = await client
      .from("auctions")
      .select("id, listing_id, current_high_bid_try, ends_at, status, listings(title)")
      .order("ends_at", { ascending: true });
    if (error) {
      throw new Error(error.message ?? "Sunucu hatası.");
    }
    const rows = (data ?? []) as unknown as AuctionRow[];
    return rows.map(toAuctionListItem);
  }, [forceError]);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const rows = await fetchRows();
      // Boş sonuç (200 + []) HATA DEĞİL: error=null, data=[] → ekran "boş durum" gösterir.
      setState({ loading: false, error: null, data: rows });
    } catch {
      setState({ loading: false, error: "İhale listesi yüklenemedi. Tekrar deneyin.", data: [] });
    }
  }, [fetchRows]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchRows();
        if (!cancelled) setState({ loading: false, error: null, data: rows });
      } catch {
        if (!cancelled) {
          setState({ loading: false, error: "İhale listesi yüklenemedi. Tekrar deneyin.", data: [] });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchRows]);

  return {
    ...state,
    reload: load,
    forceError,
    toggleForceError: () => setForceError((prev) => !prev),
  };
}
