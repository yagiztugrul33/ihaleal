/**
 * TaxSimulatorService.test.ts
 * İhaleAL — Vergi Simülatörü Unit Testleri (20+ test)
 * 5 yıl sınırı, endeksleme, dilimli GV, mismatch, edge case'ler
 */
import { describe, it, expect } from "vitest";
import {
  TaxSimulatorService,
  r2,
  parseYearMonth,
  getPreviousYearMonth,
  monthsBetween,
  isFiveYearExempt,
  getYiUfeValue,
  indexCost,
  calculateGV,
  calculateDeedDuty,
} from "./TaxSimulatorService";
import type { YiUfeRecord, TaxBracket, TaxConfig, TapuDutyConfig } from "./TaxSimulatorService";
import { mergeYiUfeRecords } from "./mergeYiUfeRecords";

// ============================================
// FIXTURES
// ============================================

const FIXTURE_YI_UFE: YiUfeRecord[] = [
  { yearMonth: "2021-01", indexValue: 100.0, source: "tuik_api", stale: false },
  { yearMonth: "2021-06", indexValue: 120.0, source: "tuik_api", stale: false },
  { yearMonth: "2022-06", indexValue: 150.0, source: "tuik_api", stale: false },
  { yearMonth: "2023-06", indexValue: 200.0, source: "tuik_api", stale: false },
  { yearMonth: "2024-06", indexValue: 280.0, source: "tuik_api", stale: false },
  { yearMonth: "2025-06", indexValue: 350.0, source: "tuik_api", stale: false },
  { yearMonth: "2026-04", indexValue: 400.0, source: "tuik_api", stale: false },
  { yearMonth: "2026-05", indexValue: 410.0, source: "tuik_api", stale: false },
];

const FIXTURE_BRACKETS_2026: TaxBracket[] = [
  { year: 2026, limit: 158000, rate: 0.15 },
  { year: 2026, limit: 330000, rate: 0.20 },
  { year: 2026, limit: 800000, rate: 0.27 },
  { year: 2026, limit: 4300000, rate: 0.35 },
  { year: 2026, limit: Infinity, rate: 0.40 },
];

const FIXTURE_CONFIG: TaxConfig = {
  annualGvExemption: 87000,
  fiveYearRuleMode: "calendar_day",
  yiUfeStaleThresholdDays: 30,
};

const FIXTURE_TAPU: TapuDutyConfig = {
  totalRate: 0.04,
  buyerShare: 0.5,
  sellerShare: 0.5,
  version: "2026.01",
};

const FIXTURE_DEPS = (yiUfe: YiUfeRecord[] = FIXTURE_YI_UFE) => ({
  yiUfeRecords: yiUfe,
  taxBrackets: FIXTURE_BRACKETS_2026,
  config: FIXTURE_CONFIG,
  tapuDutyConfig: FIXTURE_TAPU,
  platformFeeRate: 0.04,
  platformVatRate: 0.20,
  otherFeesEstimate: 5000,
  currentDate: "2026-05",
});

const service = new TaxSimulatorService();

// ============================================
// TEST 1-5: ZOD VALIDASYON
// ============================================

describe("ZOD Input Validation", () => {
  it("1) gecerli input parse edilir", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2500000,
      isFirstResidence: false,
    };
    expect(() => service.estimate(input, FIXTURE_DEPS())).not.toThrow();
  });

  it("2) bozuk tarih formati hata verir", () => {
    const input = {
      purchaseDate: "2021/06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2500000,
      isFirstResidence: false,
    };
    expect(() => service.estimate(input, FIXTURE_DEPS())).toThrow();
  });

  it("3) negatif alis fiyati hata verir", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: -1000,
      expectedSalePriceTry: 2500000,
      isFirstResidence: false,
    };
    expect(() => service.estimate(input, FIXTURE_DEPS())).toThrow();
  });

  it("4) sifir satis fiyati hata verir", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 0,
      isFirstResidence: false,
    };
    expect(() => service.estimate(input, FIXTURE_DEPS())).toThrow();
  });

  it("5) eksik alan hata verir", () => {
    const input = { purchaseDate: "2021-06", isFirstResidence: false } as any;
    expect(() => service.estimate(input, FIXTURE_DEPS())).toThrow();
  });
});

// ============================================
// TEST 6-10: YI-UFE & ENDEKSLEME
// ============================================

describe("YI-UFE Indexing", () => {
  it("6) getPreviousYearMonth onceki ayi doner", () => {
    expect(getPreviousYearMonth("2026-05")).toBe("2026-04");
    expect(getPreviousYearMonth("2026-01")).toBe("2025-12");
    expect(getPreviousYearMonth("2021-03")).toBe("2021-02");
  });

  it("7) monthsBetween iki tarih arasi ay sayisi", () => {
    expect(monthsBetween("2021-06", "2026-05")).toBe(59);
    expect(monthsBetween("2021-06", "2026-06")).toBe(60);
    expect(monthsBetween("2020-01", "2020-01")).toBe(0);
  });

  it("8) indexCost dogru endeksli maliyet hesaplar", () => {
    const result = indexCost(1000000, "2021-06", "2026-05", FIXTURE_YI_UFE);
    expect(result.indexedCost).toBeCloseTo(3333333.33, 2);
    expect(result.rateUsed).toBeCloseTo(3.33, 2);
  });

  it("9) eksik YI-UFE kaydi → error + ham maliyet", () => {
    const result = indexCost(1000000, "1999-01", "2026-05", FIXTURE_YI_UFE);
    expect(result.error).toMatch(/Yİ-ÜFE|YI-UFE/);
    expect(result.error).toContain("eksik");
    expect(result.indexedCost).toBe(1000000);
    expect(result.rateUsed).toBe(1);
  });

  it("10) stale YI-UFE kaydi → null doner", () => {
    const staleRec: YiUfeRecord = { yearMonth: "2021-06", indexValue: 120, source: "cached", stale: true };
    expect(getYiUfeValue([staleRec], "2021-06")).toBeNull();
  });
});

// ============================================
// TEST 11-15: 5 YIL & GV HESAPLAMA
// ============================================

describe("5-Year Exemption & Capital Gains Tax", () => {
  it("11) 5 yildan az → istisna uygulanmaz", () => {
    const exempt = isFiveYearExempt("2021-06", "2026-05", "calendar_day");
    expect(exempt).toBe(false);
  });

  it("12) 5 yildan fazla → istisna uygulanir", () => {
    const exempt = isFiveYearExempt("2021-01", "2026-06", "calendar_day");
    expect(exempt).toBe(true);
  });

  it("13) month_boundary modu 60 ay kontrolu", () => {
    expect(isFiveYearExempt("2021-06", "2026-05", "month_boundary")).toBe(false);
    expect(isFiveYearExempt("2021-06", "2026-06", "month_boundary")).toBe(true);
  });

  it("14) dilimli GV dogru hesaplanir (tek bracket)", () => {
    const result = calculateGV(100000, [{ year: 2026, limit: 200000, rate: 0.15 }]);
    expect(result.taxAmount).toBe(15000);
    expect(result.bracketsApplied).toHaveLength(1);
  });

  it("15) dilimli GV cok bracket dogru", () => {
    const result = calculateGV(200000, [
      { year: 2026, limit: 100000, rate: 0.15 },
      { year: 2026, limit: Infinity, rate: 0.20 },
    ]);
    expect(result.taxAmount).toBe(35000);
    expect(result.bracketsApplied).toHaveLength(2);
  });
});

// ============================================
// TEST 16-20: TAM SERVIS AKISI
// ============================================

describe("Full TaxSimulatorService Flow", () => {
  it("16) <5 yil satis → GV hesaplanir, istisna yok", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 5_000_000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    expect(result.capitalGainsTax.isFiveYearExempt).toBe(false);
    expect(result.capitalGainsTax.taxableGain).toBeGreaterThan(0);
    expect(result.capitalGainsTax.taxAmount).toBeGreaterThan(0);
  });

  it("17) >5 yil satis → GV sifir, istisna uygulanir", () => {
    const input = {
      purchaseDate: "2020-01",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2500000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    expect(result.capitalGainsTax.isFiveYearExempt).toBe(true);
    expect(result.capitalGainsTax.taxAmount).toBe(0);
    expect(result.warnings.some((w: string) => /5\s*y[ıi]ldan/i.test(w))).toBe(true);
  });

  it("18) tapu harcisi satici+alici toplami dogru", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2000000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    expect(result.deedDuty.total).toBe(80000);
    expect(result.deedDuty.sellerShare).toBe(40000);
    expect(result.deedDuty.buyerShare).toBe(40000);
  });

  it("19) dusuk gosterim uyarisi (<50% endeksli maliyet)", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000,
      expectedSalePriceTry: 5000000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    expect(result.warnings.some((w: string) => /düşük gösterim/i.test(w))).toBe(true);
  });

  it("20) net satici hesabi tum kalemleri icerir", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 3000000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    const net = result.netToSeller.estimatedNet;
    const expected =
      3000000 -
      result.deedDuty.sellerShare -
      result.platformFee.total -
      result.capitalGainsTax.taxAmount -
      5000;
    expect(net).toBe(r2(expected));
  });

  it("21) 150m2 ilk konut uyarisi", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2500000,
      isFirstResidence: true,
      areaM2: 140,
      propertyType: "konut" as const,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    expect(result.warnings.some((w: string) => w.includes("150"))).toBe(true);
  });

  it("22) disclaimer her zaman mevcut", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2000000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    expect(result.disclaimer).toMatch(/bilgilendirme/i);
    expect(result.disclaimer).toMatch(/Resmi vergi hesab[ıi] de[ğg]ildir/i);
  });

  it("23) YI-UFE stale verisi → uyari + ham maliyet", () => {
    const staleYiUfe: YiUfeRecord[] = [
      { yearMonth: "2021-06", indexValue: 120, source: "cached", stale: true },
    ];
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2000000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, { ...FIXTURE_DEPS(staleYiUfe), yiUfeRecords: staleYiUfe });
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.capitalGainsTax.yiUfeIndexedCost).toBe(1000000);
  });

  it("24) platform fee commission engine'den gelir", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2000000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    expect(result.platformFee.baseAmount).toBe(80000);
    expect(result.platformFee.vatRate).toBe(0.20);
    expect(result.platformFee.vatAmount).toBe(16000);
    expect(result.platformFee.total).toBe(96000);
    expect(result.platformFee.revenueTemplateId).toBe("IHALEAL-SAAS-001");
  });

  it("25) yillik istisna dusulur", () => {
    const input = {
      purchaseDate: "2021-06",
      declaredPurchasePriceTry: 1000000,
      expectedSalePriceTry: 2000000,
      isFirstResidence: false,
    };
    const result = service.estimate(input, FIXTURE_DEPS());
    const rawGain = result.capitalGainsTax.taxableGain;
    const taxBase = result.capitalGainsTax.taxBaseAfterExemption;
    expect(taxBase).toBe(Math.max(0, rawGain - FIXTURE_CONFIG.annualGvExemption));
  });
});

// ============================================
// TEST 26-28: TAPU HARCI & EDGE CASE
// ============================================

describe("Deed Duty & Edge Cases", () => {
  it("26) tapu harci orani versiyonlu", () => {
    const duty = calculateDeedDuty(1000000, FIXTURE_TAPU);
    expect(duty.total).toBe(40000);
    expect(duty.buyerShare + duty.sellerShare).toBe(duty.total);
  });

  it("27) r2 yuvarlama fonksiyonu", () => {
    expect(r2(100.555)).toBe(100.56);
    expect(r2(100.554)).toBe(100.55);
    expect(r2(0)).toBe(0);
  });

  it("28) parseYearMonth format", () => {
    expect(parseYearMonth("2026-05")).toEqual({ year: 2026, month: 5 });
    expect(parseYearMonth("1999-12")).toEqual({ year: 1999, month: 12 });
  });
});

describe("mergeYiUfeRecords", () => {
  it("prefers official TCMB row for same year-month", () => {
    const demo: YiUfeRecord[] = [
      { yearMonth: "2021-06", indexValue: 120, source: "manual_entry", stale: false },
      { yearMonth: "2022-06", indexValue: 150, source: "manual_entry", stale: false },
    ];
    const official: YiUfeRecord[] = [
      { yearMonth: "2021-06", indexValue: 999, source: "tcmb_evds", stale: false },
    ];
    const merged = mergeYiUfeRecords(demo, official);
    expect(merged.find((r) => r.yearMonth === "2021-06")?.indexValue).toBe(999);
    expect(merged.find((r) => r.yearMonth === "2021-06")?.source).toBe("tcmb_evds");
    expect(merged.find((r) => r.yearMonth === "2022-06")?.indexValue).toBe(150);
  });

  it("sorts ascending by year-month", () => {
    const demo: YiUfeRecord[] = [{ yearMonth: "2020-01", indexValue: 1, source: "manual_entry", stale: false }];
    const official: YiUfeRecord[] = [{ yearMonth: "2019-06", indexValue: 2, source: "tcmb_evds", stale: false }];
    expect(mergeYiUfeRecords(demo, official).map((r) => r.yearMonth)).toEqual(["2019-06", "2020-01"]);
  });
});
