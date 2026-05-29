import { describe, expect, it } from "vitest";
import { calculateInvestmentReturns } from "./investmentReturnsEngine";

describe("investmentReturnsEngine", () => {
  it("calculates gross/net yield, multiplier and ROI", () => {
    const result = calculateInvestmentReturns({
      propertyPriceTry: 5_000_000,
      monthlyRentTry: 25_000,
      annualExpensesTry: 60_000,
      annualAppreciationPct: 12,
      holdingYears: 5,
      city: "istanbul",
    });
    expect(result.grossYieldPct).toBeGreaterThan(0);
    expect(result.netYieldPct).toBeLessThan(result.grossYieldPct);
    expect(result.referenceMultiplierMonths).toBe(212);
    expect(result.roiPct).toBeGreaterThan(0);
  });

  it("changes output for different rent input", () => {
    const lowRent = calculateInvestmentReturns({
      propertyPriceTry: 5_000_000,
      monthlyRentTry: 20_000,
      annualExpensesTry: 60_000,
      annualAppreciationPct: 10,
      holdingYears: 5,
      city: "tr",
    });
    const highRent = calculateInvestmentReturns({
      propertyPriceTry: 5_000_000,
      monthlyRentTry: 35_000,
      annualExpensesTry: 60_000,
      annualAppreciationPct: 10,
      holdingYears: 5,
      city: "tr",
    });
    expect(lowRent.netYieldPct).not.toBe(highRent.netYieldPct);
  });
});
