import { getMethodology } from "../core/methodology";
import { createPipeline, recordStep } from "../core/pipeline";
import type { EngineeringResult } from "../core/types";

export type DisasterInput = {
  seismicRiskScore: number;
  floodRiskScore?: number;
  landslideRiskScore?: number;
  fireUrbanScore?: number;
  tsunamiRiskScore?: number;
  emergencyAccessScore?: number;
  elevationM?: number;
  slopeDeg?: number;
};

export type DisasterOutput = {
  compositeHazardScore: number;
  evacuationReadinessScore: number;
  resilienceScore: number;
  dominantHazards: string[];
  mitigations: string[];
  narrative: string[];
};

export function analyzeDisasterRisk(input: DisasterInput): EngineeringResult<DisasterOutput> {
  const ctx = createPipeline();
  const methodology = getMethodology("disaster-composite");
  const flood = input.floodRiskScore ?? 25;
  const landslide = input.landslideRiskScore ?? 20;
  const fire = input.fireUrbanScore ?? 25;
  const tsunami = input.tsunamiRiskScore ?? 5;
  const access = input.emergencyAccessScore ?? 65;
  const slope = input.slopeDeg ?? 2;

  const composite = Math.round(
    Math.min(
      98,
      input.seismicRiskScore * 0.35 +
        flood * 0.22 +
        landslide * 0.18 +
        fire * 0.12 +
        tsunami * 0.05 +
        (slope > 20 ? 15 : 0),
    ),
  );
  const evacuation = Math.round(Math.max(12, access - composite * 0.35));
  const resilience = Math.round(Math.max(10, 100 - composite * 0.7));

  const hazards: { id: string; score: number }[] = [
    { id: "Deprem", score: input.seismicRiskScore },
    { id: "Sel", score: flood },
    { id: "Heyelan", score: landslide },
    { id: "Yangin", score: fire },
    { id: "Tsunami", score: tsunami },
  ];
  hazards.sort((a, b) => b.score - a.score);
  const dominantHazards = hazards.filter((h) => h.score > 35).slice(0, 3).map((h) => h.id);

  const mitigations: string[] = [];
  if (flood > 45) mitigations.push("Taban kotu ve su yonetimi — drenaj ve PMP analizi.");
  if (landslide > 40) mitigations.push("Sev stabilitesi — istinat ve drenaj muhendisligi.");
  if (input.seismicRiskScore > 50) mitigations.push("Yapisal performans hedefi ve zemin iyilestirme.");
  if (access < 50) mitigations.push("Acil ulasim — yangin yolu genisligi ve giris mesafesi.");

  recordStep(ctx, {
    label: "Composite hazard",
    formula: "H = Σ(w_i × risk_i)",
    inputs: { seismic: input.seismicRiskScore, flood, landslide, fire },
    output: composite,
    unit: "score 0-100",
    methodologyId: methodology.id,
  });

  return {
    value: {
      compositeHazardScore: composite,
      evacuationReadinessScore: evacuation,
      resilienceScore: resilience,
      dominantHazards,
      mitigations,
      narrative: [
        `Bilesik afet riski ${composite}/100.`,
        `Baskin tehlikeler: ${dominantHazards.join(", ") || "dusuk profil"}.`,
        `Tahliye hazirligi ${evacuation}/100.`,
      ],
    },
    confidence: "indicative",
    methodology,
    assumptions: [
      {
        id: "weights",
        label: "Hazard weights",
        value: "seismic 0.35, flood 0.22, landslide 0.18",
        source: "default",
      },
    ],
    steps: ctx.steps,
    limitations: ["Resmi AFAD/harita katmanlari ile dogrulanmali.", "Tsunami kiyi bandinda ayrica degerlendirilir."],
  };
}
