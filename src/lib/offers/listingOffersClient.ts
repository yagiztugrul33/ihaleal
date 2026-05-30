import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { ListingOfferRow, OfferStatus } from "@/lib/offers/listingOffers";

function isMissing(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  return err.code === "PGRST205" || err.code === "42P01" || msg.includes("does not exist");
}

export async function submitListingOffer(input: {
  listingId: string;
  amountTry: number;
  isSealed?: boolean;
  sealedUntil?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Bağlantı yok" };
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return { ok: false, error: "Giriş gerekli" };

  const { error } = await supabase.from("listing_offers").insert({
    listing_id: input.listingId,
    buyer_id: uid,
    amount_try: input.amountTry,
    is_sealed: Boolean(input.isSealed),
    sealed_until: input.sealedUntil ?? null,
    status: "pending",
  });

  if (error) {
    if (isMissing(error)) return { ok: false, error: "Teklif tablosu henüz hazır değil" };
    return { ok: false, error: "Teklif gönderilemedi" };
  }
  return { ok: true };
}

export async function updateOfferStatus(input: {
  offerId: string;
  status: OfferStatus;
  counterAmountTry?: number;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Bağlantı yok" };

  const patch: Record<string, unknown> = { status: input.status };
  if (input.counterAmountTry != null) patch.counter_amount_try = input.counterAmountTry;

  const { error } = await supabase.from("listing_offers").update(patch).eq("id", input.offerId);
  if (error) {
    if (isMissing(error)) return { ok: false, error: "Teklif tablosu henüz hazır değil" };
    return { ok: false, error: "Güncellenemedi" };
  }
  return { ok: true };
}

export async function fetchBuyerOffers(buyerId: string): Promise<ListingOfferRow[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("listing_offers")
    .select("id, listing_id, buyer_id, amount_try, counter_amount_try, status, is_sealed, sealed_until, created_at, listings(title)")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error && isMissing(error)) return [];
  if (error || !data) return [];

  return data.map((row) => {
    const listing = row.listings as { title?: string } | { title?: string }[] | null;
    const title = Array.isArray(listing) ? listing[0]?.title : listing?.title;
    return {
      id: String(row.id),
      listing_id: String(row.listing_id),
      buyer_id: String(row.buyer_id),
      amount_try: Number(row.amount_try),
      counter_amount_try: row.counter_amount_try != null ? Number(row.counter_amount_try) : null,
      status: row.status as ListingOfferRow["status"],
      is_sealed: Boolean(row.is_sealed),
      sealed_until: row.sealed_until ? String(row.sealed_until) : null,
      created_at: String(row.created_at),
      listing_title: title ? String(title) : undefined,
    };
  });
}

export async function fetchSellerOffers(sellerId: string): Promise<ListingOfferRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { data: listings, error: listErr } = await supabase
    .from("listings")
    .select("id, title")
    .eq("seller_id", sellerId)
    .limit(100);

  if (listErr && isMissing(listErr)) return [];
  if (listErr || !listings?.length) return [];

  const ids = listings.map((l) => l.id);
  const titleById = new Map(listings.map((l) => [String(l.id), String(l.title ?? "İlan")]));

  const { data, error } = await supabase
    .from("listing_offers")
    .select("id, listing_id, buyer_id, amount_try, counter_amount_try, status, is_sealed, sealed_until, created_at")
    .in("listing_id", ids)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error && isMissing(error)) return [];
  if (error || !data) return [];

  return data.map((row) => ({
    id: String(row.id),
    listing_id: String(row.listing_id),
    buyer_id: String(row.buyer_id),
    amount_try: Number(row.amount_try),
    counter_amount_try: row.counter_amount_try != null ? Number(row.counter_amount_try) : null,
    status: row.status as ListingOfferRow["status"],
    is_sealed: Boolean(row.is_sealed),
    sealed_until: row.sealed_until ? String(row.sealed_until) : null,
    created_at: String(row.created_at),
    listing_title: titleById.get(String(row.listing_id)),
  }));
}

export async function fetchOffersForListing(listingId: string): Promise<ListingOfferRow[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("listing_offers")
    .select("id, listing_id, buyer_id, amount_try, counter_amount_try, status, is_sealed, sealed_until, created_at")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error && isMissing(error)) return [];
  if (error || !data) return [];

  return data.map((row) => ({
    id: String(row.id),
    listing_id: String(row.listing_id),
    buyer_id: String(row.buyer_id),
    amount_try: Number(row.amount_try),
    counter_amount_try: row.counter_amount_try != null ? Number(row.counter_amount_try) : null,
    status: row.status as ListingOfferRow["status"],
    is_sealed: Boolean(row.is_sealed),
    sealed_until: row.sealed_until ? String(row.sealed_until) : null,
    created_at: String(row.created_at),
  }));
}
