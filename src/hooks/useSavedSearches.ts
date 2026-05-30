import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { Auction } from "@/types/auction";
import {
  findMatchingListingIds,
  findNewMatches,
  type SavedSearchRecord,
} from "@/lib/savedSearches/savedSearches";
import {
  createSavedSearch,
  deleteSavedSearch,
  fetchSavedSearches,
  insertSearchMatchNotification,
  updateSavedSearchCriteria,
} from "@/lib/savedSearches/savedSearchesClient";

export function useSavedSearches(catalog: Auction[] = []) {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearchRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setSearches([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setSearches(await fetchSavedSearches(user.id));
    } catch {
      setError("Kayıtlı aramalar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const checkMatches = useCallback(async () => {
    if (!user?.id || catalog.length === 0 || searches.length === 0) return;

    for (const search of searches) {
      const newIds = findNewMatches(catalog, search);
      if (newIds.length === 0) continue;

      const allIds = findMatchingListingIds(catalog, search);
      await insertSearchMatchNotification({
        userId: user.id,
        searchName: search.name,
        newCount: newIds.length,
        sampleListingId: newIds[0],
      });
      await updateSavedSearchCriteria(search.id, { matchedListingIds: allIds });
    }
    await reload();
  }, [user, catalog, searches, reload]);

  const matchCheckKey = useRef("");
  useEffect(() => {
    if (!user?.id || catalog.length === 0 || searches.length === 0) return;
    const key = `${catalog.length}:${searches.map((s) => s.id).join(",")}`;
    if (matchCheckKey.current === key) return;
    matchCheckKey.current = key;
    void checkMatches();
  }, [user, catalog, searches, checkMatches]);

  const saveSearch = useCallback(
    async (input: {
      name: string;
      queryText: string;
      city?: string | null;
      category?: string | null;
      priceMin?: number | null;
      priceMax?: number | null;
      sortKey?: string | null;
    }) => {
      if (!user?.id) return { ok: false as const, error: "Giriş gerekli" };
      setBusy(true);
      try {
        const draft: SavedSearchRecord = {
          id: "draft",
          name: input.name,
          queryText: input.queryText,
          city: input.city ?? null,
          category: input.category ?? null,
          priceMin: input.priceMin ?? null,
          priceMax: input.priceMax ?? null,
          sortKey: input.sortKey ?? null,
          criteria: {},
          createdAt: new Date().toISOString(),
        };
        const matchedListingIds = findMatchingListingIds(catalog, draft);
        const res = await createSavedSearch({
          userId: user.id,
          ...input,
          matchedListingIds,
        });
        if (res.ok) await reload();
        return res;
      } finally {
        setBusy(false);
      }
    },
    [user, catalog, reload],
  );

  const removeSearch = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        const res = await deleteSavedSearch(id);
        if (res.ok) await reload();
        return res;
      } finally {
        setBusy(false);
      }
    },
    [reload],
  );

  return {
    searches,
    loading,
    busy,
    error,
    saveSearch,
    removeSearch,
    reload,
  };
}
