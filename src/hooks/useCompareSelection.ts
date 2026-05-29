import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ihaleal_compare_ids";
const MAX_ITEMS = 3;

function loadInitial(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function useCompareSelection() {
  const [ids, setIds] = useState<string[]>(() => loadInitial());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const has = (id: string) => ids.includes(id);

  const toggle = (id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_ITEMS) return prev;
      return [...prev, id];
    });
  };

  const clear = () => setIds([]);

  const isFull = useMemo(() => ids.length >= MAX_ITEMS, [ids.length]);

  return { ids, has, toggle, clear, isFull, maxItems: MAX_ITEMS };
}
