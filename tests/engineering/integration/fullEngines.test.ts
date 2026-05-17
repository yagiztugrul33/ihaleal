import { describe, expect, it } from "vitest";
import { fetchSiteEnvironmentalData } from "@/lib/data/siteEnvironmentalData";
import { fmtNum, fmtScore } from "@/lib/engineering/formatDisplay";
import { analyzeDisasterRisk } from "@/lib/engineering/disaster/disasterRisk";
import { analyzeFireSafety } from "@/lib/engineering/structural/fireSafety";
import { runGesAnalysis } from "@/lib/engineering/ges/gesEngine";
import { buildInstitutionalSiteReport } from "@/lib/engineering/reports/institutionalReport";
import { buildGesFeasibilityMarkdown } from "@/lib/engineering/reports/gesFeasibilityReport";
import { runSiteIntelligence } from "@/lib/engineering/urban/siteIntelligence";

describe("engineering integration", () => {
  it("GES produces finite financial metrics", () => {
    const r = runGesAnalysis({
      site: { landAreaM2: 50_000, annualGhiKwhM2: 1800 },
      pv: { dcCapacityKwp: 1000 },
      financial: {
        electricityPriceTryPerKwh: 2.5,
        annualOpexTry: 100_000,
        discountRatePct: 10,
        projectYears: 20,
        capexTryPerKwp: 11_000,
      },
    });
    expect(Number.isFinite(r.production.value.annualEnergyKwhYear1)).toBe(true);
    expect(Number.isFinite(r.financial.value.npvTry)).toBe(true);
    expect(r.financial.value.lcoeTryPerKwh).toBeGreaterThan(0);
    expect(Number.isFinite(r.financial.value.lcoeTryPerKwh)).toBe(true);
  });

  it("site orchestrator returns full output", () => {
    const r = runSiteIntelligence({
      lat: 37.87,
      lon: 32.49,
      geotech: { zeminSinifi: "ZC" },
      seismic: { pgaG: 0.35 },
    });
    expect(r.strategicScore).toBeGreaterThan(0);
    expect(r.soil.value.recommendations.length).toBeGreaterThan(0);
    expect(r.aiReasoning.length).toBeGreaterThan(0);
    expect(r.disclaimer.legal.length).toBeGreaterThan(20);
  });

  it("disaster and fire scores stay in 0-100", () => {
    const d = analyzeDisasterRisk({ seismicRiskScore: 50 });
    expect(d.value.compositeHazardScore).toBeGreaterThanOrEqual(0);
    expect(d.value.compositeHazardScore).toBeLessThanOrEqual(100);
    const f = analyzeFireSafety({ buildingHeightM: 30, floors: 10, unitsPerFloor: 4 });
    expect(f.value.complianceScore).toBeGreaterThanOrEqual(0);
    expect(f.value.complianceScore).toBeLessThanOrEqual(100);
  });

  it("reports avoid NaN strings", () => {
    const site = runSiteIntelligence({ lat: 39, lon: 32, geotech: { vs30Mps: 400 } });
    const md = buildInstitutionalSiteReport(site, null);
    expect(md).not.toMatch(/NaN|undefined|null/);
    const ges = runGesAnalysis({
      site: { landAreaM2: 10_000, annualGhiKwhM2: 1700 },
      pv: { dcCapacityKwp: 500 },
      financial: {
        electricityPriceTryPerKwh: 2,
        annualOpexTry: 50_000,
        discountRatePct: 12,
        projectYears: 15,
      },
    });
    const gmd = buildGesFeasibilityMarkdown(ges);
    expect(gmd).not.toMatch(/NaN|undefined/);
  });

  it("fmtNum handles bad values", () => {
    expect(fmtNum(NaN)).toBe("—");
    expect(fmtScore(undefined)).toBe("—");
  });

  it("environmental bundle assigns partial when APIs fail", async () => {
    const env = await fetchSiteEnvironmentalData({ lat: 0, lon: 0 });
    expect(["high", "partial", "low"]).toContain(env.dataQuality);
    expect(env.limitations).toBeInstanceOf(Array);
  }, 30_000);
});
