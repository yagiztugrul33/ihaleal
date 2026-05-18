import { describe, expect, it } from "vitest";
import {
  calculateGesFeasibilityScore,
  estimateAnnualMwh,
  estimateCapacityMw,
  estimateCapexTry,
  estimatePaybackYears,
  evaluateHardKill,
  runGesLandEvaluation,
  GesLandValidationError,
} from "@/lib/ges-land/feasibilityEngine";
import type { GesLandEvaluationInput } from "@/lib/ges-land/types";

const base: GesLandEvaluationInput = {
  city: "Konya",
  district: "Karapinar",
  totalAreaM2: 150_000,
  distanceToTrafoKm: 3,
  solarIrradianceKwh: 1780,
  slopeDegree: 5,
  slopeAspect: "SOUTH",
  agriculturalClass: "MARGINAL",
  isMarginalTarimApproved: true,
  hasCadastralRoad: true,
  hasSitAreaConflict: false,
  hasMilitaryZoneConflict: false,
};

describe("evaluateHardKill", () => {
  it("rejects SIT conflict", () => {
    const r = evaluateHardKill({ ...base, hasSitAreaConflict: true });
    expect(r.kill).toBe("SIT_OR_MILITARY");
  });

  it("rejects mutlak tarim", () => {
    const r = evaluateHardKill({ ...base, agriculturalClass: "MUTLAK" });
    expect(r.kill).toBe("ABSOLUTE_AGRICULTURE");
  });

  it("rejects missing cadastral road", () => {
    const r = evaluateHardKill({ ...base, hasCadastralRoad: false });
    expect(r.kill).toBe("NO_CADASTRAL_ROAD");
  });

  it("passes clean marginal parcel", () => {
    const r = evaluateHardKill(base);
    expect(r.kill).toBeNull();
  });
});

describe("financial estimates", () => {
  it("capacity uses 15000 m2 per MW", () => {
    expect(estimateCapacityMw(30_000)).toBe(2);
  });

  it("capex increases with trafo distance", () => {
    const near = estimateCapexTry(1, 2);
    const far = estimateCapexTry(1, 12);
    expect(far).toBeGreaterThan(near);
  });

  it("payback returns null for zero revenue", () => {
    expect(estimatePaybackYears(1_000_000, 0)).toBeNull();
  });
});

describe("calculateGesFeasibilityScore", () => {
  it("applies north-facing slope penalty", () => {
    const cap = estimateCapacityMw(base.totalAreaM2);
    const score = calculateGesFeasibilityScore(
      {
        ...base,
        slopeAspect: "NORTH",
        slopeDegree: 22,
        solarIrradianceKwh: 1400,
        agriculturalClass: "UNKNOWN",
        isMarginalTarimApproved: false,
      },
      cap,
    );
    expect(score).toBeLessThan(88);
  });
});

describe("runGesLandEvaluation", () => {
  it("returns high viability for strong site", () => {
    const r = runGesLandEvaluation(base);
    expect(r.status).toBe("HIGH_VIABILITY");
    expect(r.gesFeasibilityScore).toBeGreaterThanOrEqual(75);
  });

  it("caps score on hard kill", () => {
    const r = runGesLandEvaluation({ ...base, hasCadastralRoad: false });
    expect(r.status).toBe("TECHNICAL_REJECTION");
    expect(r.gesFeasibilityScore).toBeLessThanOrEqual(25);
  });

  it("requires city and district", () => {
    expect(() => runGesLandEvaluation({ ...base, city: "  " })).toThrow(GesLandValidationError);
  });
});
