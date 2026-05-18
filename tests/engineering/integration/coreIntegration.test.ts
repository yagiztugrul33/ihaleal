import { describe, expect, it } from "vitest";
import { calculateGesEngineFeasibility } from "@/lib/engineering/ges/gesEngineFeasibility";
import { calculateParcelFeasibility } from "@/lib/engineering/parcel/parcelEngineFeasibility";

describe("entegrasyon cekirdek testleri", () => {
  it("GES on fizibilite motoru", () => {
    const gesResult = calculateGesEngineFeasibility({
      totalAreaM2: 30_000,
      distanceToTrafoKm: 1.5,
      trafoCapacityMw: 10,
      slopeDegree: 1,
      slopeAspect: "SOUTH",
      isMarginalTarimApproved: true,
      hasSitAreaConflict: false,
      hasMilitaryZoneConflict: false,
      hasCadastralRoad: true,
    });

    expect(Number.isFinite(gesResult.dcCapacityKwp)).toBe(true);
    expect(gesResult.monthlyProductionKwh).toHaveLength(12);
    expect(gesResult.suitabilityScore).toBeGreaterThan(0);
  });

  it("parsel imar on fizibilite motoru", () => {
    const parcelResult = calculateParcelFeasibility({
      landAreaM2: 5000,
      emsal: 2.0,
      taks: 0.4,
      estimatedSalesPricePerM2: 45_000,
      estimatedCostPricePerM2: 18_000,
    });

    expect(parcelResult.maxConstructionArea).toBe(10_000);
    expect(Number.isFinite(parcelResult.contractorProfit)).toBe(true);
  });
});