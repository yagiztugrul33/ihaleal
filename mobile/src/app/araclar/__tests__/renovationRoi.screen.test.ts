import { describe, expect, it } from "vitest";

import { calculateRenovationRoi } from "../../../../shared/calculators";
import {
  buildRenovationRoiRows,
  computeRenovationRoi,
  getDefaultRenovationRoiForm,
} from "../renovationRoi.logic";

describe("Renovation ROI screen model", () => {
  it("builds expected render rows", () => {
    const result = calculateRenovationRoi({ renovationCostTry: 450000, valueIncreaseTry: 780000 });
    const rows = buildRenovationRoiRows(result);
    expect(rows.map((row) => row.label)).toEqual(["ROI", "Net kar"]);
  });

  it("returns validation error on invalid cost", () => {
    const bad = computeRenovationRoi({ renovationCostTry: "0", valueIncreaseTry: "1000" });
    expect("error" in bad).toBe(true);
  });
});

describe("Renovation ROI parity", () => {
  it("matches shared engine for default input", () => {
    const computed = computeRenovationRoi(getDefaultRenovationRoiForm());
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateRenovationRoi({ renovationCostTry: 450000, valueIncreaseTry: 780000 });
    expect(computed.value.roiPct).toBe(expected.roiPct);
    expect(computed.value.netProfitTry).toBe(expected.netProfitTry);
  });

  it("matches shared engine for negative profit scenario", () => {
    const computed = computeRenovationRoi({ renovationCostTry: "300.000", valueIncreaseTry: "240.000" });
    expect("value" in computed).toBe(true);
    if (!("value" in computed)) return;

    const expected = calculateRenovationRoi({ renovationCostTry: 300000, valueIncreaseTry: 240000 });
    expect(computed.value.netProfitTry).toBe(expected.netProfitTry);
  });
});
