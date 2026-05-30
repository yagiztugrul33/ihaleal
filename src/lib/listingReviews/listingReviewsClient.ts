import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type ListingRatingSummary = {
  avgRating: number;
  reviewCount: number;
};

export type SellerRatingSummary = ListingRatingSummary;

// listing_reviews.listing_id ve reviewed_id Supabase'de UUID kolonu.
// Demo seed'lerinde "1","2" gibi sayısal id'ler de var; UUID olmayanı
// Supabase'e atarsak 22P02 (invalid input syntax for type uuid) döner ve
// console kirlenir. Bu guard non-UUID id'leri sorgudan çıkarır; çağıran
// için sonuç map'inde boş özet (0/0) döner.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function emptySummary(): ListingRatingSummary {
  return { avgRating: 0, reviewCount: 0 };
}

function summarizeRows(rows: { rating: number | null }[]): ListingRatingSummary {
  if (!rows.length) return emptySummary();
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

  // Önce tüm id'leri boş özetle hazırla; UUID olmayanlar Supabase'e gitmez.
  for (const id of listingIds) {
    out.set(id, emptySummary());
  }

  const uuidIds = listingIds.filter(isUuid);
  if (uuidIds.length === 0) return out;

  const { data, error } = await supabase
    .from("listing_reviews")
    .select("listing_id, rating")
    .in("listing_id", uuidIds);

  if (error || !data) return out;

  const byListing = new Map<string, { rating: number | null }[]>();
  for (const row of data) {
    const id = String(row.listing_id);
    const bucket = byListing.get(id) ?? [];
    bucket.push({ rating: row.rating });
    byListing.set(id, bucket);
  }

  for (const id of uuidIds) {
    out.set(id, summarizeRows(byListing.get(id) ?? []));
  }
  return out;
}

export async function fetchSellerRatingSummaries(
  sellerIds: string[],
): Promise<Map<string, SellerRatingSummary>> {
  const out = new Map<string, SellerRatingSummary>();
  if (!isSupabaseConfigured() || sellerIds.length === 0) return out;

  for (const id of sellerIds) {
    out.set(id, emptySummary());
  }

  const uuidIds = sellerIds.filter(isUuid);
  if (uuidIds.length === 0) return out;

  const { data, error } = await supabase
    .from("listing_reviews")
    .select("reviewed_id, rating")
    .in("reviewed_id", uuidIds);

  if (error || !data) return out;

  const bySeller = new Map<string, { rating: number | null }[]>();
  for (const row of data) {
    const id = String(row.reviewed_id);
    const bucket = bySeller.get(id) ?? [];
    bucket.push({ rating: row.rating });
    bySeller.set(id, bucket);
  }

  for (const id of uuidIds) {
    out.set(id, summarizeRows(bySeller.get(id) ?? []));
  }
  return out;
}
