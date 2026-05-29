import { describe, expect, it } from "vitest";
import {
  calculateGesIntelligence,
  calculateRegulatoryLayer,
  calculateSolarLayer,
  type GesIntelligenceInput,
} from "./gesIntelligenceEngine";

const BASE: GesIntelligenceInput = {
  landAreaM2: 100_000,
  dcCapacityKwp: 1_000,
  annualGhiKwhM2: 1680,
  slopePercent: 4,
  transformerDistanceKm: 2.4,
  zoningPermitted: true,
  electricityPriceTryPerKwh: 2.9,
  capexTryPerKwp: 14_000,
  annualOpexTry: 1_300_000,
  discountRatePct: 10,
};

describe("gesIntelligenceEngine", () => {
  it("solar katmani ghi artinca yukselir", () => {
    const weak = calculateSolarLayer({ ...BASE, annualGhiKwhM2: 1300 }, 1_350_000);
    const strong = calculateSolarLayer({ ...BASE, annualGhiKwhM2: 1860 }, 1_780_000);
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it("mevzuat katmani 5MW altinda daha iyi skor verir", () => {
    const licensed = calculateRegulatoryLayer({ ...BASE, dcCapacityKwp: 6200 });
    const unlicensedBand = calculateRegulatoryLayer({ ...BASE, dcCapacityKwp: 4200 });
    expect(unlicensedBand.score).toBeGreaterThan(licensed.score);
  });

  it("birlesik ges skoru ve finansal ciktilar doner", () => {
    const result = calculateGesIntelligence(BASE);
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.feasibility.lcoeTryPerKwh).toBeGreaterThan(0);
    expect(result.contributions).toHaveLength(4);
  });
});
