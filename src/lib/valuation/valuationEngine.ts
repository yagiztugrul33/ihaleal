import { getCityByKey, type CityKey, type TransactionType } from "./regionalPriceData";

export type PropertyCondition = "new" | "good" | "needs_renovation";

export interface ValuationInput {
  city: CityKey;
  district?: string;
  grossM2: number;
  buildingAge: number;
  transactionType: TransactionType;
  condition: PropertyCondition;
  hasElevator: boolean;
  hasParking: boolean;
}

export interface ValuationResult {
  estimatedValue: number;
  minValue: number;
  maxValue: number;
  unitPrice: number;
  confidence: "medium" | "high";
  note: string;
}

const CONDITION_FACTORS: Record<PropertyCondition, number> = {
  new: 1.08,
  good: 1,
  needs_renovation: 0.9,
};

function getAgeFactor(age: number): number {
  if (age <= 0) return 1.06;
  if (age <= 5) return 1.02;
  if (age <= 10) return 0.97;
  if (age <= 15) return 0.92;
  if (age <= 20) return 0.88;
  if (age <= 30) return 0.81;
  return 0.74;
}

function roundByType(value: number, type: TransactionType): number {
  if (type === "sale") return Math.round(value / 1_000) * 1_000;
  return Math.round(value / 100) * 100;
}

export function estimatePropertyValue(input: ValuationInput): ValuationResult {
  const cityData = getCityByKey(input.city);
  if (!cityData) {
    throw new Error("Sehir bilgisi bulunamadi.");
  }

  const districtData = input.district ? cityData.districts?.[input.district] : undefined;
  const baseUnit =
    input.transactionType === "sale"
      ? districtData?.salePerM2 ?? cityData.salePerM2
      : districtData?.rentPerM2 ?? cityData.rentPerM2;

  const ageFactor = getAgeFactor(input.buildingAge);
  const conditionFactor = CONDITION_FACTORS[input.condition];
  const amenityFactor =
    (input.hasElevator ? 1.02 : 1) * (input.hasParking ? 1.03 : 1);

  const unitPrice = baseUnit * ageFactor * conditionFactor * amenityFactor;
  const estimatedRaw = unitPrice * input.grossM2;
  const confidence = districtData ? "high" : "medium";
  const variance = confidence === "high" ? 0.08 : 0.13;

  const estimatedValue = roundByType(estimatedRaw, input.transactionType);
  const minValue = roundByType(estimatedRaw * (1 - variance), input.transactionType);
  const maxValue = roundByType(estimatedRaw * (1 + variance), input.transactionType);
  const roundedUnit = roundByType(unitPrice, input.transactionType);

  return {
    estimatedValue,
    minValue,
    maxValue,
    unitPrice: roundedUnit,
    confidence,
    note: districtData
      ? "Ilce bazli referans kullanildi."
      : "Bu sehirde ilce bazli veri yok, il ortalamasi kullanildi.",
  };
}

export function formatTry(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}
