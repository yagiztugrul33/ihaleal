import { describe, expect, it } from "vitest";

import { calculateInvestmentReturns } from "../../../../shared/calculators";
import {
  buildInvestmentReturnsRows,
  computeInvestmentReturns,
  getDefaultInvestmentReturnsForm,
} from "../investmentReturns.logic";

describe("Investment Returns screen model", () => {
  it("builds expected render rows", () => {
    const result = calculateInvestmentReturns({
      propertyPriceTry: 6000000,
      monthlyRentTry: 38000,
      annualExpensesTry: 72000,
      annualAppreciationPct: 12,
      holdingYears: 5,
      city: "istanbul",
    });
    const rows = buildInvestmentReturnsRows(result);
    expect(rows.map((row) => row.label)).toEqual([
      "Yıllık brüt kira",
      "Yıllık net kira",
      "Brüt getiri",
      "Net getiri",
      "Toplam ROI",
    ]);
  });

  it("returns validation error for invalid holding years", () => {
    const bad = computeInvestmentReturns({
      ...getDefaultInvestmentReturnsForm(),
      holdingYears: "0",
    });
    expect("error" in bad).toBe(true);
  });
});

describe("Investment Returns parity", () => {
  it("matches shared engine for default form", () => {
    const computed = computeInvestmentReturns(getDefaultInvestmentReturnsForm());
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateInvestmentReturns({
      propertyPriceTry: 6000000,
      monthlyRentTry: 38000,
      annualExpensesTry: 72000,
      annualAppreciationPct: 12,
      holdingYears: 5,
      city: "istanbul",
    });
    expect(computed.value.netYieldPct).toBe(expected.netYieldPct);
    expect(computed.value.roiPct).toBe(expected.roiPct);
  });

  it("matches shared engine for TR city reference", () => {
    const computed = computeInvestmentReturns({
      ...getDefaultInvestmentReturnsForm(),
      city: "tr",
      annualAppreciationPct: "8",
    });
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateInvestmentReturns({
      propertyPriceTry: 6000000,
      monthlyRentTry: 38000,
      annualExpensesTry: 72000,
      annualAppreciationPct: 8,
      holdingYears: 5,
      city: "tr",
    });
    expect(computed.value.referenceMultiplierMonths).toBe(expected.referenceMultiplierMonths);
  });
});
