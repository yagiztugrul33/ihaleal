import { describe, expect, it } from "vitest";
import {
  calcBidBond,
  calcBidBondAmount,
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

  it("calcBidBondAmount delegates to calcBidBond", () => {
    expect(calcBidBondAmount(1_000_000)).toBe(calcBidBond(1_000_000));
  });

  it("every FEE_TEXTS entry returns a non-empty string", () => {
    for (const fn of Object.values(FEE_TEXTS)) {
      expect(typeof fn()).toBe("string");
      expect(fn().length).toBeGreaterThan(0);
    }
  });

  it("FEE_TEXTS lines reference the expected figures", () => {
    expect(FEE_TEXTS.refundWindow()).toContain(String(FEES.refundWindowDays));
    expect(FEE_TEXTS.payoutHold()).toContain(String(FEES.payoutHoldDays));
    expect(FEE_TEXTS.bidBondLine()).toContain(formatBidBondPercent());
    expect(FEE_TEXTS.bidBondForfeitLine()).toContain(formatBidBondPercent());
    expect(FEE_TEXTS.monetizationPrinciples()).toContain("komisyon");
    expect(FEE_TEXTS.commissionMatrahLine()).toContain("Komisyon matrahı");
    expect(FEE_TEXTS.commissionExplain()).toContain("KDV");
    expect(FEE_TEXTS.sellerMembershipExplain()).toContain("5.000 TL");
    expect(FEE_TEXTS.buyerMembershipExplain()).toContain("1.000 TL");
    expect(FEE_TEXTS.bidBondExplain()).toContain("%5");
  });
});
