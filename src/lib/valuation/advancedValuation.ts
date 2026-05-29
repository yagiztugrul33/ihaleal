import { getCityByKey, type CityKey, type TransactionType } from "./regionalPriceData";

export type PropertyCondition = "new" | "good" | "needs_renovation";
export type HeatingType = "district" | "central" | "combi" | "underfloor" | "stove";
export type LocationTier = "prime" | "strong" | "balanced" | "emerging";

export interface ValuationInput {
  city: CityKey;
  district?: string;
  grossM2: number;
  roomCount: number;
  floor: number;
  totalFloors: number;
  buildingAge: number;
  transactionType: TransactionType;
  condition: PropertyCondition;
  heatingType: HeatingType;
  locationTier: LocationTier;
  hasElevator: boolean;
  hasParking: boolean;
}

export interface ComparableSale {
  id: string;
  city: CityKey;
  district: string;
  grossM2: number;
  roomCount: number;
  floor: number;
  buildingAge: number;
  locationTier: LocationTier;
  soldAtMonthsAgo: number;
  distanceKm: number;
  salePriceTry: number;
}

export interface ContributionRow {
  factor: string;
  label: string;
  pctImpact: number;
  tryImpact: number;
}

export interface ValuationResult {
  estimatedValue: number;
  minValue: number;
  maxValue: number;
  unitPrice: number;
  confidence: "medium" | "high";
  confidenceBandPct: number;
  confidenceScore: number;
  note: string;
  layerSummary: {
    baseUnitPrice: number;
    hedonicUnitPrice: number;
    comparableUnitPrice: number;
    spatialFactor: number;
  };
  approaches: {
    salesComparisonTry: number;
    costApproachTry: number;
    incomeApproachTry: number;
  };
  contributions: ContributionRow[];
  comparables: ComparableSale[];
  neighborhoodTrendPct: number;
}

const CONDITION_IMPACT: Record<PropertyCondition, number> = {
  new: 0.08,
  good: 0,
  needs_renovation: -0.12,
};

const HEATING_IMPACT: Record<HeatingType, number> = {
  district: 0.035,
  central: 0.02,
  combi: 0,
  underfloor: 0.045,
  stove: -0.055,
};

const LOCATION_IMPACT: Record<LocationTier, number> = {
  prime: 0.12,
  strong: 0.06,
  balanced: 0,
  emerging: -0.075,
};

const CONTRIBUTION_LABELS: Record<string, string> = {
  size: "m² etkisi",
  room: "Oda etkisi",
  floor: "Kat etkisi",
  age: "Yapı yaşı",
  location: "Konum etkisi",
  heating: "Isıtma sistemi",
  elevator: "Asansör etkisi",
  parking: "Otopark etkisi",
  condition: "Fiziksel durum",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundTry(value: number): number {
  return Math.round(value / 1_000) * 1_000;
}

function roundPct(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeDistrict(district: string): string {
  return district.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]/g, "");
}

function estimateFloorImpact(floor: number, totalFloors: number): number {
  if (totalFloors <= 0) return 0;
  const ratio = clamp(floor / totalFloors, 0, 1);
  if (ratio < 0.1) return -0.03;
  if (ratio < 0.35) return 0.005;
  if (ratio < 0.75) return 0.018;
  if (ratio < 0.95) return 0.01;
  return -0.02;
}

function estimateAgeImpact(age: number): number {
  if (age <= 1) return 0.025;
  if (age <= 5) return 0.01;
  if (age <= 10) return -0.015;
  if (age <= 20) return -0.045;
  if (age <= 30) return -0.09;
  return -0.14;
}

function estimateSizeImpact(grossM2: number): number {
  const ratio = Math.max(grossM2, 25) / 100;
  return clamp(Math.log(ratio) * 0.34, -0.2, 0.25);
}

function estimateRoomImpact(roomCount: number): number {
  return clamp((roomCount - 3) * 0.032, -0.11, 0.12);
}

export function calculateHedonicLayer(input: ValuationInput, baseUnitPrice: number): {
  unitPrice: number;
  totalImpact: number;
  contributions: ContributionRow[];
} {
  const rawEffects: Record<string, number> = {
    size: estimateSizeImpact(input.grossM2),
    room: estimateRoomImpact(input.roomCount),
    floor: estimateFloorImpact(input.floor, input.totalFloors),
    age: estimateAgeImpact(input.buildingAge),
    location: LOCATION_IMPACT[input.locationTier],
    heating: HEATING_IMPACT[input.heatingType],
    elevator: input.hasElevator ? 0.018 : -0.01,
    parking: input.hasParking ? 0.024 : -0.008,
    condition: CONDITION_IMPACT[input.condition],
  };

  const totalImpact = clamp(
    Object.values(rawEffects).reduce((acc, item) => acc + item, 0),
    -0.45,
    0.55,
  );
  const unitPrice = baseUnitPrice * (1 + totalImpact);
  const contributions = Object.entries(rawEffects)
    .map(([factor, impact]) => ({
      factor,
      label: CONTRIBUTION_LABELS[factor] ?? factor,
      pctImpact: roundPct(impact * 100),
      tryImpact: roundTry(baseUnitPrice * impact * input.grossM2),
    }))
    .sort((a, b) => Math.abs(b.pctImpact) - Math.abs(a.pctImpact));

  return {
    unitPrice,
    totalImpact,
    contributions,
  };
}

function compareSimilarity(target: ValuationInput, item: ComparableSale): number {
  const m2Penalty = Math.abs(item.grossM2 - target.grossM2) / Math.max(1, target.grossM2);
  const roomPenalty = Math.min(1, Math.abs(item.roomCount - target.roomCount) * 0.18);
  const agePenalty = Math.min(1, Math.abs(item.buildingAge - target.buildingAge) / 40);
  const floorPenalty = Math.min(1, Math.abs(item.floor - target.floor) / Math.max(1, target.totalFloors));
  const distancePenalty = Math.min(1, item.distanceKm / 3.5);
  const recencyPenalty = Math.min(1, item.soldAtMonthsAgo / 18);
  const locationPenalty = item.locationTier === target.locationTier ? 0 : 0.1;

  const score = 1 - (m2Penalty * 0.24 + roomPenalty * 0.16 + agePenalty * 0.18 + floorPenalty * 0.1 + distancePenalty * 0.18 + recencyPenalty * 0.1 + locationPenalty * 0.04);
  return clamp(score, 0.05, 1);
}

function adjustComparableUnit(target: ValuationInput, item: ComparableSale): number {
  const itemUnit = item.salePriceTry / Math.max(1, item.grossM2);
  const m2Adj = (target.grossM2 - item.grossM2) / Math.max(1, item.grossM2) * 0.18;
  const ageAdj = (item.buildingAge - target.buildingAge) * 0.0032;
  const roomAdj = (target.roomCount - item.roomCount) * 0.018;
  const floorAdj = (target.floor - item.floor) * 0.003;
  const locationAdj = (LOCATION_IMPACT[target.locationTier] - LOCATION_IMPACT[item.locationTier]) * 0.4;
  const recencyAdj = -Math.min(0.05, item.soldAtMonthsAgo * 0.0018);

  const combinedAdj = clamp(m2Adj + ageAdj + roomAdj + floorAdj + locationAdj + recencyAdj, -0.2, 0.22);
  return itemUnit * (1 + combinedAdj);
}

function defaultComparables(input: ValuationInput, anchorUnitPrice: number): ComparableSale[] {
  const district = input.district || "Merkez";
  const anchors = [
    { m2: input.grossM2 - 8, room: input.roomCount, age: input.buildingAge + 2, floor: Math.max(1, input.floor - 1), dist: 0.25, month: 2, loc: input.locationTier, ratio: 0.97 },
    { m2: input.grossM2 + 6, room: input.roomCount + 1, age: Math.max(0, input.buildingAge - 3), floor: input.floor, dist: 0.42, month: 4, loc: "strong" as LocationTier, ratio: 1.03 },
    { m2: input.grossM2 - 14, room: Math.max(1, input.roomCount - 1), age: input.buildingAge + 4, floor: Math.max(1, input.floor - 2), dist: 0.58, month: 6, loc: "balanced" as LocationTier, ratio: 0.93 },
    { m2: input.grossM2 + 11, room: input.roomCount, age: Math.max(0, input.buildingAge - 1), floor: Math.min(input.totalFloors, input.floor + 1), dist: 0.83, month: 7, loc: input.locationTier, ratio: 1.06 },
    { m2: input.grossM2 + 3, room: input.roomCount, age: input.buildingAge + 1, floor: input.floor, dist: 1.1, month: 8, loc: "balanced" as LocationTier, ratio: 1.01 },
    { m2: input.grossM2 - 5, room: input.roomCount, age: input.buildingAge + 6, floor: Math.max(1, input.floor - 1), dist: 1.35, month: 10, loc: "emerging" as LocationTier, ratio: 0.9 },
    { m2: input.grossM2 + 16, room: input.roomCount + 1, age: Math.max(0, input.buildingAge - 5), floor: input.floor + 2, dist: 1.75, month: 11, loc: "strong" as LocationTier, ratio: 1.08 },
    { m2: input.grossM2 - 9, room: Math.max(1, input.roomCount - 1), age: input.buildingAge + 8, floor: Math.max(1, input.floor - 2), dist: 2.1, month: 14, loc: "balanced" as LocationTier, ratio: 0.88 },
  ];

  return anchors.map((anchor, index) => ({
    id: `cmp-${index + 1}`,
    city: input.city,
    district,
    grossM2: Math.max(35, Math.round(anchor.m2)),
    roomCount: Math.max(1, anchor.room),
    floor: Math.max(1, anchor.floor),
    buildingAge: Math.max(0, Math.round(anchor.age)),
    locationTier: anchor.loc,
    soldAtMonthsAgo: anchor.month,
    distanceKm: anchor.dist,
    salePriceTry: roundTry(anchorUnitPrice * Math.max(35, anchor.m2) * anchor.ratio),
  }));
}

export function buildComparableUniverse(input: ValuationInput): ComparableSale[] {
  const city = getCityByKey(input.city);
  if (!city) return [];
  const district = input.district && city.districts?.[input.district] ? city.districts[input.district] : undefined;
  const anchorUnitPrice = district?.salePerM2 ?? city.salePerM2;
  return defaultComparables(input, anchorUnitPrice);
}

export function calculateComparableLayer(input: ValuationInput, comparables: ComparableSale[]): {
  unitPrice: number;
  matched: ComparableSale[];
  sampleDispersion: number;
} {
  const scored = comparables
    .map((item) => {
      const similarity = compareSimilarity(input, item);
      const adjustedUnit = adjustComparableUnit(input, item);
      return { item, similarity, adjustedUnit };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 14);

  const totalWeight = scored.reduce((acc, row) => acc + row.similarity, 0) || 1;
  const weightedUnit = scored.reduce((acc, row) => acc + row.adjustedUnit * row.similarity, 0) / totalWeight;
  const weightedMean = weightedUnit;
  const variance = scored.reduce((acc, row) => acc + row.similarity * (row.adjustedUnit - weightedMean) ** 2, 0) / totalWeight;
  const std = Math.sqrt(Math.max(0, variance));
  const sampleDispersion = weightedMean > 0 ? std / weightedMean : 0;

  return {
    unitPrice: weightedUnit,
    matched: scored.map((x) => x.item),
    sampleDispersion,
  };
}

export function calculateSpatialAdjustment(input: ValuationInput): {
  factor: number;
  neighborhoodTrendPct: number;
} {
  const city = getCityByKey(input.city);
  if (!city?.districts || !input.district || !city.districts[input.district]) {
    return { factor: 1, neighborhoodTrendPct: 0 };
  }

  const targetUnit = city.districts[input.district].salePerM2;
  const neighbors = Object.entries(city.districts)
    .filter(([districtName]) => normalizeDistrict(districtName) !== normalizeDistrict(input.district || ""))
    .map(([districtName, row]) => {
      const syntheticDistance = clamp(Math.abs(row.salePerM2 - targetUnit) / Math.max(1, targetUnit) * 4, 0.45, 3.5);
      return {
        districtName,
        unitPrice: row.salePerM2,
        weight: 1 / syntheticDistance,
      };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  if (!neighbors.length) {
    return { factor: 1, neighborhoodTrendPct: 0 };
  }

  const sumWeight = neighbors.reduce((acc, row) => acc + row.weight, 0);
  const weightedNeighborUnit = neighbors.reduce((acc, row) => acc + row.unitPrice * row.weight, 0) / sumWeight;
  const ratio = weightedNeighborUnit / targetUnit;
  const neighborhoodTrendPct = roundPct((ratio - 1) * 100);
  const factor = clamp(1 + (ratio - 1) * 0.32, 0.9, 1.12);

  return {
    factor,
    neighborhoodTrendPct,
  };
}

export function buildConfidenceInterval(centerValue: number, sampleDispersion: number, sampleCount: number): {
  minValue: number;
  maxValue: number;
  confidenceBandPct: number;
  confidence: "medium" | "high";
  confidenceScore: number;
} {
  const countPenalty = sampleCount >= 12 ? 0 : (12 - sampleCount) * 0.0065;
  const variabilityPenalty = clamp(sampleDispersion * 0.65, 0, 0.08);
  const band = clamp(0.06 + variabilityPenalty + countPenalty, 0.06, 0.18);
  const confidenceScore = clamp(Math.round((1 - band) * 115), 62, 95);
  const confidence = confidenceScore >= 82 ? "high" : "medium";
  return {
    minValue: roundTry(centerValue * (1 - band)),
    maxValue: roundTry(centerValue * (1 + band)),
    confidenceBandPct: roundPct(band * 100),
    confidence,
    confidenceScore,
  };
}

function deriveCostApproach(value: number, input: ValuationInput): number {
  const replacementConstruction = input.grossM2 * 18_500;
  const ageDepreciation = clamp(input.buildingAge * 0.012, 0, 0.45);
  const landShare = value * 0.42;
  const constructionAfterWear = replacementConstruction * (1 - ageDepreciation);
  return roundTry(landShare + constructionAfterWear);
}

function deriveIncomeApproach(input: ValuationInput, citySaleValue: number): number {
  const city = getCityByKey(input.city);
  const districtRent = input.district ? city?.districts?.[input.district]?.rentPerM2 : undefined;
  const unitRent = districtRent ?? city?.rentPerM2 ?? 0;
  const annualRent = unitRent * input.grossM2 * 12;
  const capRate = input.locationTier === "prime" ? 0.042 : input.locationTier === "strong" ? 0.048 : 0.055;
  const incomeValue = annualRent / capRate;
  const blended = incomeValue * 0.8 + citySaleValue * 0.2;
  return roundTry(blended);
}

export function runAdvancedValuation(input: ValuationInput): ValuationResult {
  const city = getCityByKey(input.city);
  if (!city) {
    throw new Error("Sehir bilgisi bulunamadi.");
  }

  const districtRow = input.district ? city.districts?.[input.district] : undefined;
  const baseUnitPrice = (input.transactionType === "sale" ? districtRow?.salePerM2 : districtRow?.rentPerM2) ?? (input.transactionType === "sale" ? city.salePerM2 : city.rentPerM2);

  const hedonic = calculateHedonicLayer(input, baseUnitPrice);
  const comparableUniverse = buildComparableUniverse(input);
  const comparableLayer = calculateComparableLayer(input, comparableUniverse);
  const spatial = calculateSpatialAdjustment(input);

  const blendedUnit = hedonic.unitPrice * 0.45 + comparableLayer.unitPrice * 0.45 + baseUnitPrice * 0.1;
  const finalUnit = blendedUnit * spatial.factor;
  const estimatedRaw = finalUnit * input.grossM2;
  const estimatedValue = roundTry(estimatedRaw);

  const interval = buildConfidenceInterval(estimatedValue, comparableLayer.sampleDispersion, comparableLayer.matched.length);
  const salesComparisonTry = roundTry(comparableLayer.unitPrice * input.grossM2);
  const costApproachTry = deriveCostApproach(estimatedValue, input);
  const incomeApproachTry = deriveIncomeApproach(input, estimatedValue);

  return {
    estimatedValue,
    minValue: interval.minValue,
    maxValue: interval.maxValue,
    unitPrice: roundTry(finalUnit),
    confidence: interval.confidence,
    confidenceBandPct: interval.confidenceBandPct,
    confidenceScore: interval.confidenceScore,
    note: districtRow
      ? "Demo veri / ön analiz: ilçe bazlı hedonik + emsal + mekansal düzeltme birlikte kullanıldı."
      : "Demo veri / ön analiz: il bazlı referansla model çalıştı, ilçe verisi bulunamadı.",
    layerSummary: {
      baseUnitPrice: roundTry(baseUnitPrice),
      hedonicUnitPrice: roundTry(hedonic.unitPrice),
      comparableUnitPrice: roundTry(comparableLayer.unitPrice),
      spatialFactor: roundPct(spatial.factor),
    },
    approaches: {
      salesComparisonTry,
      costApproachTry,
      incomeApproachTry,
    },
    contributions: hedonic.contributions,
    comparables: comparableLayer.matched,
    neighborhoodTrendPct: spatial.neighborhoodTrendPct,
  };
}
