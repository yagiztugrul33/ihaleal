import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type ListingRatingSummary = {
  avgRating: number;
  reviewCount: number;
};

export type SellerRatingSummary = ListingRatingSummary;

function summarizeRows(rows: { rating: number | null }[]): ListingRatingSummary {
  if (!rows.length) return { avgRating: 0, reviewCount: 0 };
  const reviewCount = rows.length;
  const sum = rows.reduce((acc, r) => acc + Number(r.rating ?? 0), 0);
  return {
    avgRating: Math.round((sum / reviewCount) * 10) / 10,
    reviewCount,
  };
}

export async function fetchListingRatingSummaries(
  listingIds: string[],
): Promise<Map<string, ListingRatingSummary>> {
  const out = new Map<string, ListingRatingSummary>();
  if (!isSupabaseConfigured() || listingIds.length === 0) return out;

  const { data, error } = await supabase
    .from("listing_reviews")
    .select("listing_id, rating")
    .in("listing_id", listingIds);

  if (error || !data) return out;

  const byListing = new Map<string, { rating: number | null }[]>();
  for (const row of data) {
    const id = String(row.listing_id);
    const bucket = byListing.get(id) ?? [];
    bucket.push({ rating: row.rating });
    byListing.set(id, bucket);
  }

  for (const id of listingIds) {
    out.set(id, summarizeRows(byListing.get(id) ?? []));
  }
  return out;
}

export async function fetchSellerRatingSummaries(
  sellerIds: string[],
): Promise<Map<string, SellerRatingSummary>> {
  const out = new Map<string, SellerRatingSummary>();
  if (!isSupabaseConfigured() || sellerIds.length === 0) return out;

  const { data, error } = await supabase
    .from("listing_reviews")
    .select("reviewed_id, rating")
    .in("reviewed_id", sellerIds);

  if (error || !data) return out;

  const bySeller = new Map<string, { rating: number | null }[]>();
  for (const row of data) {
    const id = String(row.reviewed_id);
    const bucket = bySeller.get(id) ?? [];
    bucket.push({ rating: row.rating });
    bySeller.set(id, bucket);
  }

  for (const id of sellerIds) {
    out.set(id, summarizeRows(bySeller.get(id) ?? []));
  }
  return out;
}
