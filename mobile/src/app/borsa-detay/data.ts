import { createMarketSnapshot, type MarketDataAsset } from "../../../shared/borsa";
import { DEMO_MARKET_ASSETS } from "../../../shared/demoMarket";
import type { BorsaAutoBidRule, BorsaPriceAlert, BorsaPortfolioPosition } from "./types";

type BorsaMockStore = {
  watchlistIds: string[];
  priceAlerts: BorsaPriceAlert[];
  autoBidRules: BorsaAutoBidRule[];
  portfolio: BorsaPortfolioPosition[];
};

const INITIAL_STORE: BorsaMockStore = {
  watchlistIds: DEMO_MARKET_ASSETS.slice(0, 3).map((asset) => asset.id),
  priceAlerts: [],
  autoBidRules: [],
  portfolio: DEMO_MARKET_ASSETS.slice(0, 3).map((asset, idx) => ({
    assetId: asset.id,
    units: idx === 0 ? 2 : 1,
    avgBuyPrice: Math.max(1, Math.round(asset.price * (idx === 0 ? 0.91 : 0.95))),
  })),
};

let mockStore: BorsaMockStore = INITIAL_STORE;

export async function fetchBorsaAssets(forceError = false): Promise<MarketDataAsset[]> {
  await new Promise((resolve) => setTimeout(resolve, 260));
  if (forceError) throw new Error("Mock error");
  return DEMO_MARKET_ASSETS.map((item) => ({ ...item }));
}

export function buildSnapshotFromAssets(assets: MarketDataAsset[]) {
  return createMarketSnapshot(assets);
}

export function readWatchlistIds(): string[] {
  return [...mockStore.watchlistIds];
}

export function toggleWatchlistAsset(assetId: string): string[] {
  const exists = mockStore.watchlistIds.includes(assetId);
  mockStore = {
    ...mockStore,
    watchlistIds: exists
      ? mockStore.watchlistIds.filter((id) => id !== assetId)
      : [...mockStore.watchlistIds, assetId],
  };
  return readWatchlistIds();
}

export function readPriceAlerts(): BorsaPriceAlert[] {
  return mockStore.priceAlerts.map((item) => ({ ...item }));
}

export function createPriceAlert(input: Omit<BorsaPriceAlert, "id" | "enabled">): BorsaPriceAlert[] {
  const next: BorsaPriceAlert = {
    id: `${input.assetId}-${Date.now()}`,
    enabled: true,
    ...input,
  };
  mockStore = {
    ...mockStore,
    priceAlerts: [next, ...mockStore.priceAlerts],
  };
  return readPriceAlerts();
}

export function togglePriceAlert(alertId: string): BorsaPriceAlert[] {
  mockStore = {
    ...mockStore,
    priceAlerts: mockStore.priceAlerts.map((item) => (item.id === alertId ? { ...item, enabled: !item.enabled } : item)),
  };
  return readPriceAlerts();
}

export function readAutoBidRules(): BorsaAutoBidRule[] {
  return mockStore.autoBidRules.map((item) => ({ ...item }));
}

export function createAutoBidRule(input: Omit<BorsaAutoBidRule, "id" | "enabled">): BorsaAutoBidRule[] {
  const next: BorsaAutoBidRule = {
    id: `${input.assetId}-${Date.now()}`,
    enabled: true,
    ...input,
  };
  mockStore = {
    ...mockStore,
    autoBidRules: [next, ...mockStore.autoBidRules],
  };
  return readAutoBidRules();
}

export function toggleAutoBidRule(ruleId: string): BorsaAutoBidRule[] {
  mockStore = {
    ...mockStore,
    autoBidRules: mockStore.autoBidRules.map((item) => (item.id === ruleId ? { ...item, enabled: !item.enabled } : item)),
  };
  return readAutoBidRules();
}

export function removeAutoBidRule(ruleId: string): BorsaAutoBidRule[] {
  mockStore = {
    ...mockStore,
    autoBidRules: mockStore.autoBidRules.filter((item) => item.id !== ruleId),
  };
  return readAutoBidRules();
}

export function readPortfolioPositions(): BorsaPortfolioPosition[] {
  return mockStore.portfolio.map((item) => ({ ...item }));
}
