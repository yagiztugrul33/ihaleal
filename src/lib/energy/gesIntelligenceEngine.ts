import { safeCalculateGesFeasibility, type GesFeasibilityResult } from "@/lib/engineering";

export interface GesIntelligenceInput {
  landAreaM2: number;
  dcCapacityKwp: number;
  annualGhiKwhM2: number;
  slopePercent: number;
  transformerDistanceKm: number;
  zoningPermitted: boolean;
  electricityPriceTryPerKwh: number;
  capexTryPerKwp: number;
  annualOpexTry: number;
  discountRatePct: number;
}

export interface GesLayer {
  score: number;
  note: string;
}

export interface GesContribution {
  key: "solar" | "siting" | "financial" | "regulatory";
  label: string;
  score: number;
  weightPct: number;
  contributionPts: number;
}

export interface GesIntelligenceResult {
  overallScore: number;
  solar: GesLayer;
  siting: GesLayer;
  financial: GesLayer;
  regulatory: GesLayer;
  contributions: GesContribution[];
  feasibility: GesFeasibilityResult;
  interpretation: string;
  disclaimer: string;
}

const WEIGHTS = {
  solar: 0.32,
  siting: 0.24,
  financial: 0.3,
  regulatory: 0.14,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateSolarLayer(input: GesIntelligenceInput, annualProductionKwh: number): GesLayer {
  const ghiScore = clamp((input.annualGhiKwhM2 - 1100) / 9, 0, 100);
  const capacityRatio = annualProductionKwh / Math.max(1, input.dcCapacityKwp);
  const productionScore = clamp((capacityRatio - 1000) / 9.5, 0, 100);
  const densityMw = (input.landAreaM2 / 1000) / 10;
  const scaleFit = densityMw >= 0.9 && densityMw <= 1.5 ? 88 : densityMw < 0.9 ? 62 : 74;
  const score = clamp(ghiScore * 0.45 + productionScore * 0.35 + scaleFit * 0.2, 0, 100);
  return {
    score: round(score),
    note: "Demo veri / ön analiz: GHI, üretim yoğunluğu ve 10 dönüm ≈ 1 MWp ölçek kuralı birlikte değerlendirildi.",
  };
}

export function calculateSitingLayer(input: GesIntelligenceInput): GesLayer {
  const slopePenalty = input.slopePercent <= 5 ? 0 : input.slopePercent <= 10 ? 8 : input.slopePercent <= 15 ? 18 : 30;
  const transformerPenalty = input.transformerDistanceKm <= 2 ? 0 : input.transformerDistanceKm <= 5 ? 12 : input.transformerDistanceKm <= 9 ? 24 : 36;
  const zoningPenalty = input.zoningPermitted ? 0 : 34;
  const score = clamp(100 - slopePenalty - transformerPenalty - zoningPenalty, 0, 100);
  return {
    score: round(score),
    note: "Demo veri / ön analiz: eğim, trafo/şebeke mesafesi ve imar uygunluğu siting katmanında puanlandı.",
  };
}

export function calculateFinancialLayer(feasibility: GesFeasibilityResult): GesLayer {
  const npvScore = feasibility.npvTry > 0 ? clamp(Math.log10(Math.max(10_000, feasibility.npvTry)) * 16, 42, 100) : 18;
  const irrScore = feasibility.irrPct == null ? 22 : clamp(feasibility.irrPct * 4.4, 0, 100);
  const lcoeScore = clamp(100 - feasibility.lcoeTryPerKwh * 22, 0, 100);
  const paybackScore = feasibility.paybackYear == null ? 20 : clamp(100 - (feasibility.paybackYear - 3) * 13, 0, 100);
  const score = clamp(npvScore * 0.32 + irrScore * 0.28 + lcoeScore * 0.2 + paybackScore * 0.2, 0, 100);
  return {
    score: round(score),
    note: "Demo veri / ön analiz: NPV, IRR, LCOE ve geri ödeme süresi ile finansal katman skoru üretildi.",
  };
}

export function calculateRegulatoryLayer(input: GesIntelligenceInput): GesLayer {
  const capMw = input.dcCapacityKwp / 1000;
  const licenseBonus = capMw <= 5 ? 16 : -14;
  const vatBonus = 10;
  const nettingBonus = 8;
  const zoning = input.zoningPermitted ? 14 : -12;
  const base = 64;
  const score = clamp(base + licenseBonus + vatBonus + nettingBonus + zoning, 0, 100);
  return {
    score: round(score),
    note: "Demo veri / ön analiz: TR mevzuat katmanı (5 MW lisanssız, 5.1.h, saatlik mahsuplaşma, %1 KDV) referans alındı.",
  };
}

function interpretation(score: number): string {
  if (score >= 80) return "Güçlü fizibilite bandı: yine de bankable etüt ve lisanslı mühendis onayı gerekir.";
  if (score >= 65) return "Orta-iyi band: trafo ve imar teyidiyle yatırım komitesi değerlendirmesine uygundur.";
  if (score >= 50) return "Sınır bandı: CAPEX ve şebeke koşulları revize edilmeden karar verilmemelidir.";
  return "Düşük uygunluk bandı: saha/şebeke/finans koşulları yeniden modellenmelidir.";
}

export function calculateGesIntelligence(input: GesIntelligenceInput): GesIntelligenceResult {
  const feasibility = safeCalculateGesFeasibility({
    landAreaM2: input.landAreaM2,
    dcCapacityKwp: input.dcCapacityKwp,
    annualGhiKwhM2: input.annualGhiKwhM2,
    electricityPriceTryPerKwh: input.electricityPriceTryPerKwh,
    capexTryPerKwp: input.capexTryPerKwp,
    annualOpexTry: input.annualOpexTry,
    discountRatePct: input.discountRatePct,
    projectYears: 25,
  });

  const solar = calculateSolarLayer(input, feasibility.annualProductionKwh);
  const siting = calculateSitingLayer(input);
  const financial = calculateFinancialLayer(feasibility);
  const regulatory = calculateRegulatoryLayer(input);

  const overall = round(
    solar.score * WEIGHTS.solar +
      siting.score * WEIGHTS.siting +
      financial.score * WEIGHTS.financial +
      regulatory.score * WEIGHTS.regulatory,
  );

  return {
    overallScore: overall,
    solar,
    siting,
    financial,
    regulatory,
    contributions: [
      { key: "solar", label: "Solar fizibilite", score: solar.score, weightPct: round(WEIGHTS.solar * 100), contributionPts: round(solar.score * WEIGHTS.solar) },
      { key: "siting", label: "Siting", score: siting.score, weightPct: round(WEIGHTS.siting * 100), contributionPts: round(siting.score * WEIGHTS.siting) },
      { key: "financial", label: "Finansal", score: financial.score, weightPct: round(WEIGHTS.financial * 100), contributionPts: round(financial.score * WEIGHTS.financial) },
      { key: "regulatory", label: "Mevzuat", score: regulatory.score, weightPct: round(WEIGHTS.regulatory * 100), contributionPts: round(regulatory.score * WEIGHTS.regulatory) },
    ],
    feasibility,
    interpretation: interpretation(overall),
    disclaimer:
      "Demo veri / ön analiz. Çıktı bankable fizibilite değildir; lisanslı elektrik/enerji mühendisliği, şebeke görüşü ve resmi izin süreçleri zorunludur.",
  };
}
