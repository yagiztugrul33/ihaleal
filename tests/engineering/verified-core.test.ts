import { describe, expect, it } from "vitest";
import { normalizePvgisMonthly } from "@/lib/data/pvgisTypes";
import {
  GesValidationError,
  calculateGesFeasibility,
} from "@/lib/engineering/gesEngine";
import {
  ParcelValidationError,
  calculateParcelFeasibilityLegacy,
  type ParcelFeasibilityReport,
} from "@/lib/engineering/parcelFeasibility";
import { buildGesPrefeasibilityReport, buildParcelPrefeasibilityReport } from "@/lib/engineering/reportBuilder";

function assertNoBadNumbers(obj: unknown, path = "root"): void {
  if (obj == null) return;
  if (typeof obj === "number") {
    expect(Number.isFinite(obj), path).toBe(true);
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => assertNoBadNumbers(v, `${path}[${i}]`));
    return;
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      assertNoBadNumbers(v, `${path}.${k}`);
    }
  }
}

const baseGes = {
  landAreaM2: 100_000,
  annualGhiKwhM2: 1780,
  electricityPriceTryPerKwh: 2.8,
  capexTryPerKwp: 12_000,
  annualOpexTry: 600_000,
  discountRatePct: 10,
  dcCapacityKwp: 5000,
};

describe("verified GES core", () => {
  it("returns finite outputs for valid input", () => {
    const r = calculateGesFeasibility(baseGes);
    assertNoBadNumbers(r);
    expect(r.studyLabel).toBe("ön fizibilite");
    expect(r.bankable).toBe(false);
    expect(r.monthlyProductionKwh).toHaveLength(12);
  });

  it("throws GesValidationError on invalid land", () => {
    expect(() => calculateGesFeasibility({ ...baseGes, landAreaM2: -1 })).toThrow(GesValidationError);
  });

  it("uses PVGIS monthly formula", () => {
    const monthly = normalizePvgisMonthly(Array(12).fill(100));
    const pr = 0.82;
    const dc = 1000;
    const r = calculateGesFeasibility({
      ...baseGes,
      dcCapacityKwp: dc,
      performanceRatio: pr,
      pvgis: {
        source: "pvgis_live",
        lat: 37,
        lon: 32,
        tiltDeg: 25,
        annualIrradiationKwhM2: 1200,
        monthlyIrradiationKwhM2: monthly,
        fetchedAt: new Date().toISOString(),
        providerAvailable: true,
      },
    });
    expect(r.dataSource).toBe("pvgis_monthly");
    expect(r.monthlyProductionKwh[0]).toBeCloseTo(dc * monthly[0] * pr, 4);
    expect(r.annualProductionKwh).toBeCloseTo(
      r.monthlyProductionKwh.reduce((a, b) => a + b, 0),
      2,
    );
  });

  it("falls back to ghi profile when no PVGIS monthly", () => {
    const r = calculateGesFeasibility(baseGes);
    expect(r.dataSource).toBe("ghi_annual_fallback");
  });

  it("allows null IRR when cashflows do not bracket", () => {
    const r = calculateGesFeasibility({
      ...baseGes,
      electricityPriceTryPerKwh: 0.01,
      annualOpexTry: 50_000_000,
    });
    expect(r.irrPct).toBeNull();
    assertNoBadNumbers(r);
  });

  it("builds markdown report without NaN", () => {
    const r = calculateGesFeasibility(baseGes);
    const md = buildGesPrefeasibilityReport({ arazi: "100000 m2" }, r);
    expect(md).toContain("ön fizibilite");
    expect(md).not.toMatch(/NaN|undefined|Infinity/);
  });
});

describe("verified parcel core", () => {
  const baseParcel = {
    landAreaM2: 2500,
    emsal: 1.2,
    taks: 0.35,
    maxFloors: 8,
  };

  it("computes EMSAL and TAKS areas", () => {
    const r: ParcelFeasibilityReport = calculateParcelFeasibilityLegacy(baseParcel);
    expect(r.maxConstructionAreaM2).toBeCloseTo(2500 * 1.2, 4);
    expect(r.footprintM2).toBeCloseTo(2500 * 0.35, 4);
    assertNoBadNumbers(r);
  });

  it("throws on invalid emsal", () => {
    expect(() => calculateParcelFeasibilityLegacy({ ...baseParcel, emsal: 0 })).toThrow(
      ParcelValidationError,
    );
  });

  it("includes manual imar disclaimers", () => {
    const r = calculateParcelFeasibilityLegacy(baseParcel);
    expect(r.warnings.some((w) => w.toLowerCase().includes("imar"))).toBe(true);
    expect(r.limitations.some((l) => l.toLowerCase().includes("fizibilite"))).toBe(true);
  });

  it("builds parcel markdown report", () => {
    const r = calculateParcelFeasibilityLegacy(baseParcel);
    const md = buildParcelPrefeasibilityReport({ ada: "1", parsel: "2" }, r);
    expect(md).toContain("Yatırım tavsiyesi değildir");
    expect(md).not.toMatch(/NaN|undefined|Infinity/);
  });
});
