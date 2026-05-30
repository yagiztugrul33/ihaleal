import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { SavedSearchCriteria, SavedSearchRecord } from "@/lib/savedSearches/savedSearches";

function isMissing(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const msg = (err.message ?? "").toLowerCase();
  return err.code === "PGRST205" || err.code === "42P01" || msg.includes("does not exist");
}

function mapRow(row: {
  id: string;
  name: string;
  query_text: string;
  city: string | null;
  category: string | null;
  price_min: number | null;
  price_max: number | null;
  sort_key: string | null;
  criteria: unknown;
  created_at: string;
}): SavedSearchRecord {
  const criteria = (row.criteria ?? {}) as SavedSearchCriteria;
  return {
    id: String(row.id),
    name: String(row.name),
    queryText: String(row.query_text ?? ""),
    city: row.city ? String(row.city) : null,
    category: row.category ? String(row.category) : null,
    priceMin: row.price_min != null ? Number(row.price_min) : null,
    priceMax: row.price_max != null ? Number(row.price_max) : null,
    sortKey: row.sort_key ? String(row.sort_key) : null,
    criteria,
    createdAt: String(row.created_at),
  };
}

export async function fetchSavedSearches(userId: string): Promise<SavedSearchRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, name, query_text, city, category, price_min, price_max, sort_key, criteria, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error && isMissing(error)) return [];
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function createSavedSearch(input: {
  userId: string;
  name: string;
  queryText: string;
  city?: string | null;
  category?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  sortKey?: string | null;
  matchedListingIds?: string[];
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Bağlantı yok" };

  const criteria: SavedSearchCriteria = {
    matchedListingIds: input.matchedListingIds ?? [],
  };

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      user_id: input.userId,
      name: input.name,
      query_text: input.queryText,
      city: input.city ?? null,
      category: input.category ?? null,
      price_min: input.priceMin ?? null,
      price_max: input.priceMax ?? null,
      sort_key: input.sortKey ?? null,
      criteria,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissing(error)) return { ok: false, error: "Kayıtlı arama tablosu henüz hazır değil" };
    return { ok: false, error: "Arama kaydedilemedi" };
  }
  return { ok: true, id: data?.id ? String(data.id) : undefined };
}

export async function deleteSavedSearch(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Bağlantı yok" };
  const { error } = await supabase.from("saved_searches").delete().eq("id", id);
  if (error) {
    if (isMissing(error)) return { ok: false, error: "Tablo henüz hazır değil" };
    return { ok: false, error: "Silinemedi" };
  }
  return { ok: true };
}

export async function updateSavedSearchCriteria(
  id: string,
  criteria: SavedSearchCriteria,
): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };
  const { error } = await supabase
    .from("saved_searches")
    .update({ criteria, last_notified_at: new Date().toISOString() })
    .eq("id", id);
  if (error && !isMissing(error)) return { ok: false };
  return { ok: true };
}

export async function insertSearchMatchNotification(input: {
  userId: string;
  searchName: string;
  newCount: number;
  sampleListingId?: string;
}): Promise<void> {
  if (!isSupabaseConfigured() || input.newCount <= 0) return;

  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: "saved_search_match",
    channel: "in_app",
    payload: {
      title: "Kayıtlı arama eşleşmesi",
      body: `"${input.searchName}" için ${input.newCount} yeni ilan bulundu.`,
      searchName: input.searchName,
      newCount: input.newCount,
      listingId: input.sampleListingId,
    },
    state: "pending",
  });

  if (error && !isMissing(error) && import.meta.env.DEV) {
    console.warn("[saved_searches] notification insert failed", error.message);
  }
}
