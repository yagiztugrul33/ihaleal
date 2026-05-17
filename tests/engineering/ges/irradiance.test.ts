import { describe, expect, it } from "vitest";
import { computeIrradiance } from "@/lib/engineering/ges/irradiance";
import { runGesAnalysis } from "@/lib/engineering/ges/gesEngine";

describe("GES irradiance & engine", () => {
  it("derives POA from GHI", () => {
    const r = computeIrradiance({ annualGhiKwhM2: 1800, tiltDeg: 25 });
    expect(r.value.annualPoaKwhM2).toBeGreaterThan(1800);
    expect(r.value.peakSunHours).toBeGreaterThan(1.5);
  });

  it("runs end-to-end GES analysis", () => {
    const r = runGesAnalysis({
      site: { landAreaM2: 50_000, annualGhiKwhM2: 1780 },
      pv: { dcCapacityKwp: 5000 },
      financial: {
        electricityPriceTryPerKwh: 2.5,
        annualOpexTry: 400_000,
        discountRatePct: 10,
        projectYears: 25,
        capexTryPerKwp: 11_000,
      },
    });
    expect(r.production.value.annualEnergyKwhYear1).toBeGreaterThan(0);
    expect(r.scorecard.overall).toBeGreaterThan(0);
    expect(r.aiReasoning.length).toBeGreaterThan(2);
  });
});