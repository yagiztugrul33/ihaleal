import { describe, expect, it } from "vitest";
import {
  calcBidBond,
  getListingPackagePrice,
  FEES,
  listingPriceAnomalyMessage,
  LISTING_PRICE_ANOMALY_RATIO,
  calcCommissionBreakdown,
  calcSellerNet,
  calcBuyerTotal,
  estimateBuyerClosingCosts,
  feeBadgeLabel,
  formatBidBondPercent,
  FEE_TEXTS,
} from "../fees";

describe("fees", () => {
  it("calcBidBond rounds percent of bid", () => {
    expect(calcBidBond(1_000_000)).toBe(Math.round(1_000_000 * FEES.bidBondRate));
  });

  it("getListingPackagePrice stub returns 0 (ilan paketi kalktı)", () => {
    expect(getListingPackagePrice("standart")).toBe(0);
    expect(getListingPackagePrice("pro")).toBe(0);
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

  it("listingPriceAnomalyMessage returns null for non-finite", () => {
    expect(listingPriceAnomalyMessage(Number.NaN, 1)).toBeNull();
    expect(listingPriceAnomalyMessage(1, 0)).toBeNull();
  });

  it("calcCommissionBreakdown aggregates VAT and offsets", () => {
    const b = calcCommissionBreakdown(1_000_000, 100, 50, 0.01);
    expect(b.saleAmount).toBe(1_000_000);
    expect(b.totalVAT).toBeCloseTo(b.totalCommission * FEES.vatRate);
    expect(b.offsetTotal).toBe(150);
  });

  it("calcSellerNet subtracts commission and VAT", () => {
    const n = calcSellerNet(2_000_000);
    expect(n.gross).toBe(2_000_000);
    expect(n.net).toBeLessThan(n.gross);
  });

  it("calcBuyerTotal and estimateBuyerClosingCosts are consistent", () => {
    const t = calcBuyerTotal(1_000_000);
    expect(t.total).toBeGreaterThanOrEqual(t.bid);
    const c = estimateBuyerClosingCosts(1_000_000);
    expect(c.total).toBeGreaterThanOrEqual(t.total);
  });

  it("fee helpers return non-empty strings", () => {
    expect(feeBadgeLabel().length).toBeGreaterThan(3);
    expect(formatBidBondPercent()).toContain("%");
    expect(FEE_TEXTS.sellerSummary()).toContain("Satıcı");
  });
});
