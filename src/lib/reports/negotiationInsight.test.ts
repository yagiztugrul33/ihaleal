import { describe, expect, it } from "vitest";
import type { EconomicRealAnalysis, RankedEmsalRow } from "@/lib/reports/realEconomicAnalysis";
import { computeNegotiationInsight } from "@/lib/reports/negotiationInsight";

function fakeRow(overrides: Partial<RankedEmsalRow> = {}): RankedEmsalRow {
  return {
    id: "row-1",
    title: "Emsal",
    district: "Kadıköy",
    city: "İstanbul",
    category: "Konut",
    pricePerM2: 50_000,
    grossM2: 100,
    totalPrice: 5_000_000,
    daysOnMarket: 0,
    daysOnMarketKnown: false,
    status: "ended",
    similarity: 80,
    isTarget: false,
    ...overrides,
  };
}

function fakeAnalysis(overrides: Partial<Extract<EconomicRealAnalysis, { isReal: true }>> = {}): EconomicRealAnalysis {
  return {
    isReal: true,
    comparableCount: 4,
    minComparableRequired: 4,
    medianPricePerM2: 50_000,
    minPricePerM2: 45_000,
    maxPricePerM2: 55_000,
    closingPremiumPct: null,
    closingSampleSize: 0,
    historyFromDb: false,
    ownHistoryChangePct: null,
    comparables: [],
    targetPricePerM2: 50_000,
    targetTotalPrice: 5_000_000,
    rank: { position: 1, total: 4, percentile: 50 },
    rankedComparables: [fakeRow({ isTarget: true, id: "target-1" })],
    regionSaleCount: 0,
    regionRentCount: 0,
    ...overrides,
  };
}

describe("computeNegotiationInsight", () => {
  it("marketingMode 'listing_only' değilse uygulanamaz (ihalede pazarlık kavramı yok)", () => {
    const result = computeNegotiationInsight(fakeAnalysis(), "auction");
    expect(result.applicable).toBe(false);
  });

  it("marketingMode belirtilmemişse uygulanamaz", () => {
    const result = computeNegotiationInsight(fakeAnalysis(), undefined);
    expect(result.applicable).toBe(false);
  });

  it("analiz gerçek değilse (yetersiz emsal) uygulanamaz", () => {
    const notReal: EconomicRealAnalysis = {
      isReal: false,
      comparableCount: 1,
      minComparableRequired: 4,
      reason: "insufficient_comparables",
    };
    const result = computeNegotiationInsight(notReal, "listing_only");
    expect(result.applicable).toBe(false);
  });

  it("ilan zaten medyanın altındaysa (veya eşitse) indirim önerisi üretmez", () => {
    const analysis = fakeAnalysis({ targetPricePerM2: 48_000, medianPricePerM2: 50_000 });
    const result = computeNegotiationInsight(analysis, "listing_only");
    expect(result.applicable).toBe(true);
    if (result.applicable) {
      expect(result.overMedianPct).toBeLessThanOrEqual(0);
      expect(result.suggestedLowPct).toBeNull();
      expect(result.suggestedHighPct).toBeNull();
    }
  });

  it("bir alt sırada gerçek daha ucuz bir emsal varsa alt sınır o emsalin gerçek farkıdır", () => {
    const nearestCheaper = fakeRow({ id: "cheap-1", pricePerM2: 52_000, isTarget: false });
    const target = fakeRow({ id: "target-1", pricePerM2: 55_000, isTarget: true });
    const analysis = fakeAnalysis({
      targetPricePerM2: 55_000,
      medianPricePerM2: 50_000,
      rankedComparables: [nearestCheaper, target],
    });
    const result = computeNegotiationInsight(analysis, "listing_only");
    expect(result.applicable).toBe(true);
    if (result.applicable) {
      // overMedianPct = (55000-50000)/50000*100 = 10
      expect(result.overMedianPct).toBeCloseTo(10, 5);
      // nearestCheaperPct = (55000-52000)/55000*100 ≈ 5.45
      expect(result.nearestCheaperPct).toBeCloseTo(5.5, 0);
      expect(result.suggestedLowPct).toBe(result.nearestCheaperPct);
      expect(result.suggestedHighPct).toBeCloseTo(10, 5);
      // Alt sınır her zaman üst sınırdan küçük veya eşit olmalı
      expect(result.suggestedLowPct!).toBeLessThanOrEqual(result.suggestedHighPct!);
    }
  });

  it("hedef zaten en ucuzsa (gerçek bir komşu emsal yok) sezgisel yarı-fark alt sınır kullanılır", () => {
    const target = fakeRow({ id: "target-1", pricePerM2: 60_000, isTarget: true });
    const expensiveComparable = fakeRow({ id: "exp-1", pricePerM2: 65_000, isTarget: false });
    const analysis = fakeAnalysis({
      targetPricePerM2: 60_000,
      medianPricePerM2: 50_000,
      rankedComparables: [target, expensiveComparable],
    });
    const result = computeNegotiationInsight(analysis, "listing_only");
    expect(result.applicable).toBe(true);
    if (result.applicable) {
      expect(result.nearestCheaperPct).toBeNull();
      // overMedianPct = 20, sezgisel alt sınır = 10 (yarısı)
      expect(result.overMedianPct).toBeCloseTo(20, 5);
      expect(result.suggestedLowPct).toBeCloseTo(10, 5);
      expect(result.suggestedHighPct).toBeCloseTo(20, 5);
    }
  });

  it("ortalama yayın süresi sadece gerçek (daysOnMarketKnown) emsallerden ve hedef hariç hesaplanır", () => {
    const target = fakeRow({ id: "target-1", isTarget: true, daysOnMarketKnown: true, daysOnMarket: 999 });
    const known1 = fakeRow({ id: "k1", daysOnMarketKnown: true, daysOnMarket: 10 });
    const known2 = fakeRow({ id: "k2", daysOnMarketKnown: true, daysOnMarket: 30 });
    const unknown = fakeRow({ id: "u1", daysOnMarketKnown: false, daysOnMarket: 0 });
    const analysis = fakeAnalysis({
      targetPricePerM2: 60_000,
      medianPricePerM2: 50_000,
      rankedComparables: [known1, known2, unknown, target],
    });
    const result = computeNegotiationInsight(analysis, "listing_only");
    expect(result.applicable).toBe(true);
    if (result.applicable) {
      expect(result.knownDaysSampleSize).toBe(2);
      expect(result.avgDaysOnMarket).toBe(20);
    }
  });

  it("hiçbir emsalin yayın tarihi bilinmiyorsa avgDaysOnMarket null döner", () => {
    const target = fakeRow({ id: "target-1", isTarget: true });
    const unknown = fakeRow({ id: "u1", daysOnMarketKnown: false });
    const analysis = fakeAnalysis({
      targetPricePerM2: 60_000,
      medianPricePerM2: 50_000,
      rankedComparables: [unknown, target],
    });
    const result = computeNegotiationInsight(analysis, "listing_only");
    expect(result.applicable).toBe(true);
    if (result.applicable) {
      expect(result.avgDaysOnMarket).toBeNull();
      expect(result.knownDaysSampleSize).toBe(0);
    }
  });

  it("target ₺/m² veya medyan sıfırsa/negatifse uygulanamaz", () => {
    const analysis = fakeAnalysis({ targetPricePerM2: 0 });
    const result = computeNegotiationInsight(analysis, "listing_only");
    expect(result.applicable).toBe(false);
  });
});
