import { describe, expect, it } from "vitest";
import { calcMortgagePayment } from "./mortgageCalc";

describe("calcMortgagePayment", () => {
  it("computes annuity payment", () => {
    const r = calcMortgagePayment(1_000_000, 2.89, 120);
    expect(r.monthlyPayment).toBeGreaterThan(9000);
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.totalPayment).toBeCloseTo(r.monthlyPayment * 120, 0);
  });

  it("zero rate splits principal evenly", () => {
    const r = calcMortgagePayment(600_000, 0, 60);
    expect(r.monthlyPayment).toBe(10_000);
    expect(r.totalInterest).toBe(0);
  });
});
