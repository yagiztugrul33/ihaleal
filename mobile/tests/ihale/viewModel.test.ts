import { describe, expect, it } from "vitest";

import { formatRemainingLabel, toAuctionDetailViewModel } from "../../src/app/ihale/viewModel";

describe("ihale view model", () => {
  it("returns null for unknown id", () => {
    expect(toAuctionDetailViewModel("unknown-id")).toBeNull();
  });

  it("builds detail model for known auction", () => {
    const model = toAuctionDetailViewModel("demo-ihale-1", Date.now());
    expect(model).not.toBeNull();
    expect(model?.minimumNextBidTry).toBeGreaterThan(model?.currentBidTry ?? 0);
  });

  it("formats ended remaining label", () => {
    expect(formatRemainingLabel(-10)).toBe("Süre doldu");
  });
});
