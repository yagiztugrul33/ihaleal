/**
 * Demo notu: Bu dosya simulasyon order book ureterek UI kararliligini test eder.
 * Gercek emir ve eslestirme akisinda cekirdek islem katmani + lisansli PSP zorunludur.
 */

export type OrderSide = "bid" | "ask";

export type OrderBookBid = {
  bidder: string;
  price: number;
  quantity: number;
  side?: OrderSide;
};

export type OrderBookLevel = {
  price: number;
  quantity: number;
  cumulativeQuantity: number;
  orderCount: number;
};

export type OrderBookSnapshot = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bestBid: number | null;
  bestAsk: number | null;
  spread: number | null;
};

function groupLevels(bids: OrderBookBid[], side: OrderSide): OrderBookLevel[] {
  const map = new Map<number, { quantity: number; orderCount: number }>();
  for (const bid of bids) {
    if (!Number.isFinite(bid.price) || bid.price <= 0) continue;
    const qty = Number.isFinite(bid.quantity) && bid.quantity > 0 ? bid.quantity : 1;
    const current = map.get(bid.price) ?? { quantity: 0, orderCount: 0 };
    map.set(bid.price, { quantity: current.quantity + qty, orderCount: current.orderCount + 1 });
  }

  const sorted = [...map.entries()]
    .map(([price, data]) => ({ price, quantity: data.quantity, orderCount: data.orderCount }))
    .sort((a, b) => (side === "bid" ? b.price - a.price : a.price - b.price));

  let running = 0;
  return sorted.map((entry) => {
    running += entry.quantity;
    return {
      price: entry.price,
      quantity: entry.quantity,
      cumulativeQuantity: running,
      orderCount: entry.orderCount,
    };
  });
}

export function maskBidder(name: string): string {
  const clean = name.trim();
  if (!clean) return "***";
  if (clean.length === 1) return `${clean}***`;
  if (clean.length === 2) return `${clean[0]}***${clean[1]}`;
  return `${clean[0]}***${clean[clean.length - 1]}`;
}

export function buildOrderBook(bids: OrderBookBid[]): OrderBookSnapshot {
  const bidOrders = bids.filter((x) => (x.side ?? "bid") === "bid");
  const askOrders = bids.filter((x) => x.side === "ask");

  const bidLevels = groupLevels(bidOrders, "bid");
  const askLevels = groupLevels(askOrders, "ask");

  const bestBid = bidLevels[0]?.price ?? null;
  const bestAsk = askLevels[0]?.price ?? null;
  const spread = bestBid != null && bestAsk != null ? Math.max(0, bestAsk - bestBid) : null;

  return {
    bids: bidLevels,
    asks: askLevels,
    bestBid,
    bestAsk,
    spread,
  };
}
