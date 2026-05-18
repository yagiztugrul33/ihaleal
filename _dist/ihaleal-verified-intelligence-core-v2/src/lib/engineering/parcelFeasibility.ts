export class ParcelValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ParcelValidationError";
    this.field = field;
  }
}

export type ParcelFeasibilityInput = {
  landAreaM2: number;
  emsal: number;
  taks: number;
  maxFloors: number;
  netUnitM2?: number;
  salePriceTryPerM2?: number;
  constructionCostTryPerM2?: number;
  contractorMarginPct?: number;
};

export type ParcelFeasibilityResult = {
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
};

function requirePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ParcelValidationError(`${name} pozitif ve sonlu olmalıdır`, name);
  }
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function assertFiniteResult(r: ParcelFeasibilityResult): void {
  const nums = [
    r.maxConstructionAreaM2,
    r.footprintM2,
    r.floors,
    r.unitCount,
    r.totalSellableM2,
    r.revenueTry,
    r.costsTry,
    r.contractorProfitTry,
    r.profitMarginPct,
    r.feasibilityScore,
  ];
  for (const v of nums) {
    if (!Number.isFinite(v)) throw new Error("Parsel çıktısında sonlu olmayan değer");
  }
}

export function calculateParcelFeasibility(
  input: ParcelFeasibilityInput,
): ParcelFeasibilityResult {
  requirePositive("landAreaM2", input.landAreaM2);
  requirePositive("emsal", input.emsal);
  if (!Number.isFinite(input.taks) || input.taks <= 0 || input.taks > 1) {
    throw new ParcelValidationError("taks 0–1 arasında olmalıdır", "taks");
  }
  requirePositive("maxFloors", input.maxFloors);

  const netUnitM2 = input.netUnitM2 ?? 95;
  const salePrice = input.salePriceTryPerM2 ?? 45_000;
  const constructionCost = input.constructionCostTryPerM2 ?? 18_000;
  const contractorMarginPct = input.contractorMarginPct ?? 12;

  const maxConstructionAreaM2 = input.landAreaM2 * input.emsal;
  const footprintM2 = input.landAreaM2 * input.taks;
  const floorsFromArea =
    footprintM2 > 0 ? Math.max(1, Math.floor(maxConstructionAreaM2 / footprintM2)) : 1;
  const floors = Math.min(input.maxFloors, floorsFromArea);

  const grossBuiltM2 = footprintM2 * floors;
  const efficiency = 0.82;
  const totalSellableM2 = grossBuiltM2 * efficiency;
  const unitCount = Math.max(0, Math.floor(totalSellableM2 / netUnitM2));

  const revenueTry = totalSellableM2 * salePrice;
  const directCost = grossBuiltM2 * constructionCost;
  const contractorProfitTry = directCost * (contractorMarginPct / 100);
  const costsTry = directCost + contractorProfitTry;
  const profit = revenueTry - costsTry;
  const profitMarginPct = revenueTry > 0 ? (profit / revenueTry) * 100 : 0;

  const feasibilityScore = clampScore(
    profitMarginPct * 1.2 + Math.min(30, unitCount / 5) + Math.min(20, input.emsal * 8),
  );

  const warnings: string[] = [
    "Manuel imar girdileri (EMSAL/TAKS) resmi imar planı yerine geçmez.",
    "Ön fizibilite — yatırım tavsiyesi değildir.",
  ];
  if (floors < input.maxFloors) {
    warnings.push("Taban alanı EMSAL kotasını sınırlıyor; kat adedi düşürüldü.");
  }
  if (unitCount === 0) {
    warnings.push("Satılabilir birim sayısı sıfır — girdileri gözden geçirin.");
  }

  const assumptions = [
    `EMSAL toplam inşaat = arazi × ${input.emsal}`,
    `TAKS taban alanı = arazi × ${input.taks}`,
    `Net verimlilik = %${(efficiency * 100).toFixed(0)}`,
    `Birim net alan = ${netUnitM2} m²`,
  ];

  const limitations = [
    "Belediye imar planı, ifraz/tevhit ve ruhsat süreçleri modele dahil değildir.",
    "Finansman, KDV, hakediş ve pazarlama maliyetleri basitleştirilmiştir.",
    "ön fizibilite — bankable proforma değildir.",
  ];

  const result: ParcelFeasibilityResult = {
    studyLabel: "ön fizibilite — manuel imar",
    maxConstructionAreaM2,
    footprintM2,
    floors,
    unitCount,
    totalSellableM2,
    revenueTry,
    costsTry,
    contractorProfitTry,
    profitMarginPct,
    feasibilityScore,
    warnings,
    assumptions,
    limitations,
    confidence: "low",
  };

  assertFiniteResult(result);
  return result;
}
