import { describe, expect, it } from "vitest";

import { calculateAirbnbPotential } from "../../../../shared/calculators";
import {
  buildCommissionSummaryRows,
  computeCommission,
  getDefaultCommissionForm,
} from "../commission.logic";

describe("Commission screen model", () => {
  it("builds expected summary row labels for rendering", () => {
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

    const rows = buildCommissionSummaryRows(result);
    expect(rows.map((row) => row.label)).toEqual([
      "Yıllık brüt gelir",
      "Platform komisyonu",
      "Yıllık net gelir",
      "Uzun dönem kiraya göre fark",
    ]);
  });

  it("returns validation error when occupancy exceeds range", () => {
    const bad = computeCommission({
      ...getDefaultCommissionForm(),
      occupancyRatePct: "150",
    });
    expect("error" in bad).toBe(true);
  });
});

describe("Commission calculator parity", () => {
  it("matches shared motor for default form", () => {
    const form = getDefaultCommissionForm();
    const computed = computeCommission(form);
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

    expect(computed.value.annualCommissionTry).toBe(expected.annualCommissionTry);
    expect(computed.value.annualNetRevenueTry).toBe(expected.annualNetRevenueTry);
  });

  it("matches shared motor for low occupancy scenario", () => {
    const computed = computeCommission({
      ...getDefaultCommissionForm(),
      occupancyRatePct: "20",
      platformCommissionRatePct: "10",
      annualOperatingCostTry: "50.000",
    });
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateAirbnbPotential({
      nightlyRateTry: 3500,
      occupancyRatePct: 20,
      cleaningCostPerStayTry: 750,
      expectedStaysPerYear: 85,
      platformCommissionRatePct: 10,
      annualOperatingCostTry: 50000,
      vacancyReserveRatePct: 7,
      longTermMonthlyRentTry: 48000,
    });

    expect(computed.value.annualCommissionTry).toBe(expected.annualCommissionTry);
  });
});
