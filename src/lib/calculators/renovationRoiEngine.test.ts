import { describe, expect, it } from "vitest";
import { calculateRenovationRoi } from "./renovationRoiEngine";

describe("renovationRoiEngine", () => {
  it("calculates ROI with required formula", () => {
    const result = calculateRenovationRoi({
      renovationCostTry: 1_000_000,
      valueIncreaseTry: 1_600_000,
    });
    expect(result.netProfitTry).toBe(600_000);
    expect(result.roiPct).toBe(60);
  });

  it("returns different ROI when value increase changes", () => {
    const low = calculateRenovationRoi({ renovationCostTry: 800_000, valueIncreaseTry: 900_000 });
    const high = calculateRenovationRoi({ renovationCostTry: 800_000, valueIncreaseTry: 1_300_000 });
    expect(low.roiPct).not.toBe(high.roiPct);
  });
});
