import { useCallback, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type SellerListingMetric = {
  id: string;
  title: string;
  viewCount: number;
  favoriteCount: number;
  messageCount: number;
};

export type SellerAnalyticsSummary = {
  totalViews: number;
  totalFavorites: number;
  totalMessages: number;
  listings: SellerListingMetric[];
};

export function useSellerAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<SellerAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured()) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: listings, error: listErr } = await supabase
        .from("listings")
        .select("id, title, view_count")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (listErr) {
        setData(null);
        setError("Analitik verisi yüklenemedi.");
        return;
      }

      const rows = listings ?? [];
      const ids = rows.map((r) => String(r.id));

      const favByListing = new Map<string, number>();
      if (ids.length) {
        const { data: favRows } = await supabase.from("watchlist").select("listing_id").in("listing_id", ids);
        for (const f of favRows ?? []) {
          const lid = String(f.listing_id);
          favByListing.set(lid, (favByListing.get(lid) ?? 0) + 1);
        }
      }

      const msgByListing = new Map<string, number>();
      if (ids.length) {
        const { data: threads } = await supabase.from("chat_threads").select("id, listing_id").in("listing_id", ids);
        const threadIds = (threads ?? []).map((t) => String(t.id));
        const threadToListing = new Map((threads ?? []).map((t) => [String(t.id), String(t.listing_id)]));
        if (threadIds.length) {
          const { data: msgs } = await supabase.from("chat_messages").select("thread_id").in("thread_id", threadIds);
          for (const m of msgs ?? []) {
            const lid = threadToListing.get(String(m.thread_id));
            if (lid) msgByListing.set(lid, (msgByListing.get(lid) ?? 0) + 1);
          }
        }
      }

      const metrics: SellerListingMetric[] = rows.map((r) => {
        const id = String(r.id);
        return {
          id,
          title: String(r.title ?? "İlan"),
          viewCount: Number(r.view_count ?? 0),
          favoriteCount: favByListing.get(id) ?? 0,
          messageCount: msgByListing.get(id) ?? 0,
        };
      });

      setData({
        totalViews: metrics.reduce((a, m) => a + m.viewCount, 0),
        totalFavorites: metrics.reduce((a, m) => a + m.favoriteCount, 0),
        totalMessages: metrics.reduce((a, m) => a + m.messageCount, 0),
        listings: metrics,
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
