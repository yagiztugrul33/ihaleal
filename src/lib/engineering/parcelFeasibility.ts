import {
  calculateParcelFeasibility as runParcelEngine,
  type ParcelInputs,
  type ParcelFeasibilityResult as ParcelEngineResult,
} from "./parcel/parcelEngineFeasibility";

export {
  calculateParcelFeasibility,
  calculateParcelEngineFeasibility,
} from "./parcel/parcelEngineFeasibility";
export type { ParcelInputs } from "./parcel/parcelEngineFeasibility";

export class ParcelValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ParcelValidationError";
    this.field = field;
  }
}

/** Legacy imar formu — ParcelIntelligencePage ve raporlar */
export type ParcelFeasibilityInput = {
  landAreaM2: number;
  emsal: number;
  taks: number;
  maxFloors: number;
  netUnitM2?: number;
  salePriceTryPerM2?: number;
  constructionCostTryPerM2?: number;
  contractorMarginPct?: number;
  contractorSharePercent?: number;
  heightLimitM?: number;
};

export type ParcelFeasibilityReport = {
  studyLabel: "ön fizibilite — manuel imar";
  maxConstructionAreaM2: number;
  footprintM2: number;
  floors: number;
  unitCount: number;
  totalSellableM2: number;
  revenueTry: number;
  costsTry: number;
  contractorProfitTry: number;
  profitMarginPct: number;
  feasibilityScore: number;
  warnings: string[];
  assumptions: string[];
  limitations: string[];
  confidence: "low" | "medium";
  engine: ParcelEngineResult;
};

/** @deprecated Use ParcelFeasibilityReport */
export type ParcelFeasibilityResult = ParcelFeasibilityReport;

function requirePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ParcelValidationError(`${name} pozitif ve sonlu olmalıdır`, name);
  }
}

function toEngineInputs(input: ParcelFeasibilityInput): ParcelInputs {
  const heightLimit =
    input.heightLimitM ?? (input.maxFloors > 0 ? input.maxFloors * 3 : undefined);

  return {
    landAreaM2: input.landAreaM2,
    emsal: input.emsal,
    taks: input.taks,
    heightLimit,
    averageUnitSizeM2: input.netUnitM2,
    contractorSharePercent:
      input.contractorSharePercent ??
      (input.contractorMarginPct != null ? 100 - input.contractorMarginPct : undefined),
    estimatedSalesPricePerM2: input.salePriceTryPerM2 ?? 45_000,
    estimatedCostPricePerM2: input.constructionCostTryPerM2 ?? 18_000,
  };
}

function mapEngineToLegacy(
  engine: ParcelEngineResult,
  input: ParcelFeasibilityInput,
): ParcelFeasibilityReport {
  const assumptions = [
    `EMSAL toplam inşaat = arazi × ${input.emsal}`,
    `TAKS taban alanı = arazi × ${input.taks}`,
    `Satılabilir brüt = EMSAL × %85 (ortak alan %15)`,
    `Net alan çarpanı = %82`,
    `Kat karşılığı müteahhit payı = %${input.contractorSharePercent ?? 50}`,
  ];

  const limitations = [
    "Belediye imar planı, ifraz/tevhit ve ruhsat süreçleri modele dahil değildir.",
    "Otopark, sığınak ve teknik hacimler özet katsayı ile tahmin edilmiştir.",
    "Ön fizibilite — bankable proforma değildir.",
  ];

  return {
    studyLabel: "ön fizibilite — manuel imar",
    maxConstructionAreaM2: engine.maxConstructionArea,
    footprintM2: engine.footprint,
    floors: engine.requiredFloors,
    unitCount: engine.estimatedUnitCount,
    totalSellableM2: engine.sellableGrossArea,
    revenueTry: engine.totalRevenue,
    costsTry: engine.totalCost,
    contractorProfitTry: engine.contractorProfit,
    profitMarginPct: engine.profitMarginPercent,
    feasibilityScore: engine.feasibilityScore,
    warnings: engine.warnings,
    assumptions,
    limitations,
    confidence: engine.isHeightLimitExceeded ? "low" : "medium",
    engine,
  };
}

/** UI/rapor uyumluluğu — yeni entegrasyonlar için `calculateParcelFeasibility(ParcelInputs)` kullanın */
export function calculateParcelFeasibilityLegacy(
  input: ParcelFeasibilityInput,
): ParcelFeasibilityReport {
  requirePositive("landAreaM2", input.landAreaM2);
  requirePositive("emsal", input.emsal);
  if (!Number.isFinite(input.taks) || input.taks <= 0 || input.taks > 1) {
    throw new ParcelValidationError("taks 0–1 arasında olmalıdır", "taks");
  }
  requirePositive("maxFloors", input.maxFloors);

  const engine = runParcelEngine(toEngineInputs(input));
  return mapEngineToLegacy(engine, input);
}
