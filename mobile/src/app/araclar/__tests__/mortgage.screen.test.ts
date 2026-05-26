import { describe, expect, it } from "vitest";

import { calculateMortgage } from "../../../../shared/calculators";
import {
  buildMortgageSummaryRows,
  computeMortgage,
  getDefaultMortgageForm,
} from "../mortgage.logic";

describe("Mortgage screen model", () => {
  it("builds stable summary row labels for rendering", () => {
    const result = calculateMortgage({
      principalTry: 2_400_000,
      annualInterestRatePct: 34,
      termMonths: 120,
    });
    const rows = buildMortgageSummaryRows(result);

    expect(rows.map((row) => row.label)).toEqual([
      "Aylık taksit",
      "Toplam ödeme",
      "Toplam faiz",
      "Aylık faiz oranı (%)",
    ]);
  });

  it("returns validation error for empty/invalid inputs", () => {
    const bad = computeMortgage({
      propertyPrice: "",
      downPaymentPct: "-1",
      annualRatePct: "250",
      termMonths: "0",
    });
    expect("error" in bad).toBe(true);
  });
});

describe("Mortgage calculator parity", () => {
  it("matches shared motor output for default form", () => {
    const form = getDefaultMortgageForm();
    const computed = computeMortgage(form);
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateMortgage({
      principalTry: 5_000_000 * (1 - 0.2),
      annualInterestRatePct: 36,
      termMonths: 120,
    });

    expect(computed.value.result.monthlyInstallmentTry).toBe(expected.monthlyInstallmentTry);
    expect(computed.value.result.totalInterestTry).toBe(expected.totalInterestTry);
  });

  it("matches shared motor on zero-interest scenario", () => {
    const computed = computeMortgage({
      propertyPrice: "1.200.000",
      downPaymentPct: "0",
      annualRatePct: "0",
      termMonths: "120",
    });
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateMortgage({
      principalTry: 1_200_000,
      annualInterestRatePct: 0,
      termMonths: 120,
    });
    expect(computed.value.result.monthlyInstallmentTry).toBe(expected.monthlyInstallmentTry);
  });
});
