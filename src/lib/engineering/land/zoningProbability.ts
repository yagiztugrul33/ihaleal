import { getMethodology } from "../core/methodology";
import { createPipeline, recordStep } from "../core/pipeline";
import type { EngineeringResult, RiskFactor } from "../core/types";

export type ZoningFactorInput = {
  /** 0–100: proximity to urban boundary / plan */
  urbanProximityScore: number;
  /** 0–100: road/highway project influence */
  transportProjectScore: number;
  /** 0–100: industrial zone expansion signal */
  industrialExpansionScore: number;
  /** 0–100: population / migration growth */
  demographicGrowthScore: number;
  /** 0–100: existing arsa/imar density nearby */
  existingZoningDensityScore: number;
  /** Current use: tarla | arsa | sanayi | diger */
  currentLandUse: string;
  /** Years to horizon */
  horizonYears?: number;
};

export type ZoningProbabilityOutput = {
  transitionProbabilityPct: number;
  appreciationLikelihoodPct: number;
  estimatedHorizonYears: number;
  factors: RiskFactor[];
  narrative: string[];
};

const WEIGHTS = {
  urbanProximity: 0.28,
  transport: 0.22,
  industrial: 0.18,
  demographic: 0.17,
  zoningDensity: 0.15,
};

export function computeZoningProbability(
  input: ZoningFactorInput,
): EngineeringResult<ZoningProbabilityOutput> {
  const ctx = createPipeline();
  const methodology = getMethodology("zoning-probability");
  const horizon = input.horizonYears ?? 7;

  const weighted =
    input.urbanProximityScore * WEIGHTS.urbanProximity +
    input.transportProjectScore * WEIGHTS.transport +
    input.industrialExpansionScore * WEIGHTS.industrial +
    input.demographicGrowthScore * WEIGHTS.demographic +
    input.existingZoningDensityScore * WEIGHTS.zoningDensity;

  let transition = weighted;
  if (input.currentLandUse.toLowerCase().includes("tarla")) transition *= 1.05;
  if (input.currentLandUse.toLowerCase().includes("arsa")) transition *= 0.65;
  transition = Math.max(5, Math.min(92, transition));

  const appreciation = Math.max(8, Math.min(90, transition * 0.85 + input.demographicGrowthScore * 0.1));

  recordStep(ctx, {
    label: "Transition probability index",
    formula: "P = Σ(w_i × s_i), capped [5,92]%",
    inputs: { ...WEIGHTS, weighted_sum: weighted },
    output: transition,
    unit: "%",
    methodologyId: methodology.id,
  });

  const factors: RiskFactor[] = [
    {
      id: "urban",
      label: "Kentsel sinir / plan yakınlığı",
      score: input.urbanProximityScore,
      weight: WEIGHTS.urbanProximity,
      rationale: "Plan onayları ve imar adası genisleme sinyali",
      confidence: "medium",
    },
    {
      id: "transport",
      label: "Ulaşım projesi etkisi",
      score: input.transportProjectScore,
      weight: WEIGHTS.transport,
      rationale: "Otoyol, metro, havalimanı koridorlari",
      confidence: "medium",
    },
  ];

  const narrative = [
    `Tarla→arsa gecis olasiligi (indeks): %${transition.toFixed(0)} — garanti degil.`,
    `Deger artisi olasiligi (indeks): %${appreciation.toFixed(0)}; ufuk ${horizon} yil.`,
    "Resmi imar planı ve belediye yazisi olmadan yatirim karari verilmemelidir.",
  ];

  return {
    value: {
      transitionProbabilityPct: transition,
      appreciationLikelihoodPct: appreciation,
      estimatedHorizonYears: horizon,
      factors,
      narrative,
    },
    confidence: "indicative",
    methodology,
    assumptions: [
      {
        id: "weights",
        label: "Factor weights",
        value: JSON.stringify(WEIGHTS),
        source: "default",
        rationale: "Heuristic planning model — calibrate with municipal plan data",
      },
    ],
    steps: ctx.steps,
    limitations: [
      "Not a municipal zoning approval prediction.",
      "Historical plan change data not loaded in this version.",
    ],
  };
}
