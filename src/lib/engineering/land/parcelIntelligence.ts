import {
  computeKkaBuildingSummary,
  type KkaParselFormInput,
} from "@/lib/finance/kkaParselImarEngine";
import { DEFAULT_DISCLAIMER } from "../core/types";
import { runGesAnalysis, type GesAnalysisInput } from "../ges/gesEngine";
import { computeZoningProbability, type ZoningFactorInput } from "./zoningProbability";

export type ParcelIntelligenceInput = {
  parcel: KkaParselFormInput;
  zoningFactors: ZoningFactorInput;
  ges?: GesAnalysisInput;
};

export type ParcelIntelligenceResult = {
  imar: ReturnType<typeof computeKkaBuildingSummary>;
  zoning: ReturnType<typeof computeZoningProbability>;
  ges?: ReturnType<typeof runGesAnalysis>;
  compositeScore: number;
  executiveSummary: string[];
  disclaimer: typeof DEFAULT_DISCLAIMER;
};

export function runParcelIntelligence(input: ParcelIntelligenceInput): ParcelIntelligenceResult {
  const imar = computeKkaBuildingSummary(input.parcel);
  const zoning = computeZoningProbability(input.zoningFactors);
  const ges = input.ges ? runGesAnalysis(input.ges) : undefined;

  let composite = zoning.value.transitionProbabilityPct * 0.35 + 50;
  if (ges) composite = composite * 0.5 + ges.scorecard.overall * 0.5;
  composite = Math.round(Math.max(0, Math.min(100, composite)));

  const executiveSummary = [
    `Ada ${input.parcel.ada} parsel ${input.parcel.parsel} — ${input.parcel.il}/${input.parcel.ilce}.`,
    `Brut insaat hakki ~${imar.grossConstructionRightM2.toLocaleString("tr-TR")} m² (EMSAL ${imar.effectiveEmsal}, TAKS ${imar.effectiveTaks}).`,
    `Imar gecis olasiligi (indeks): %${zoning.value.transitionProbabilityPct.toFixed(0)}.`,
    ges
      ? `GES uygunluk skoru ${ges.scorecard.gesSuitability}/100; Y1 ~${ges.production.value.annualEnergyKwhYear1.toLocaleString("tr-TR")} kWh.`
      : "GES analizi bu calismada secilmedi.",
    `Bilesik yatirim skoru (indikatif): ${composite}/100.`,
  ];

  return {
    imar,
    zoning,
    ges,
    compositeScore: composite,
    executiveSummary,
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
