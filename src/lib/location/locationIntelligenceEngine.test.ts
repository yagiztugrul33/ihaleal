import { describe, expect, it } from "vitest";
import {
  buildLocationInputFromProfile,
  calculateCompositeLocationScore,
  calculateEducationLayer,
  calculatePoiAccessibilityLayer,
  calculateSafetyLayer,
  calculateSesLayer,
} from "./locationIntelligenceEngine";

describe("locationIntelligenceEngine", () => {
  it("SES katmani sege ve egitim artinca yukselir", () => {
    const weak = buildLocationInputFromProfile("antalya-muratpasa", {
      segeScore: 60,
      higherEducationRate: 45,
      medianIncomeIndex: 55,
    });
    const strong = buildLocationInputFromProfile("istanbul-besiktas", {
      segeScore: 93,
      higherEducationRate: 80,
      medianIncomeIndex: 90,
    });
    expect(calculateSesLayer(strong).score).toBeGreaterThan(calculateSesLayer(weak).score);
  });

  it("POI katmaninda metroya yakinlik skoru belirgin etkiler", () => {
    const closeMetro = buildLocationInputFromProfile("ankara-cankaya", {
      metroDistanceM: 250,
      transitLineCount: 8,
    });
    const farMetro = buildLocationInputFromProfile("ankara-cankaya", {
      metroDistanceM: 2400,
      transitLineCount: 3,
    });
    expect(calculatePoiAccessibilityLayer(closeMetro).score).toBeGreaterThan(calculatePoiAccessibilityLayer(farMetro).score);
  });

  it("egitim katmaninda okul kalite ve yogunluk skoru artirir", () => {
    const weak = buildLocationInputFromProfile("izmir-karsiyaka", {
      schoolCountNearby: 6,
      schoolQualityIndex: 54,
      higherEducationRate: 52,
    });
    const strong = buildLocationInputFromProfile("istanbul-kadikoy", {
      schoolCountNearby: 18,
      schoolQualityIndex: 86,
      higherEducationRate: 79,
    });
    expect(calculateEducationLayer(strong).score).toBeGreaterThan(calculateEducationLayer(weak).score);
  });

  it("guvenlik katmaninda risk ve mudahale suresi kotulesince skor dusur", () => {
    const safe = buildLocationInputFromProfile("istanbul-besiktas", {
      responseTimeMinutes: 7,
      incidentRiskProxy: 25,
      cameraCoverageIndex: 81,
    });
    const risky = buildLocationInputFromProfile("antalya-muratpasa", {
      responseTimeMinutes: 16,
      incidentRiskProxy: 61,
      cameraCoverageIndex: 43,
    });
    expect(calculateSafetyLayer(safe).score).toBeGreaterThan(calculateSafetyLayer(risky).score);
  });

  it("birlesik skor katman agirliklariyla 0-100 arasi uretilir", () => {
    const input = buildLocationInputFromProfile("istanbul-kadikoy");
    const result = calculateCompositeLocationScore(input);
    expect(result.locationScore).toBeGreaterThanOrEqual(0);
    expect(result.locationScore).toBeLessThanOrEqual(100);
    expect(result.contributions).toHaveLength(4);
    expect(result.weightModel.method).toBe("fahp-weighted");
  });

  it("farkli girdiler farkli birlesik skor uretir (sabit degil)", () => {
    const baseline = calculateCompositeLocationScore(buildLocationInputFromProfile("ankara-cankaya"));
    const improved = calculateCompositeLocationScore(
      buildLocationInputFromProfile("ankara-cankaya", {
        metroDistanceM: 260,
        transitLineCount: 9,
        schoolQualityIndex: 82,
        incidentRiskProxy: 26,
      }),
    );
    expect(improved.locationScore).not.toBe(baseline.locationScore);
    expect(improved.locationScore).toBeGreaterThan(baseline.locationScore);
  });
});
