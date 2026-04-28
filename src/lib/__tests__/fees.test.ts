import { describe, expect, it } from "vitest";
import { calcBidBond, getListingPackagePrice, FEES, listingPriceAnomalyMessage, LISTING_PRICE_ANOMALY_RATIO } from "../fees";

describe("fees", () => {
  it("calcBidBond rounds percent of bid", () => {
    expect(calcBidBond(1_000_000)).toBe(Math.round(1_000_000 * FEES.bidBondRate));
  });

  it("getListingPackagePrice returns placeholder tier prices", () => {
    expect(getListingPackagePrice("standart")).toBe(FEES.listingPackages.standart);
    expect(getListingPackagePrice("pro")).toBe(FEES.listingPackages.pro);
  });

  it("listingPriceAnomalyMessage is null when within band", () => {
    const ref = 5_000_000;
    const maxOk = Math.floor(ref * LISTING_PRICE_ANOMALY_RATIO);
    expect(listingPriceAnomalyMessage(maxOk, ref)).toBeNull();
  });

  it("listingPriceAnomalyMessage warns when start far above reference", () => {
    const msg = listingPriceAnomalyMessage(7_000_000, 5_000_000);
    expect(msg).toContain("referans");
  });
});
