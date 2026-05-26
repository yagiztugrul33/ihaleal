import { describe, expect, it } from "vitest";

import { calculateAirbnbPotential } from "../../../../shared/calculators";
import {
  buildAirbnbPotentialRows,
  computeAirbnbPotential,
  getDefaultAirbnbPotentialForm,
} from "../airbnbPotential.logic";

describe("Airbnb Potential screen model", () => {
  it("builds expected render rows", () => {
    const result = calculateAirbnbPotential({
      nightlyRateTry: 3500,
      occupancyRatePct: 68,
      cleaningCostPerStayTry: 750,
      expectedStaysPerYear: 85,
      platformCommissionRatePct: 18,
      annualOperatingCostTry: 220000,
      vacancyReserveRatePct: 7,
      longTermMonthlyRentTry: 48000,
    });
    const rows = buildAirbnbPotentialRows(result);
    expect(rows.map((row) => row.label)).toEqual([
      "Yıllık brüt gelir",
      "Temizlik maliyeti",
      "Platform kesintisi",
      "Yıllık net gelir",
      "Uzun dönem kiraya fark",
    ]);
  });

  it("returns validation error for bad occupancy", () => {
    const bad = computeAirbnbPotential({
      ...getDefaultAirbnbPotentialForm(),
      occupancyRatePct: "130",
    });
    expect("error" in bad).toBe(true);
  });
});

describe("Airbnb Potential parity", () => {
  it("matches shared engine for default form", () => {
    const computed = computeAirbnbPotential(getDefaultAirbnbPotentialForm());
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateAirbnbPotential({
      nightlyRateTry: 3500,
      occupancyRatePct: 68,
      cleaningCostPerStayTry: 750,
      expectedStaysPerYear: 85,
      platformCommissionRatePct: 18,
      annualOperatingCostTry: 220000,
      vacancyReserveRatePct: 7,
      longTermMonthlyRentTry: 48000,
    });
    expect(computed.value.annualNetRevenueTry).toBe(expected.annualNetRevenueTry);
    expect(computed.value.annualCommissionTry).toBe(expected.annualCommissionTry);
  });

  it("matches shared engine on low-demand scenario", () => {
    const computed = computeAirbnbPotential({
      ...getDefaultAirbnbPotentialForm(),
      nightlyRateTry: "1800",
      occupancyRatePct: "45",
      annualOperatingCostTry: "120.000",
    });
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateAirbnbPotential({
      nightlyRateTry: 1800,
      occupancyRatePct: 45,
      cleaningCostPerStayTry: 750,
      expectedStaysPerYear: 85,
      platformCommissionRatePct: 18,
      annualOperatingCostTry: 120000,
      vacancyReserveRatePct: 7,
      longTermMonthlyRentTry: 48000,
    });
    expect(computed.value.annualGrossRevenueTry).toBe(expected.annualGrossRevenueTry);
  });
});
