import { DEFAULT_DISCLAIMER } from "../core/types";
import type { AnalysisDisclaimer } from "../core/types";
import { computeIrradiance, type IrradianceInput } from "./irradiance";
import {
  analyzePvSystem,
  computeEnergyProduction,
  type PvSystemInput,
} from "./pvPerformance";
import { computeGesFinancials, type GesFinancialInput } from "./financial";

export type GesAnalysisInput = {
  site: IrradianceInput & {
    landAreaM2: number;
    regionKey?: string;
    lat?: number;
    lon?: number;
  };
  pv: PvSystemInput;
  financial: Omit<GesFinancialInput, "annualRevenueTryByYear"> & {
    electricityPriceTryPerKwh: number;
    capexTryPerKwp?: number;
  };
  infrastructure?: {
    transformerDistanceKm?: number;
    gridAvailabilityScore?: number;
  };
  environmental?: {
    floodRiskScore?: number;
    seismicRiskScore?: number;
  };
};

export type GesScorecard = {
  gesSuitability: number;
  infrastructure: number;
  profitability: number;
  environmental: number;
  legalRisk: number;
  overall: number;
  confidence: "high" | "medium" | "low" | "indicative";
};

export type GesAnalysisResult = {
  irradiance: ReturnType<typeof computeIrradiance>;
  pvSystem: ReturnType<typeof analyzePvSystem>;
  production: ReturnType<typeof computeEnergyProduction>;
  financial: ReturnType<typeof computeGesFinancials>;
  scorecard: GesScorecard;
  aiReasoning: string[];
  disclaimer: AnalysisDisclaimer;
};

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function runGesAnalysis(input: GesAnalysisInput): GesAnalysisResult {
  const irradiance = computeIrradiance({
    annualGhiKwhM2: input.site.annualGhiKwhM2,
    annualPoaKwhM2: input.site.annualPoaKwhM2,
    regionKey: input.site.regionKey,
    tiltDeg: input.site.tiltDeg,
    azimuthDeg: input.site.azimuthDeg,
  });

  const pvSystem = analyzePvSystem(input.pv);

  const production = computeEnergyProduction({
    dcCapacityKwp: input.pv.dcCapacityKwp,
    annualPoaKwhM2: irradiance.value.annualPoaKwhM2,
    performanceRatio: pvSystem.value.computedPerformanceRatio,
    temperatureFactor: pvSystem.value.temperatureLossFactor,
    projectYears: input.financial.projectYears,
  });

  const price = input.financial.electricityPriceTryPerKwh;
  const annualRevenueTryByYear = production.value.annualEnergyByYear.map(
    (kwh) => kwh * price,
  );

  const capex =
    input.financial.capexTry ??
    input.pv.dcCapacityKwp * (input.financial.capexTryPerKwp ?? 12000);

  const financial = computeGesFinancials({
    ...input.financial,
    capexTry: capex,
    annualRevenueTryByYear,
    annualEnergyKwhByYear: production.value.annualEnergyByYear,
  });

  const landPerMw = input.site.landAreaM2 / (input.pv.dcCapacityKwp / 1000);
  const infraDist = input.infrastructure?.transformerDistanceKm ?? 5;
  const grid = input.infrastructure?.gridAvailabilityScore ?? 70;
  const flood = input.environmental?.floodRiskScore ?? 30;
  const seismic = input.environmental?.seismicRiskScore ?? 25;

  const gesSuitability = clampScore(
    irradiance.value.annualPoaKwhM2 / 20 +
      production.value.capacityFactor * 120 -
      (input.pv.shadingLossPct ?? 2) * 3,
  );
  const infrastructure = clampScore(grid - infraDist * 4 - (landPerMw > 25000 ? 10 : 0));
  const profitability = clampScore(
    (financial.value.irrPct ?? 0) * 2 + (financial.value.npvTry > 0 ? 25 : 0),
  );
  const environmental = clampScore(100 - flood * 0.4 - seismic * 0.35);
  const legalRisk = clampScore(65);
  const overall = clampScore(
    gesSuitability * 0.3 +
      infrastructure * 0.2 +
      profitability * 0.25 +
      environmental * 0.15 +
      (100 - legalRisk) * 0.1,
  );

  const reasoning: string[] = [
    `Yillik POA isinim ${irradiance.value.annualPoaKwhM2.toFixed(0)} kWh/m² — ${irradiance.confidence} guven.`,
    `Y1 uretim ${production.value.annualEnergyKwhYear1.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} kWh; kapasite faktoru %${(production.value.capacityFactor * 100).toFixed(1)}.`,
    `PR ${(pvSystem.value.computedPerformanceRatio * 100).toFixed(1)}% (kayip yigini ile).`,
    financial.value.irrPct != null
      ? `IRR %${financial.value.irrPct.toFixed(1)} (basitlestirilmis DCF; vergi/borc yok).`
      : "IRR bu nakit akisi ile cozulemedi — varsayimlari gozden gecirin.",
    `NPV ${financial.value.npvTry.toLocaleString("tr-TR")} TRY; LCOE ${financial.value.lcoeTryPerKwh.toFixed(2)} TRY/kWh (indikatif).`,
    infraDist > 8
      ? "Trafo mesafesi yuksek — AG/OG maliyet ve kayip riski artar."
      : "Trafo mesafesi makul bandda.",
  ];

  return {
    irradiance,
    pvSystem,
    production,
    financial,
    scorecard: {
      gesSuitability,
      infrastructure,
      profitability,
      environmental,
      legalRisk,
      overall,
      confidence: irradiance.confidence === "low" ? "indicative" : "medium",
    },
    aiReasoning: reasoning,
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
