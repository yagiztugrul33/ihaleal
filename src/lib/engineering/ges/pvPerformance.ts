import { getMethodology } from "../core/methodology";
import { createPipeline, recordStep } from "../core/pipeline";
import type { EngineeringResult } from "../core/types";
import {
  DEFAULT_DEGRADATION_PCT_YEAR,
  DEFAULT_PERFORMANCE_RATIO,
  DEFAULT_TEMP_COEFF_PCT_PER_C,
  HOURS_PER_YEAR,
  SCT_TEMP_C,
} from "./constants";

export type PvSystemInput = {
  dcCapacityKwp: number;
  acCapacityKwp?: number;
  moduleEfficiencyPct?: number;
  inverterEfficiencyPct?: number;
  cableLossPct?: number;
  soilingLossPct?: number;
  shadingLossPct?: number;
  availabilityPct?: number;
  ambientTempC?: number;
};

export type PvSystemOutput = {
  computedPerformanceRatio: number;
  temperatureLossFactor: number;
  dcAcRatio: number;
};

export type EnergyProductionInput = {
  dcCapacityKwp: number;
  annualPoaKwhM2: number;
  performanceRatio: number;
  temperatureFactor: number;
  projectYears: number;
};

export type EnergyProductionOutput = {
  annualEnergyKwhYear1: number;
  annualEnergyByYear: number[];
  capacityFactor: number;
};

function lossFactor(pct?: number): number {
  return 1 - (pct ?? 0) / 100;
}

export function analyzePvSystem(input: PvSystemInput): EngineeringResult<PvSystemOutput> {
  const ctx = createPipeline();
  const methodology = getMethodology("iec-pv-performance");
  const inv = lossFactor(input.inverterEfficiencyPct ?? 98);
  const cable = lossFactor(input.cableLossPct ?? 1.5);
  const soiling = lossFactor(input.soilingLossPct ?? 2);
  const shading = lossFactor(input.shadingLossPct ?? 2);
  const avail = lossFactor(100 - (input.availabilityPct ?? 98));
  const prStack = inv * cable * soiling * shading * avail;
  const pr = Math.min(DEFAULT_PERFORMANCE_RATIO, DEFAULT_PERFORMANCE_RATIO * prStack);
  const ambient = input.ambientTempC ?? 18;
  const tempLoss = 1 + (DEFAULT_TEMP_COEFF_PCT_PER_C / 100) * (ambient - SCT_TEMP_C);
  const temperatureLossFactor = Math.max(0.85, Math.min(1.05, tempLoss));
  const ac = input.acCapacityKwp ?? input.dcCapacityKwp * 0.95;

  recordStep(ctx, {
    label: "Performance ratio",
    formula: "PR = Π(1 − loss_i)",
    inputs: { inv, cable, soiling, shading, avail },
    output: pr,
    unit: "ratio",
    methodologyId: methodology.id,
  });

  return {
    value: {
      computedPerformanceRatio: pr,
      temperatureLossFactor,
      dcAcRatio: input.dcCapacityKwp / ac,
    },
    confidence: "medium",
    methodology,
    assumptions: [
      {
        id: "pr-cap",
        label: "PR cap",
        value: DEFAULT_PERFORMANCE_RATIO,
        source: "default",
        rationale: "Typical utility-scale band",
      },
    ],
    steps: ctx.steps,
    limitations: ["No hourly simulation or bifacial gain."],
  };
}

export function computeEnergyProduction(
  input: EnergyProductionInput,
): EngineeringResult<EnergyProductionOutput> {
  const ctx = createPipeline();
  const methodology = getMethodology("iec-pv-performance");
  const e1 =
    input.dcCapacityKwp * input.annualPoaKwhM2 * input.performanceRatio * input.temperatureFactor;
  const d = DEFAULT_DEGRADATION_PCT_YEAR / 100;
  const years = input.projectYears;
  const annualEnergyByYear: number[] = [];
  for (let n = 1; n <= years; n++) {
    annualEnergyByYear.push(e1 * Math.pow(1 - d, n - 1));
  }
  const acKw = input.dcCapacityKwp * 0.95;
  const capacityFactor = e1 / (acKw * HOURS_PER_YEAR);

  recordStep(ctx, {
    label: "Year-1 energy",
    formula: "E_1 = P_dc[kWp] × H_POA × PR × f_T",
    inputs: {
      P_dc: input.dcCapacityKwp,
      H_POA: input.annualPoaKwhM2,
      PR: input.performanceRatio,
      f_T: input.temperatureFactor,
    },
    output: e1,
    unit: "kWh",
    methodologyId: methodology.id,
  });

  return {
    value: {
      annualEnergyKwhYear1: e1,
      annualEnergyByYear,
      capacityFactor,
    },
    confidence: "medium",
    methodology,
    assumptions: [
      {
        id: "degradation",
        label: "Annual degradation",
        value: DEFAULT_DEGRADATION_PCT_YEAR,
        unit: "%/year",
        source: "default",
      },
    ],
    steps: ctx.steps,
    limitations: ["Linear degradation; no curtailment."],
  };
}
