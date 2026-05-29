import { buildOrderBook, type OrderBookBid } from "@/lib/borsa/orderBook";

/**
 * Demo notu: Tum metrikler mevcut demo varliklardan turetilir.
 * Uretimde gercek alim-satim verisi cekirdek sistem + lisansli veri/PSP katmanindan gelmelidir.
 */

export type MarketDataAsset = {
  id: string;
  code: string;
  property?: string;
  price: number;
  changePct: number;
  volume: number;
  previousClose?: number;
  openPrice?: number;
  high?: number;
  low?: number;
};

export type SegmentKey = "konut" | "ticari" | "arsa" | "turizm";

export type MarketSnapshot = {
  totalVolumeTry: number;
  tradeCount: number;
  averageTradeSizeTry: number;
  activeOrders: number;
  liquidity: {
    spread: number;
    depth: number;
    mostLiquidCodes: string[];
  };
  volatility: {
    marketStdDev: number;
    perAsset: Array<{ code: string; volatility: number }>;
  };
  range: {
    dayHigh: number;
    dayLow: number;
    open: number;
    close: number;
  };
  breadth: {
    rising: number;
    falling: number;
    flat: number;
  };
  segmentDistributionPct: Record<SegmentKey, number>;
};

function round2(value: number): number {
  return Number(value.toFixed(2));
}

function inferSegment(asset: MarketDataAsset): SegmentKey {
  const basis = `${asset.code} ${asset.property ?? ""}`.toLocaleLowerCase("tr-TR");
  if (basis.includes("turizm") || basis.includes("otel") || basis.includes("konaklama")) return "turizm";
  if (basis.includes("arsa")) return "arsa";
  if (basis.includes("ofis") || basis.includes("ticari") || basis.includes("plaza")) return "ticari";
  return "konut";
}

function stdDev(values: number[]): number {
  if (!values.length) return 0;
  const mean = values.reduce((acc, value) => acc + value, 0) / values.length;
  const variance = values.reduce((acc, value) => acc + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function deriveOrderBookBids(assets: MarketDataAsset[]): OrderBookBid[] {
  const levels: OrderBookBid[] = [];
  assets.forEach((asset, idx) => {
    const baseQty = Math.max(1, Math.round(asset.volume / 20));
    const spreadUnit = Math.max(1_000, Math.round(asset.price * 0.0015));
    for (let level = 1; level <= 3; level += 1) {
      levels.push({
        bidder: `${asset.code}-B${level}`,
        price: asset.price - spreadUnit * level,
        quantity: Math.max(1, baseQty - level),
        side: "bid",
      });
      levels.push({
        bidder: `${asset.code}-A${level}`,
        price: asset.price + spreadUnit * (level + (idx % 2 === 0 ? 0 : 1)),
        quantity: Math.max(1, baseQty - level + 1),
        side: "ask",
      });
    }
  });
  return levels;
}

export function createMarketSnapshot(assets: MarketDataAsset[]): MarketSnapshot {
  if (!assets.length) {
    return {
      totalVolumeTry: 0,
      tradeCount: 0,
      averageTradeSizeTry: 0,
      activeOrders: 0,
      liquidity: { spread: 0, depth: 0, mostLiquidCodes: [] },
      volatility: { marketStdDev: 0, perAsset: [] },
      range: { dayHigh: 0, dayLow: 0, open: 0, close: 0 },
      breadth: { rising: 0, falling: 0, flat: 0 },
      segmentDistributionPct: { konut: 0, ticari: 0, arsa: 0, turizm: 0 },
    };
  }

  const totalVolumeTry = assets.reduce((acc, asset) => acc + asset.price * asset.volume, 0);
  const tradeCount = assets.reduce((acc, asset) => acc + Math.max(1, Math.round(asset.volume / 5)), 0);
  const averageTradeSizeTry = tradeCount > 0 ? totalVolumeTry / tradeCount : 0;
  const activeOrders = assets.reduce((acc, asset) => acc + Math.max(2, Math.round(asset.volume / 18)), 0);

  const book = buildOrderBook(deriveOrderBookBids(assets));
  const spread = book.spread ?? 0;
  const depth = book.bids.slice(0, 5).reduce((acc, level) => acc + level.quantity, 0);
  const mostLiquidCodes = [...assets]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 3)
    .map((asset) => asset.code);

  const marketStdDev = stdDev(assets.map((asset) => asset.changePct));
  const perAsset = assets.map((asset) => ({
    code: asset.code,
    volatility: round2(Math.abs(asset.changePct) / 100),
  }));

  const dayHigh = Math.max(...assets.map((asset) => asset.high ?? asset.price));
  const dayLow = Math.min(...assets.map((asset) => asset.low ?? asset.price));
  const open = assets.reduce((acc, asset) => acc + (asset.openPrice ?? asset.price / (1 + asset.changePct / 100)), 0) / Math.max(1, assets.length);
  const close = assets.reduce((acc, asset) => acc + (asset.previousClose ?? asset.price), 0) / Math.max(1, assets.length);

  const rising = assets.filter((asset) => asset.changePct > 0.05).length;
  const falling = assets.filter((asset) => asset.changePct < -0.05).length;
  const flat = Math.max(0, assets.length - rising - falling);

  const segmentCount: Record<SegmentKey, number> = { konut: 0, ticari: 0, arsa: 0, turizm: 0 };
  assets.forEach((asset) => {
    segmentCount[inferSegment(asset)] += 1;
  });
  const totalSegments = Math.max(1, assets.length);
  const segmentDistributionPct: Record<SegmentKey, number> = {
    konut: round2((segmentCount.konut / totalSegments) * 100),
    ticari: round2((segmentCount.ticari / totalSegments) * 100),
    arsa: round2((segmentCount.arsa / totalSegments) * 100),
    turizm: round2((segmentCount.turizm / totalSegments) * 100),
  };

  return {
    totalVolumeTry: round2(totalVolumeTry),
    tradeCount,
    averageTradeSizeTry: round2(averageTradeSizeTry),
    activeOrders,
    liquidity: {
      spread: round2(spread),
      depth,
      mostLiquidCodes,
    },
    volatility: {
      marketStdDev: round2(marketStdDev),
      perAsset,
    },
    range: {
      dayHigh: round2(dayHigh),
      dayLow: round2(dayLow),
      open: round2(open),
      close: round2(close),
    },
    breadth: { rising, falling, flat },
    segmentDistributionPct,
  };
}
