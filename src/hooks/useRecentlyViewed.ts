import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "ihaleal_recently_viewed";
const MAX_ITEMS = 8;

export function useRecentlyViewed() {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentIds));
  }, [recentIds]);

  const addRecent = useCallback((id: string) => {
    setRecentIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [id, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeRecent = useCallback((id: string) => {
    setRecentIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const clearRecent = useCallback(() => {
    setRecentIds([]);
  }, []);

  return { recentIds, addRecent, removeRecent, clearRecent };
}
