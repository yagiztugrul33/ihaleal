import { getMethodology } from "../core/methodology";
import { createPipeline, recordStep } from "../core/pipeline";
import type { EngineeringResult } from "../core/types";

export const ZEMIN_VS30: Record<string, { vs30Min: number; vs30Max: number; label: string }> = {
  ZA: { vs30Min: 1500, vs30Max: 9999, label: "Sert kaya (ZA)" },
  ZB: { vs30Min: 760, vs30Max: 1500, label: "Kaya (ZB)" },
  ZC: { vs30Min: 360, vs30Max: 760, label: "Sert zemin (ZC)" },
  ZD: { vs30Min: 180, vs30Max: 360, label: "Orta zemin (ZD)" },
  ZE: { vs30Min: 100, vs30Max: 180, label: "Zayif zemin (ZE)" },
};

export type SoilAnalysisInput = {
  zeminSinifi?: keyof typeof ZEMIN_VS30 | string;
  vs30Mps?: number;
  groundwaterDepthM?: number;
  slopeDeg?: number;
  fillRiskScore?: number;
  excavationDepthM?: number;
};

export type FoundationRecommendation = {
  system: "radye" | "kazik_bored" | "kazik_driven" | "mini_kazik" | "jet_grout" | "raft_pile_hybrid";
  label: string;
  suitabilityScore: number;
  rationale: string;
};

export type SoilAnalysisOutput = {
  vs30Mps: number;
  zeminSinifi: string;
  bearingCapacityKpaIndicative: number;
  liquefactionIndex: number;
  settlementRiskScore: number;
  slopeStabilityScore: number;
  excavationRiskScore: number;
  recommendations: FoundationRecommendation[];
  narrative: string[];
};

function resolveVs30(input: SoilAnalysisInput): { vs30: number; sinif: string } {
  if (input.vs30Mps && input.vs30Mps > 0) {
    const vs = input.vs30Mps;
    const sinif = vs >= 1500 ? "ZA" : vs >= 760 ? "ZB" : vs >= 360 ? "ZC" : vs >= 180 ? "ZD" : "ZE";
    return { vs30: vs, sinif };
  }
  const key = (input.zeminSinifi ?? "ZC").toUpperCase().replace(/\s/g, "") as keyof typeof ZEMIN_VS30;
  const band = ZEMIN_VS30[key] ?? ZEMIN_VS30.ZC;
  return { vs30: (band.vs30Min + band.vs30Max) / 2, sinif: key in ZEMIN_VS30 ? key : "ZC" };
}

function liquefactionIndex(vs30: number, gwDepthM: number): number {
  const factor = Math.max(0, 1 - vs30 / 400);
  const gw = gwDepthM < 3 ? 1.25 : gwDepthM < 8 ? 1 : 0.75;
  return Math.round(Math.min(95, factor * 80 * gw));
}

export function analyzeSoil(input: SoilAnalysisInput): EngineeringResult<SoilAnalysisOutput> {
  const ctx = createPipeline();
  const methodology = getMethodology("geotech-soil");
  const { vs30, sinif } = resolveVs30(input);
  const gw = input.groundwaterDepthM ?? 8;
  const slope = input.slopeDeg ?? 2;
  const fill = input.fillRiskScore ?? 20;

  const liq = liquefactionIndex(vs30, gw);
  const bearing = Math.round(50 + vs30 * 0.08);
  const settlement = Math.round(Math.max(10, 90 - vs30 / 15 + (gw < 4 ? 15 : 0)));
  const slopeStab = Math.round(Math.max(15, 100 - slope * 4 - fill * 0.3));
  const excavRisk = Math.round(Math.min(90, (input.excavationDepthM ?? 4) * 8 + (gw < 5 ? 15 : 0) + fill * 0.2));

  const recommendations: FoundationRecommendation[] = [];
  if (vs30 >= 760 && liq < 35 && slope < 15) {
    recommendations.push({ system: "radye", label: "Radye temel", suitabilityScore: 88, rationale: "Yuksek Vs30 — yayilmis temel uygun." });
  }
  if (vs30 < 360 || liq > 50) {
    recommendations.push({ system: "kazik_bored", label: "Bored kazik", suitabilityScore: 82, rationale: "Dusuk Vs30 veya sivislasma — kazik onerilir." });
  }
  if (vs30 < 250 || excavRisk > 55) {
    recommendations.push({ system: "mini_kazik", label: "Mini kazik", suitabilityScore: 75, rationale: "Kisitli alan veya derin kazi." });
  }
  if (liq > 60) {
    recommendations.push({ system: "jet_grout", label: "Jet grout", suitabilityScore: 70, rationale: "Yuksek sivislasma — iyilestirme." });
  }
  if (recommendations.length === 0) {
    recommendations.push({ system: "raft_pile_hybrid", label: "Radye + kazik hibrit", suitabilityScore: 72, rationale: "Karma zemin — rapor gerekli." });
  }

  recordStep(ctx, { label: "Vs30", formula: "TBDY zemin → Vs30 band", inputs: { zemin: sinif }, output: vs30, unit: "m/s", methodologyId: methodology.id });
  recordStep(ctx, { label: "Liquefaction index", formula: "LPI_heuristic(Vs30, GW)", inputs: { vs30, gw }, output: liq, unit: "0-100", methodologyId: methodology.id });

  return {
    value: { vs30Mps: vs30, zeminSinifi: sinif, bearingCapacityKpaIndicative: bearing, liquefactionIndex: liq, settlementRiskScore: settlement, slopeStabilityScore: slopeStab, excavationRiskScore: excavRisk, recommendations, narrative: [`Zemin ${sinif}; Vs30 ~${vs30.toFixed(0)} m/s.`, `Sivislasma indeksi ${liq}/100.`, `Oneri: ${recommendations[0].label}.`] },
    confidence: input.vs30Mps ? "medium" : "indicative",
    methodology,
    assumptions: [{ id: "vs30", label: "Vs30", value: sinif, source: "default" }],
    steps: ctx.steps,
    limitations: ["Jeoteknik rapor zorunludur.", "Sivislasma indikatif heuristiktir."],
  };
}