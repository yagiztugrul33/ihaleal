import type { FloorBand, RoomFilter, SiteFilter, ViewFilter } from "@/lib/auctionFilterHelpers";

const STORAGE_KEY = "ihaleal_saved_auction_search";

export type SavedAuctionSearchState = {
  filter: "all" | "live" | "upcoming" | "ended";
  priceRange: [number, number];
  sqmRange: [number, number];
  selectedCity: string;
  selectedCategory: string;
  searchQuery: string;
  sortBy: "default" | "bid_asc" | "bid_desc" | "ending";
  buildingAgeMax: number;
  roomFilter: RoomFilter;
  floorBand: FloorBand;
  siteFilter: SiteFilter;
  viewFilter: ViewFilter;
};

export const defaultSavedSearch = (): SavedAuctionSearchState => ({
  filter: "all",
  priceRange: [0, 200_000_000],
  sqmRange: [0, 600],
  selectedCity: "all",
  selectedCategory: "all",
  searchQuery: "",
  sortBy: "default",
  buildingAgeMax: 40,
  roomFilter: "all",
  floorBand: "all",
  siteFilter: "any",
  viewFilter: "all",
});

export function loadSavedAuctionSearch(): SavedAuctionSearchState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedAuctionSearchState;
    if (!parsed?.priceRange?.[1]) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAuctionSearch(state: SavedAuctionSearchState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
