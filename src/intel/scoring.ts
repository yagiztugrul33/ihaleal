import type { RegionIntelRaw, RegionScoreBreakdown, RegionTag } from "@/intel/types";

const WEIGHTS: RegionScoreBreakdown = {
  security: 0.2,
  income: 0.15,
  transport: 0.14,
  education: 0.1,
  health: 0.1,
  earthquakeResilience: 0.13,
  priceTrend: 0.1,
  liquidity: 0.08,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function scoreFromTrendPct(yearlyTrendPct: number): number {
  const normalized = 55 + yearlyTrendPct * 3.1;
  return clamp(Math.round(normalized));
}

export function getRegionTag(score: number): RegionTag {
  if (score >= 80) return "Premium";
  if (score >= 66) return "Yukselen";
  if (score >= 50) return "Duragan";
  return "Riskli";
}

export function computeEnvironmentBreakdown(input: RegionIntelRaw): RegionScoreBreakdown {
  return {
    security: clamp(input.securityScore),
    income: clamp(input.incomeScore),
    transport: clamp(input.transportScore),
    education: clamp(input.educationScore),
    health: clamp(input.healthScore),
    earthquakeResilience: clamp(100 - input.earthquakeRiskScore),
    priceTrend: scoreFromTrendPct(input.yearlyPriceTrendPct),
    liquidity: clamp(input.liquidityScore),
  };
}

export function computeEnvironmentScore(input: RegionIntelRaw): number {
  const b = computeEnvironmentBreakdown(input);
  const weighted =
    b.security * WEIGHTS.security +
    b.income * WEIGHTS.income +
    b.transport * WEIGHTS.transport +
    b.education * WEIGHTS.education +
    b.health * WEIGHTS.health +
    b.earthquakeResilience * WEIGHTS.earthquakeResilience +
    b.priceTrend * WEIGHTS.priceTrend +
    b.liquidity * WEIGHTS.liquidity;
  return clamp(Math.round(weighted));
}
