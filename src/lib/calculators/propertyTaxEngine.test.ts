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
    expect(result.revolvingFundFeeTry).toBe(2_227);
    expect(result.totalTitleDeedCostTry).toBe(142_227);
    expect(result.capitalGainTaxTry).toBe(225_000);
    expect(result.exemptionApplied6306).toBe(false);
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

  it("uses 2026 assessment base and revolving fund coefficient", () => {
    const result = calculatePropertyTax({
      purchasePriceTry: 3_000_000,
      salePriceTry: 4_200_000,
      holdingYears: 2,
      officialAssessmentTry2026: 4_800_000,
      revolvingFundCoefficient: 1.5,
    });
    expect(result.deedDutyAssessmentBaseTry).toBe(4_800_000);
    expect(result.deedDutyTotalTry).toBe(192_000);
    expect(result.revolvingFundFeeTry).toBe(3340.5);
  });

  it("applies 6306 exemption to title deed costs", () => {
    const result = calculatePropertyTax({
      purchasePriceTry: 2_200_000,
      salePriceTry: 3_100_000,
      holdingYears: 3,
      isUrbanTransformationExempt6306: true,
    });
    expect(result.deedDutyTotalTry).toBe(0);
    expect(result.revolvingFundFeeTry).toBe(0);
    expect(result.totalTitleDeedCostTry).toBe(0);
    expect(result.exemptionApplied6306).toBe(true);
  });
});
