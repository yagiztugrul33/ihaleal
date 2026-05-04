import { describe, expect, it } from "vitest";
import { computeKkaOwnerHakEdisProjection, computeKkaShareByRatio } from "./kkaHakEdisEngine";

describe("kkaHakEdisEngine", () => {
  it("projects nominal and pessimistic adjustment", () => {
    const r = computeKkaOwnerHakEdisProjection({
      ownerIndependentUnits: 4,
      expectedUnitSaleTry: 5_000_000,
      scenario: "realistic",
    });
    expect(r.nominalGrossTry).toBe(20_000_000);
    expect(r.scenarioAdjustedTry).toBe(20_000_000);

    const p = computeKkaOwnerHakEdisProjection({
      ownerIndependentUnits: 4,
      expectedUnitSaleTry: 5_000_000,
      scenario: "pessimistic",
    });
    expect(p.scenarioAdjustedTry).toBe(17_600_000);
  });

  it("share by ratio respects owner units equivalent", () => {
    const r = computeKkaShareByRatio({
      totalSellableUnits: 40,
      ownerShareRatio: 0.35,
      averageUnitSaleTry: 10_000_000,
      scenario: "realistic",
    });
    expect(r.ownerUnitsEquivalent).toBe(14);
    expect(r.nominalGrossTry).toBe(140_000_000);
  });
});