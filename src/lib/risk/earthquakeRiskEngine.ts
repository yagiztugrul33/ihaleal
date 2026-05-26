export type SoilClass = "ZA" | "ZB" | "ZC" | "ZD" | "ZE";
export type StructuralSystem = "reinforced_concrete" | "steel" | "masonry" | "mixed";
export type CodeEra = "pre_2018" | "post_2018";

export interface EarthquakeRiskInput {
  city: string;
  district: string;
  neighborhood?: string;
  faultDistanceKm: number;
  pgaG: number;
  soilClass: SoilClass;
  fsCoefficient: number;
  f1Coefficient: number;
  sptN160: number;
  groundwaterDepthM: number;
  alluviumPercent: number;
  buildingAge: number;
  structuralSystem: StructuralSystem;
  codeEra: CodeEra;
  storyCount: number;
  softStory: boolean;
}

export interface RiskLayer {
  score: number;
  note: string;
}

export interface RiskContribution {
  key: "hazard" | "soil" | "liquefaction" | "structural";
  label: string;
  score: number;
  weightPct: number;
  contributionPts: number;
}

export interface EarthquakeRiskResult {
  totalScore: number;
  hazard: RiskLayer;
  soil: RiskLayer;
  liquefaction: RiskLayer;
  structural: RiskLayer;
  contributions: RiskContribution[];
  interpretation: string;
  disclaimer: string;
}

const WEIGHTS = {
  hazard: 0.28,
  soil: 0.24,
  liquefaction: 0.2,
  structural: 0.28,
} as const;

const SOIL_BASE: Record<SoilClass, number> = {
  ZA: 96,
  ZB: 86,
  ZC: 72,
  ZD: 56,
  ZE: 42,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function pgaPenalty(pgaG: number): number {
  if (pgaG <= 0.22) return 4;
  if (pgaG <= 0.35) return 14;
  if (pgaG <= 0.48) return 26;
  return 38;
}

export function calculateHazardLayer(input: EarthquakeRiskInput): RiskLayer {
  const distanceScore = clamp(100 * (input.faultDistanceKm / (input.faultDistanceKm + 8)), 15, 100);
  const pga = pgaPenalty(input.pgaG);
  const score = clamp(distanceScore - pga, 0, 100);
  return {
    score: round(score),
    note: "Demo veri / ön analiz: fay mesafesi + AFAD deprem tehlike haritası (PGA) mantığı ile üretildi.",
  };
}

export function calculateSoilLayer(input: EarthquakeRiskInput): RiskLayer {
  const base = SOIL_BASE[input.soilClass];
  const fsPenalty = clamp((input.fsCoefficient - 1) * 24, 0, 20);
  const f1Penalty = clamp((input.f1Coefficient - 1) * 22, 0, 18);
  const score = clamp(base - fsPenalty - f1Penalty, 0, 100);
  return {
    score: round(score),
    note: "Demo veri / ön analiz: TBDY zemin sınıfı (ZA-ZE) ve FS/F1 katsayıları birlikte değerlendirildi.",
  };
}

export function calculateLiquefactionLayer(input: EarthquakeRiskInput): RiskLayer {
  const sptPenalty = input.sptN160 < 15 ? 38 : input.sptN160 < 30 ? 24 : input.sptN160 < 45 ? 12 : 4;
  const groundwaterPenalty = input.groundwaterDepthM < 2 ? 22 : input.groundwaterDepthM < 4 ? 13 : 4;
  const alluviumPenalty = clamp(input.alluviumPercent * 0.3, 0, 24);
  const score = clamp(100 - sptPenalty - groundwaterPenalty - alluviumPenalty, 0, 100);
  return {
    score: round(score),
    note: "Demo veri / ön analiz: SPT N1,60, yeraltı suyu ve alüvyon yüzdesi ile sıvılaşma riski üretildi.",
  };
}

function structuralBase(system: StructuralSystem): number {
  if (system === "steel") return 88;
  if (system === "reinforced_concrete") return 80;
  if (system === "mixed") return 71;
  return 54;
}

export function calculateStructuralLayer(input: EarthquakeRiskInput): RiskLayer {
  const agePenalty = clamp(input.buildingAge * 1.05, 0, 42);
  const codeBonus = input.codeEra === "post_2018" ? 11 : -9;
  const softStoryPenalty = input.softStory ? 22 : 0;
  const storiesPenalty = clamp((input.storyCount - 4) * 1.25, 0, 14);
  const score = clamp(structuralBase(input.structuralSystem) - agePenalty + codeBonus - softStoryPenalty - storiesPenalty, 0, 100);
  return {
    score: round(score),
    note: "Demo veri / ön analiz: yapı yaşı, taşıyıcı sistem, 2018 kod uyumu ve yumuşak kat etkisi değerlendirildi.",
  };
}

function interpret(score: number): string {
  if (score >= 80) return "Düşük risk bandı: yine de zemin etüdü ve statik rapor teyidi gerekir.";
  if (score >= 65) return "Orta risk bandı: proje öncesi uzman kontrolü ve güçlendirme opsiyonu önerilir.";
  if (score >= 45) return "Yüksek dikkat bandı: jeoloji + inşaat mühendisliği denetimi olmadan ilerlenmemeli.";
  return "Kritik risk bandı: lisanslı uzman etüdü ve güçlendirme/yeniden değerlendirme zorunlu.";
}

export function calculateEarthquakeRisk(input: EarthquakeRiskInput): EarthquakeRiskResult {
  const hazard = calculateHazardLayer(input);
  const soil = calculateSoilLayer(input);
  const liquefaction = calculateLiquefactionLayer(input);
  const structural = calculateStructuralLayer(input);

  const total = round(
    hazard.score * WEIGHTS.hazard +
      soil.score * WEIGHTS.soil +
      liquefaction.score * WEIGHTS.liquefaction +
      structural.score * WEIGHTS.structural,
  );

  return {
    totalScore: total,
    hazard,
    soil,
    liquefaction,
    structural,
    contributions: [
      {
        key: "hazard",
        label: "Fay + PGA",
        score: hazard.score,
        weightPct: round(WEIGHTS.hazard * 100),
        contributionPts: round(hazard.score * WEIGHTS.hazard),
      },
      {
        key: "soil",
        label: "Zemin sınıfı",
        score: soil.score,
        weightPct: round(WEIGHTS.soil * 100),
        contributionPts: round(soil.score * WEIGHTS.soil),
      },
      {
        key: "liquefaction",
        label: "Sıvılaşma",
        score: liquefaction.score,
        weightPct: round(WEIGHTS.liquefaction * 100),
        contributionPts: round(liquefaction.score * WEIGHTS.liquefaction),
      },
      {
        key: "structural",
        label: "Yapısal uygunluk",
        score: structural.score,
        weightPct: round(WEIGHTS.structural * 100),
        contributionPts: round(structural.score * WEIGHTS.structural),
      },
    ],
    interpretation: interpret(total),
    disclaimer:
      "Demo veri / ön analiz. Kesin değerlendirme için lisanslı jeoloji ve inşaat mühendisleri tarafından zemin etüdü, TBDY proje kontrolü ve yerinde inceleme zorunludur.",
  };
}
