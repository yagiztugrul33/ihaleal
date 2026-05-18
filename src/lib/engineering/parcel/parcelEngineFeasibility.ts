export interface ParcelInputs {
  landAreaM2: number;
  emsal: number;
  taks: number;
  heightLimit?: number;
  averageUnitSizeM2?: number;
  contractorSharePercent?: number; // Örn: %50 Kat Karşılığı Oranı
  estimatedSalesPricePerM2: number;
  estimatedCostPricePerM2: number;
}

export interface ParcelFeasibilityResult {
  maxConstructionArea: number;
  footprint: number;
  requiredFloors: number;
  isHeightLimitExceeded: boolean;
  sellableGrossArea: number;
  netArea: number;
  estimatedUnitCount: number;
  parkingSpotsRequired: number;
  technicalAreaM2: number;
  bunkerAreaM2: number;
  landownerShareM2: number;
  contractorShareM2: number;
  totalRevenue: number;
  totalCost: number;
  contractorProfit: number;
  profitMarginPercent: number;
  feasibilityScore: number;
  warnings: string[];
}

export function calculateParcelFeasibility(inputs: ParcelInputs): ParcelFeasibilityResult {
  if (inputs.landAreaM2 <= 0 || inputs.emsal <= 0 || inputs.taks <= 0) {
    throw new Error("Geçersiz arsa parametreleri.");
  }

  const maxConstructionArea = inputs.landAreaM2 * inputs.emsal;
  const footprint = inputs.landAreaM2 * inputs.taks;
  const requiredFloors = Math.ceil(maxConstructionArea / footprint);

  const isHeightLimitExceeded = inputs.heightLimit
    ? requiredFloors * 3 > inputs.heightLimit
    : false;

  const commonAreaFactor = 0.15; // %15 Ortak Alan/Sosyal Donatı düşümü
  const sellableGrossArea = maxConstructionArea * (1 - commonAreaFactor);
  const netArea = sellableGrossArea * 0.82; // Brüt-Net çarpanı

  const avgUnitSize = inputs.averageUnitSizeM2 || 120;
  const estimatedUnitCount = Math.floor(sellableGrossArea / avgUnitSize);

  const parkingSpotsRequired = Math.ceil(estimatedUnitCount * 1.1); // Her daireye 1.1 otopark
  const technicalAreaM2 = maxConstructionArea * 0.02; // %2 Şaft ve teknik hacim
  const bunkerAreaM2 = estimatedUnitCount * 3; // Sığınak yönetmeliği projeksiyonu

  const contractorShare = inputs.contractorSharePercent || 50;
  const contractorShareM2 = sellableGrossArea * (contractorShare / 100);
  const landownerShareM2 = sellableGrossArea * (1 - contractorShare / 100);

  const totalRevenue = sellableGrossArea * inputs.estimatedSalesPricePerM2;
  const totalCost = maxConstructionArea * inputs.estimatedCostPricePerM2;
  const contractorProfit = totalRevenue * (contractorShare / 100) - totalCost;
  const profitMarginPercent = (contractorProfit / totalCost) * 100;

  const warnings: string[] = [
    "Bu rapor resmi bir imar durum belgesi (çap) değildir.",
    "Belediye, Çevre Şehircilik İl Müdürlüğü ve Kentsel Dönüşüm başkanlığı onaylarına tabi ön izlemedir.",
  ];
  if (isHeightLimitExceeded) {
    warnings.push("Hata: Girdiğiniz kat yüksekliği imar planı sınır değerini aşmaktadır.");
  }

  let feasibilityScore = 70;
  if (profitMarginPercent > 25) feasibilityScore += 20;
  if (isHeightLimitExceeded) feasibilityScore -= 40;

  return {
    maxConstructionArea,
    footprint,
    requiredFloors,
    isHeightLimitExceeded,
    sellableGrossArea,
    netArea,
    estimatedUnitCount,
    parkingSpotsRequired,
    technicalAreaM2,
    bunkerAreaM2,
    landownerShareM2,
    contractorShareM2,
    totalRevenue,
    totalCost,
    contractorProfit,
    profitMarginPercent,
    feasibilityScore: Math.min(100, Math.max(0, feasibilityScore)),
    warnings,
  };
}

/** @deprecated Use calculateParcelFeasibility */
export const calculateParcelEngineFeasibility = calculateParcelFeasibility;
