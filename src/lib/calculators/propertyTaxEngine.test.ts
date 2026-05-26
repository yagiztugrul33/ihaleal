import { describe, expect, it } from "vitest";
import { calculatePropertyTax } from "./propertyTaxEngine";

describe("propertyTaxEngine", () => {
  it("calculates deed duty and capital gain tax under 5 years", () => {
    const result = calculatePropertyTax({
      purchasePriceTry: 2_000_000,
      salePriceTry: 3_500_000,
      holdingYears: 3,
    });
    expect(result.deedDutyTotalTry).toBe(140_000);
    expect(result.deedDutyBuyerTry).toBe(70_000);
    expect(result.deedDutySellerTry).toBe(70_000);
    expect(result.capitalGainTaxTry).toBe(225_000);
    expect(result.fiveYearExemptApplied).toBe(false);
  });

  it("applies 5-year exemption", () => {
    const result = calculatePropertyTax({
      purchasePriceTry: 2_000_000,
      salePriceTry: 3_500_000,
      holdingYears: 6,
    });
    expect(result.capitalGainTaxTry).toBe(0);
    expect(result.fiveYearExemptApplied).toBe(true);
  });
});
