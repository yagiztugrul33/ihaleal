import { getMethodology } from "../core/methodology";
import { createPipeline, recordStep } from "../core/pipeline";
import type { EngineeringResult } from "../core/types";

export type SeismicInput = {
  pgaG?: number;
  vs30Mps: number;
  faultDistanceKm?: number;
  buildingHeightM?: number;
  irregularityScore?: number;
  soilClass?: string;
};

export type SeismicOutput = {
  designPgaG: number;
  spectralSaT1: number;
  amplificationFactor: number;
  seismicRiskScore: number;
  resilienceScore: number;
  performanceLevel: "IO" | "LS" | "CP" | "indicative";
  retrofitHints: string[];
  narrative: string[];
};

/** Site amplification Fa ≈ (Vs30_ref/Vs30)^0.5 simplified (NEHRP-style band) */
function siteAmplification(vs30: number): number {
  const ref = 760;
  const fa = Math.sqrt(ref / Math.max(180, Math.min(1500, vs30)));
  return Math.max(1, Math.min(2.2, fa));
}

export function analyzeSeismic(input: SeismicInput): EngineeringResult<SeismicOutput> {
  const ctx = createPipeline();
  const methodology = getMethodology("seismic-tbdy");
  const pga = input.pgaG ?? 0.35;
  const vs30 = input.vs30Mps;
  const fa = siteAmplification(vs30);
  const fault = input.faultDistanceKm ?? 20;
  const h = input.buildingHeightM ?? 30;
  const irr = input.irregularityScore ?? 30;

  const designPga = pga * fa;
  const saT1 = designPga * 2.5;
  let risk = designPga * 40 + irr * 0.4 + (fault < 5 ? 20 : fault < 15 ? 10 : 0);
  risk = Math.round(Math.min(95, Math.max(8, risk)));
  const resilience = Math.round(Math.max(10, 100 - risk * 0.65 - (h > 50 ? 10 : 0)));

  const performanceLevel: SeismicOutput["performanceLevel"] =
    risk > 70 ? "CP" : risk > 45 ? "LS" : "IO";

  const retrofitHints: string[] = [];
  if (irr > 50) retrofitHints.push("Plan duzensizligi — titresim perdesi ve rijitlik dagilimi gozden gecirilmeli.");
  if (vs30 < 360) retrofitHints.push("Zemin sinifi ZD/ZE — temel iyilestirme veya kazik sistem.");
  if (fault < 10) retrofitHints.push("Fay yakınligi — detayli zemin ve fay etudu zorunlu.");
  if (h > 45) retrofitHints.push("Yuksek bina — TBDY yuksek bina hükumleri ve performans analizi.");

  recordStep(ctx, {
    label: "Design PGA",
    formula: "PGA_design = PGA × Fa(Vs30)",
    inputs: { PGA: pga, Fa: fa, Vs30: vs30 },
    output: designPga,
    unit: "g",
    methodologyId: methodology.id,
  });

  return {
    value: {
      designPgaG: designPga,
      spectralSaT1: saT1,
      amplificationFactor: fa,
      seismicRiskScore: risk,
      resilienceScore: resilience,
      performanceLevel,
      retrofitHints,
      narrative: [
        `Tasarim PGA ≈ ${designPga.toFixed(2)}g (Fa=${fa.toFixed(2)}).`,
        `Deprem risk skoru ${risk}/100; dayaniklilik ${resilience}/100.`,
        `Performans seviyesi gostergesi: ${performanceLevel} — resmi statik proje sartidir.`,
      ],
    },
    confidence: input.pgaG ? "medium" : "indicative",
    methodology,
    assumptions: [
      {
        id: "pga",
        label: "PGA",
        value: pga,
        source: input.pgaG ? "user" : "default",
        rationale: "AFAD/TDTH haritasi veya proje PGA girilmeli",
      },
    ],
    steps: ctx.steps,
    limitations: [
      "Spektral analiz ve TBDY tam uyum bu surumde yapilmaz.",
      "Bina davranisi bina tipine gore degisir.",
    ],
  };
}
