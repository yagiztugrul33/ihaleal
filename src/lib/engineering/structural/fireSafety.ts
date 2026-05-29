import { getMethodology } from "../core/methodology";
import { createPipeline, recordStep } from "../core/pipeline";
import type { EngineeringResult } from "../core/types";

export type FireSafetyInput = {
  buildingHeightM: number;
  floors: number;
  unitsPerFloor: number;
  corridorWidthM?: number;
  hasSprinkler?: boolean;
  refugeAreaM2?: number;
};

export type FireSafetyOutput = {
  complianceScore: number;
  maxTravelDistanceM: number;
  requiredExits: number;
  staircasesRequired: number;
  issues: string[];
  narrative: string[];
};

export function analyzeFireSafety(input: FireSafetyInput): EngineeringResult<FireSafetyOutput> {
  const ctx = createPipeline();
  const methodology = getMethodology("fire-safety");
  const h = input.buildingHeightM;
  const floors = input.floors;
  const units = input.unitsPerFloor;
  const corridor = input.corridorWidthM ?? 1.4;
  const sprinkler = input.hasSprinkler ?? false;

  const maxTravel = sprinkler ? 45 : h > 21 ? 30 : 35;
  const requiredExits = Math.max(2, Math.ceil((units * floors) / 40));
  const stairs = h > 21.5 ? Math.max(2, Math.ceil(floors / 8)) : Math.max(1, Math.ceil(floors / 12));

  const issues: string[] = [];
  let score = 85;
  if (corridor < 1.2) {
    issues.push("Koridor genisligi dusuk — yangin yolu genisletilmeli.");
    score -= 15;
  }
  if (!sprinkler && h > 28) {
    issues.push("Yuksek bina — sprinkler/otomatik sondurme degerlendirmesi.");
    score -= 12;
  }
  if ((input.refugeAreaM2 ?? 0) < floors * 2 && h > 30) {
    issues.push("Siginak/refuge alani yetersiz olabilir.");
    score -= 10;
  }
  if (requiredExits > 4 && corridor < 1.6) {
    issues.push("Yogun daire sayisi — cikis kapasitesi artirilmali.");
    score -= 8;
  }
  score = Math.max(20, Math.min(98, score));

  recordStep(ctx, {
    label: "Max travel distance",
    formula: "d_max ≈ f(h, sprinkler) [indikatif]",
    inputs: { height_m: h, sprinkler: sprinkler ? 1 : 0 },
    output: maxTravel,
    unit: "m",
    methodologyId: methodology.id,
  });

  return {
    value: {
      complianceScore: score,
      maxTravelDistanceM: maxTravel,
      requiredExits,
      staircasesRequired: stairs,
      issues,
      narrative: [
        `Yangin uyum skoru ${score}/100 (on onay degil).`,
        `Maks. tahliye mesafesi gostergesi ${maxTravel} m; ${requiredExits} cikis, ${stairs} merdiven.`,
      ],
    },
    confidence: "indicative",
    methodology,
    assumptions: [
      {
        id: "code",
        label: "Regulation",
        value: "Binalarin Yangindan Korunmasi Hakkinda Yonetmelik (indikatif)",
        source: "default",
      },
    ],
    steps: ctx.steps,
    limitations: ["Resmi itfaiye ve mimari proje onayi gereklidir.", "Duman tahliyesi ve kompartman detayi hesaplanmaz."],
  };
}
