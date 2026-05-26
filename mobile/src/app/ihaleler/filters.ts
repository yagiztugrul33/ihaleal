import type { AuctionFilters, AuctionListItem, AuctionStatus } from "./types";

export function getRemainingMs(endAtIso: string, nowMs = Date.now()): number {
  return new Date(endAtIso).getTime() - nowMs;
}

export function getAuctionStatus(endAtIso: string, nowMs = Date.now()): AuctionStatus {
  const remaining = getRemainingMs(endAtIso, nowMs);
  if (remaining <= 0) return "closed";
  if (remaining <= 6 * 60 * 60 * 1000) return "closing";
  return "open";
}

export function formatRemaining(endAtIso: string, nowMs = Date.now()): string {
  const remainingMs = getRemainingMs(endAtIso, nowMs);
  if (remainingMs <= 0) return "Süre doldu";
  const totalMinutes = Math.floor(remainingMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}s ${minutes}dk`;
}

export function applyAuctionFilters(
  items: AuctionListItem[],
  filters: AuctionFilters,
  nowMs = Date.now(),
): AuctionListItem[] {
  let output = items.filter((item) => {
    const status = getAuctionStatus(item.endAtIso, nowMs);
    if (filters.status !== "all" && status !== filters.status) return false;
    if (filters.minBidTry != null && item.currentBidTry < filters.minBidTry) return false;
    if (filters.maxBidTry != null && item.currentBidTry > filters.maxBidTry) return false;
    if (filters.maxRemainingHours != null) {
      const remainingHours = getRemainingMs(item.endAtIso, nowMs) / (60 * 60 * 1000);
      if (remainingHours > filters.maxRemainingHours) return false;
    }
    return true;
  });

  output = [...output].sort((a, b) => {
    if (filters.sortBy === "bidAsc") return a.currentBidTry - b.currentBidTry;
    if (filters.sortBy === "bidDesc") return b.currentBidTry - a.currentBidTry;
    return getRemainingMs(a.endAtIso, nowMs) - getRemainingMs(b.endAtIso, nowMs);
  });

  return output;
}
