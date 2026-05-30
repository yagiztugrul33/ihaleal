import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mock = vi.hoisted(() => ({
  configured: false,
  user: null as { id: string } | null,
}));

vi.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: () => mock.configured,
  supabase: {
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
      upsert: async () => ({ error: null }),
      delete: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
    }),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: mock.user }),
}));

import { useFavorites } from "./useFavorites";

const STORAGE_KEY = "ihaleal_favorites";

describe("useFavorites (local mode)", () => {
  beforeEach(() => {
    mock.configured = false;
    mock.user = null;
    localStorage.clear();
  });

  it("adds and removes favorite in localStorage when logged out", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("listing-a");
    });
    expect(result.current.isFavorite("listing-a")).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toContain("listing-a");

    act(() => {
      result.current.toggleFavorite("listing-a");
    });
    expect(result.current.isFavorite("listing-a")).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).not.toContain("listing-a");
  });

  it("addFavorite is idempotent", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.addFavorite("x");
      result.current.addFavorite("x");
    });
    expect(result.current.count).toBe(1);
  });
});
