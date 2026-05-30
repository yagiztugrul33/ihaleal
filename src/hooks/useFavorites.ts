import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const STORAGE_KEY = "ihaleal_favorites";

function readLocalFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

function isMissingSchemaError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  const code = err.code ?? "";
  const msg = (err.message ?? "").toLowerCase();
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("does not exist") ||
    msg.includes("could not find") ||
    msg.includes("schema cache")
  );
}

async function resolveListingId(
  auctionOrListingId: string,
): Promise<{ listingId: string | null; price: number }> {
  if (!isSupabaseConfigured()) return { listingId: null, price: 0 };

  const { data: auc } = await supabase
    .from("auctions")
    .select("listing_id, current_high_bid_try")
    .eq("id", auctionOrListingId)
    .maybeSingle();

  if (auc?.listing_id) {
    return { listingId: auc.listing_id, price: Number(auc.current_high_bid_try) || 0 };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, start_price_try")
    .eq("id", auctionOrListingId)
    .maybeSingle();

  if (listing?.id) {
    return { listingId: listing.id, price: Number(listing.start_price_try) || 0 };
  }

  return { listingId: null, price: 0 };
}

async function fetchWatchlistFavoriteIds(): Promise<string[]> {
  const { data, error } = await supabase.from("watchlist").select("listing_id");
  if (error) {
    if (isMissingSchemaError(error)) return readLocalFavorites();
    throw error;
  }

  const listingIds = data?.map((row) => row.listing_id) ?? [];
  if (listingIds.length === 0) return [];

  const { data: auctions, error: aucErr } = await supabase
    .from("auctions")
    .select("id, listing_id")
    .in("listing_id", listingIds);

  if (aucErr && !isMissingSchemaError(aucErr)) throw aucErr;

  const favIds: string[] = [];
  const mapped = new Set<string>();
  for (const row of auctions ?? []) {
    favIds.push(row.id);
    mapped.add(row.listing_id);
  }
  for (const listingId of listingIds) {
    if (!mapped.has(listingId)) favIds.push(listingId);
  }
  return favIds;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>(() => readLocalFavorites());
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      setFavorites(readLocalFavorites());
      setSyncError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setSyncError(null);

    void fetchWatchlistFavoriteIds()
      .then((ids) => {
        if (!cancelled) setFavorites(ids);
      })
      .catch(() => {
        if (!cancelled) {
          setSyncError("Favoriler yüklenemedi; yerel kayıtlar gösteriliyor.");
          setFavorites(readLocalFavorites());
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const persistAdd = useCallback(
    async (id: string) => {
      if (!user || !isSupabaseConfigured()) return;
      const { listingId, price } = await resolveListingId(id);
      if (!listingId) return;

      const { error } = await supabase.from("watchlist").upsert(
        {
          user_id: user.id,
          listing_id: listingId,
          price_at_add: price,
        },
        { onConflict: "user_id,listing_id" },
      );

      if (error && !isMissingSchemaError(error)) {
        console.warn("[watchlist] add failed", error.message);
      }
    },
    [user],
  );

  const persistRemove = useCallback(
    async (id: string) => {
      if (!user || !isSupabaseConfigured()) return;
      const { listingId } = await resolveListingId(id);
      if (!listingId) return;

      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);

      if (error && !isMissingSchemaError(error)) {
        console.warn("[watchlist] remove failed", error.message);
      }
    },
    [user],
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
        if (prev.includes(id)) {
          void persistRemove(id);
        } else {
          void persistAdd(id);
        }
        return next;
      });
    },
    [persistAdd, persistRemove],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const addFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        if (prev.includes(id)) return prev;
        void persistAdd(id);
        return [...prev, id];
      });
    },
    [persistAdd],
  );

  const removeFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        if (!prev.includes(id)) return prev;
        void persistRemove(id);
        return prev.filter((f) => f !== id);
      });
    },
    [persistRemove],
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    if (user && isSupabaseConfigured()) {
      void supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error && !isMissingSchemaError(error)) {
            console.warn("[watchlist] clear failed", error.message);
          }
        });
    }
  }, [user]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    count: favorites.length,
    loading,
    syncError,
  };
}
