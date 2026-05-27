import type { MarketDataAsset } from "../../../shared/borsa";

export type WatchlistItem = MarketDataAsset & {
  watching: boolean;
};

export type DataSort = "changeDesc" | "volumeDesc" | "priceDesc";
