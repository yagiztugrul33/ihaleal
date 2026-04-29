import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Supabase `auctions` UUID satırı için canlı güncelleme (Realtime). Demo/statik id’lerde no-op. */
export function useAuctionRealtime(auctionId: string | undefined) {
  const [highBidTry, setHighBidTry] = useState<number | null>(null);
  const [endsAtIso, setEndsAtIso] = useState<string | null>(null);

  useEffect(() => {
    if (!auctionId || !isSupabaseConfigured() || !UUID_RE.test(auctionId)) {
      setHighBidTry(null);
      setEndsAtIso(null);
      return;
    }

    let cancelled = false;

    void supabase
      .from("auctions")
      .select("current_high_bid_try,ends_at")
      .eq("id", auctionId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.current_high_bid_try != null) setHighBidTry(Number(data.current_high_bid_try));
        if (data.ends_at) setEndsAtIso(String(data.ends_at));
      });

    const channel = supabase
      .channel(`auction-live-${auctionId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${auctionId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.current_high_bid_try != null) setHighBidTry(Number(row.current_high_bid_try));
          if (row.ends_at != null) setEndsAtIso(String(row.ends_at));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [auctionId]);

  return { highBidTry, endsAtIso };
}
