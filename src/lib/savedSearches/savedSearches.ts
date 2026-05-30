import type { Auction } from "@/types/auction";
import { getListingNumber } from "@/lib/listingNumber";

export type SavedSearchCriteria = {
  matchedListingIds?: string[];
};

export type SavedSearchRecord = {
  id: string;
  name: string;
  queryText: string;
  city: string | null;
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  sortKey: string | null;
  criteria: SavedSearchCriteria;
  createdAt: string;
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

export function auctionMatchesSavedSearch(auction: Auction, search: Pick<SavedSearchRecord, "queryText" | "city" | "category" | "priceMin" | "priceMax">): boolean {
  const q = normalize(search.queryText);
  if (q.length >= 2) {
    const ln = normalize(getListingNumber(auction));
    const hit =
      normalize(auction.title).includes(q) ||
      normalize(auction.location).includes(q) ||
      normalize(auction.city).includes(q) ||
      normalize(auction.district).includes(q) ||
      normalize(auction.category).includes(q) ||
      ln.includes(q) ||
      (auction.tags?.some((t) => normalize(t).includes(q)) ?? false);
    if (!hit) return false;
  }

  if (search.city && search.city !== "all" && normalize(auction.city) !== normalize(search.city)) {
    return false;
  }
  if (search.category && search.category !== "all" && normalize(auction.category) !== normalize(search.category)) {
    return false;
  }

  const price = auction.currentBid || auction.startingBid || 0;
  if (search.priceMin != null && price < search.priceMin) return false;
  if (search.priceMax != null && price > search.priceMax) return false;

  return true;
}

export function findMatchingListingIds(catalog: Auction[], search: SavedSearchRecord): string[] {
  return catalog.filter((a) => auctionMatchesSavedSearch(a, search)).map((a) => a.id);
}

export function findNewMatches(catalog: Auction[], search: SavedSearchRecord): string[] {
  const known = new Set(search.criteria.matchedListingIds ?? []);
  return findMatchingListingIds(catalog, search).filter((id) => !known.has(id));
}
