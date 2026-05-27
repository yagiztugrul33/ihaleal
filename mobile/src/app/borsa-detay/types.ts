import type { MarketDataAsset } from "../../../shared/borsa";

export type WatchlistItem = MarketDataAsset & {
  watching: boolean;
};

export type DataSort = "changeDesc" | "volumeDesc" | "priceDesc";

export type BorsaAlertDirection = "above" | "below";

export type BorsaPriceAlert = {
  id: string;
  assetId: string;
  direction: BorsaAlertDirection;
  targetPrice: number;
  enabled: boolean;
};

export type BorsaAutoBidRule = {
  id: string;
  assetId: string;
  maxBid: number;
  stepTry: number;
  enabled: boolean;
};

export type BorsaPortfolioPosition = {
  assetId: string;
  units: number;
  avgBuyPrice: number;
};
