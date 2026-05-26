import { describe, expect, it } from "vitest";
import {
  calculateEarthquakeRisk,
  calculateHazardLayer,
  calculateLiquefactionLayer,
  type EarthquakeRiskInput,
} from "./earthquakeRiskEngine";

const BASE: EarthquakeRiskInput = {
  city: "Istanbul",
  district: "Kadikoy",
  neighborhood: "Feneryolu",
  faultDistanceKm: 12,
  pgaG: 0.34,
  soilClass: "ZC",
  fsCoefficient: 1.25,
  f1Coefficient: 1.35,
  sptN160: 34,
  groundwaterDepthM: 3.8,
  alluviumPercent: 42,
  buildingAge: 12,
  structuralSystem: "reinforced_concrete",
  codeEra: "post_2018",
  storyCount: 8,
  softStory: false,
};

describe("earthquakeRiskEngine", () => {
  it("fay mesafesi ve pga kotulesince hazard skoru duser", () => {
    const lowHazard = calculateHazardLayer({ ...BASE, faultDistanceKm: 22, pgaG: 0.22 });
    const highHazard = calculateHazardLayer({ ...BASE, faultDistanceKm: 4, pgaG: 0.52 });
    expect(lowHazard.score).toBeGreaterThan(highHazard.score);
  });

  it("spt dusuk ve su seviyesi yakin ise sivilasma skoru duser", () => {
    const stable = calculateLiquefactionLayer({ ...BASE, sptN160: 48, groundwaterDepthM: 6.2, alluviumPercent: 20 });
    const unstable = calculateLiquefactionLayer({ ...BASE, sptN160: 12, groundwaterDepthM: 1.4, alluviumPercent: 78 });
    expect(stable.score).toBeGreaterThan(unstable.score);
  });

  it("birlesik skor katman katkilariyla birlikte doner", () => {
    const result = calculateEarthquakeRisk(BASE);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.contributions).toHaveLength(4);
  });
});
