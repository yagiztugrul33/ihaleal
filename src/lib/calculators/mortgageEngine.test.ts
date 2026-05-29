import { describe, expect, it } from "vitest";
import { calculateMortgage } from "./mortgageEngine";

describe("mortgageEngine", () => {
  it("calculates installment with annuity formula", () => {
    const result = calculateMortgage({
      principalTry: 1_000_000,
      annualInterestRatePct: 24,
      termMonths: 120,
    });
    expect(result.monthlyInstallmentTry).toBeGreaterThan(20_000);
    expect(result.totalInterestTry).toBeGreaterThan(0);
    expect(result.schedule).toHaveLength(120);
    expect(result.schedule.at(-1)?.remainingPrincipalTry).toBe(0);
  });

  it("returns different outputs for different inputs", () => {
    const a = calculateMortgage({ principalTry: 2_000_000, annualInterestRatePct: 20, termMonths: 120 });
    const b = calculateMortgage({ principalTry: 2_000_000, annualInterestRatePct: 30, termMonths: 120 });
    expect(a.monthlyInstallmentTry).not.toBe(b.monthlyInstallmentTry);
  });
});
