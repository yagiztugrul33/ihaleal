import { isSupabaseConfigured } from "@/lib/supabaseEnv";
import { getSupabase } from "@/lib/supabaseLazy";
import { auctionFromRemoteRow, type DbAuctionRow } from "@/lib/remoteAuctionsMapper";
import type { Auction } from "@/types/auction";

/**
 * Uzak açık/kapanmış ilanlara bağlı ihale satırlarını okur (RLS: anon + oturum).
 */
export async function fetchRemoteAuctionsCatalog(): Promise<Auction[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("auctions")
    .select(
      `
      id,
      status,
      starts_at,
      ends_at,
      current_high_bid_try,
      listings (
        id,
        title,
        body,
        status,
        city,
        district,
        category,
        start_price_try,
        reserve_price_try,
        buy_now_price_try,
        is_featured,
        featured_badge,
        view_count
      )
    `
    )
    .in("status", ["scheduled", "live", "ended", "cancelled"])
    .order("ends_at", { ascending: true })
    .limit(200);

  if (error || !data?.length) return [];

  const rows = data as unknown as DbAuctionRow[];
  return rows
    .filter((r) => {
      const l = Array.isArray(r.listings) ? r.listings[0] : r.listings;
      return l && ["active", "closed", "review"].includes(l.status);
    })
    .map(auctionFromRemoteRow);
}
