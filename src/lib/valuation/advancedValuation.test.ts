import { describe, expect, it } from "vitest";
import {
  buildComparableUniverse,
  buildConfidenceInterval,
  calculateComparableLayer,
  calculateHedonicLayer,
  runAdvancedValuation,
  type ValuationInput,
} from "./advancedValuation";

const BASE_INPUT: ValuationInput = {
  city: "istanbul",
  district: "Kadikoy",
  grossM2: 120,
  roomCount: 3,
  floor: 4,
  totalFloors: 10,
  buildingAge: 8,
  transactionType: "sale",
  condition: "good",
  heatingType: "combi",
  locationTier: "balanced",
  hasElevator: true,
  hasParking: false,
};

describe("advancedValuation", () => {
  it("hedonik katmanda prime konum balanced konumdan yuksek fiyat uretir", () => {
    const balanced = calculateHedonicLayer(BASE_INPUT, 150_000);
    const prime = calculateHedonicLayer({ ...BASE_INPUT, locationTier: "prime" }, 150_000);
    expect(prime.unitPrice).toBeGreaterThan(balanced.unitPrice);
  });

  it("emsal katmani benzerlerden agirlikli m2 duzeltmesiyle birim fiyat hesaplar", () => {
    const comparables = buildComparableUniverse(BASE_INPUT);
    const layer = calculateComparableLayer(BASE_INPUT, comparables);
    expect(layer.unitPrice).toBeGreaterThan(0);
    expect(layer.matched.length).toBeGreaterThanOrEqual(6);
  });

  it("guven araligi merkez degeri kapsar ve band pct dondurur", () => {
    const interval = buildConfidenceInterval(12_000_000, 0.06, 10);
    expect(interval.minValue).toBeLessThan(12_000_000);
    expect(interval.maxValue).toBeGreaterThan(12_000_000);
    expect(interval.confidenceBandPct).toBeGreaterThanOrEqual(6);
  });

  it("ana motor hedonik+emsal+spatial katmanlari ve katkilari dondurur", () => {
    const result = runAdvancedValuation(BASE_INPUT);
    expect(result.layerSummary.hedonicUnitPrice).toBeGreaterThan(0);
    expect(result.layerSummary.comparableUnitPrice).toBeGreaterThan(0);
    expect(result.contributions.length).toBeGreaterThan(4);
    expect(result.approaches.salesComparisonTry).toBeGreaterThan(0);
  });
});
