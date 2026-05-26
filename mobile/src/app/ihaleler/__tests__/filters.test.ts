import { describe, expect, it } from "vitest";

import { MOCK_AUCTIONS } from "../data";
import { applyAuctionFilters, getAuctionStatus } from "../filters";
import type { AuctionFilters } from "../types";

const NOW = Date.now();

describe("ihaleler filters", () => {
  it("derives status from remaining time", () => {
    const open = new Date(NOW + 20 * 60 * 60 * 1000).toISOString();
    const closing = new Date(NOW + 2 * 60 * 60 * 1000).toISOString();
    const closed = new Date(NOW - 2 * 60 * 60 * 1000).toISOString();

    expect(getAuctionStatus(open, NOW)).toBe("open");
    expect(getAuctionStatus(closing, NOW)).toBe("closing");
    expect(getAuctionStatus(closed, NOW)).toBe("closed");
  });

  it("filters by status + price range", () => {
    const filters: AuctionFilters = {
      status: "open",
      minBidTry: 5_000_000,
      maxBidTry: 13_000_000,
      maxRemainingHours: null,
      sortBy: "remainingAsc",
    };

    const out = applyAuctionFilters(MOCK_AUCTIONS, filters, NOW);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((item) => item.currentBidTry >= 5_000_000 && item.currentBidTry <= 13_000_000)).toBe(true);
    expect(out.every((item) => getAuctionStatus(item.endAtIso, NOW) === "open")).toBe(true);
  });

  it("sorts by descending price", () => {
    const filters: AuctionFilters = {
      status: "all",
      minBidTry: null,
      maxBidTry: null,
      maxRemainingHours: null,
      sortBy: "bidDesc",
    };
    const out = applyAuctionFilters(MOCK_AUCTIONS, filters, NOW);
    expect(out[0].currentBidTry).toBeGreaterThanOrEqual(out[out.length - 1].currentBidTry);
  });
});
