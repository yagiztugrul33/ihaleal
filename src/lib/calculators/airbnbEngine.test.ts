import { describe, expect, it } from "vitest";
import { calculateAirbnbPotential } from "./airbnbEngine";

describe("airbnbEngine", () => {
  it("calculates annual gross/net and long-term comparison", () => {
    const result = calculateAirbnbPotential({
      nightlyRateTry: 3200,
      occupancyRatePct: 70,
      cleaningCostPerStayTry: 1200,
      expectedStaysPerYear: 80,
      platformCommissionRatePct: 18,
      annualOperatingCostTry: 180_000,
      vacancyReserveRatePct: 8,
      longTermMonthlyRentTry: 40_000,
    });
    expect(result.annualGrossRevenueTry).toBeGreaterThan(0);
    expect(result.annualNetRevenueTry).toBeLessThan(result.annualGrossRevenueTry);
    expect(result.longTermAnnualRentTry).toBe(480_000);
  });

  it("changes net result for different occupancy", () => {
    const low = calculateAirbnbPotential({
      nightlyRateTry: 3000,
      occupancyRatePct: 50,
      cleaningCostPerStayTry: 1000,
      expectedStaysPerYear: 60,
      platformCommissionRatePct: 18,
      annualOperatingCostTry: 150_000,
      vacancyReserveRatePct: 8,
      longTermMonthlyRentTry: 35_000,
    });
    const high = calculateAirbnbPotential({
      nightlyRateTry: 3000,
      occupancyRatePct: 80,
      cleaningCostPerStayTry: 1000,
      expectedStaysPerYear: 60,
      platformCommissionRatePct: 18,
      annualOperatingCostTry: 150_000,
      vacancyReserveRatePct: 8,
      longTermMonthlyRentTry: 35_000,
    });
    expect(low.annualNetRevenueTry).not.toBe(high.annualNetRevenueTry);
  });
});
