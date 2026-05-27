import { createMarketSnapshot, type MarketDataAsset } from "../../../shared/borsa";
import { DEMO_MARKET_ASSETS } from "../../../shared/demoMarket";

export async function fetchBorsaAssets(forceError = false): Promise<MarketDataAsset[]> {
  await new Promise((resolve) => setTimeout(resolve, 260));
  if (forceError) throw new Error("Mock error");
  return DEMO_MARKET_ASSETS;
}

export function buildSnapshotFromAssets(assets: MarketDataAsset[]) {
  return createMarketSnapshot(assets);
}
