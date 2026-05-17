import { isPvgisSolarResponse, normalizePvgisMonthly, type PvgisSolarResponse } from "@/lib/data/pvgisTypes";
import {
  DEFAULT_DEGRADATION_PCT_YEAR,
  DEFAULT_PERFORMANCE_RATIO,
  HOURS_PER_YEAR,
} from "./ges/constants";
import { irrBisection, lcoe, npv } from "./ges/financial";

export class GesValidationError extends Error {
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "GesValidationError";
    this.field = field;
  }
}

const FALLBACK_MONTHLY_SHAPE = [
  0.055, 0.065, 0.085, 0.095, 0.105, 0.11, 0.115, 0.105, 0.095, 0.08, 0.055, 0.05,
] as const;

const STUDY_LABEL = "ön fizibilite" as const;

export type GesFeasibilityInput = {
  landAreaM2: number;
  dcCapacityKwp?: number;
  panelWp?: number;
  panelAreaM2?: number;
  landUseFactor?: number;
  annualGhiKwhM2: number;
  pvgis?: PvgisSolarResponse | null;
  performanceRatio?: number;
  electricityPriceTryPerKwh: number;
  capexTryPerKwp: number;
  annualOpexTry: number;
  discountRatePct: number;
  projectYears?: number;
  degradationPctPerYear?: number;
};

export type FormulaTraceStep = {
  label: string;
  formula: string;
  result: number;
  unit?: string;
};

export type GesFeasibilityResult = {
  studyLabel: typeof STUDY_LABEL;
  bankable: false;
  dataSource: "pvgis_monthly" | "ghi_annual_fallback";
  usableAreaM2: number;
  panelCount: number;
  dcCapacityKwp: number;
  annualProductionKwh: number;
  monthlyProductionKwh: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  capacityFactor: number;
  degradationPctPerYear: number;
  yearlyCashFlow: number[];
  npvTry: number;
  irrPct: number | null;
  lcoeTryPerKwh: number;
  simpleRoiPct: number;
  paybackYear: number | null;
  suitabilityScore: number;
  investmentScore: number;
  riskScore: number;
  confidence: "high" | "medium" | "low";
  assumptions: string[];
  limitations: string[];
  formulaTrace: FormulaTraceStep[];
};

function requirePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new GesValidationError(`${name} pozitif ve sonlu olmalıdır`, name);
  }
}

function requireNonNegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new GesValidationError(`${name} negatif olamaz`, name);
  }
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function assertOutputFinite(result: GesFeasibilityResult): void {
  const nums: number[] = [
    result.usableAreaM2,
    result.panelCount,
    result.dcCapacityKwp,
    result.annualProductionKwh,
    ...result.monthlyProductionKwh,
    result.capacityFactor,
    result.degradationPctPerYear,
    result.npvTry,
    result.lcoeTryPerKwh,
    result.simpleRoiPct,
    result.suitabilityScore,
    result.investmentScore,
    result.riskScore,
    ...result.yearlyCashFlow,
  ];
  if (result.irrPct != null) nums.push(result.irrPct);
  if (result.paybackYear != null) nums.push(result.paybackYear);
  for (const v of nums) {
    if (!Number.isFinite(v)) {
      throw new Error("GES çıktısında sonlu olmayan değer");
    }
  }
}

function tuple12(monthly: number[]): GesFeasibilityResult["monthlyProductionKwh"] {
  return monthly as GesFeasibilityResult["monthlyProductionKwh"];
}

export function calculateGesFeasibility(input: GesFeasibilityInput): GesFeasibilityResult {
  requirePositive("landAreaM2", input.landAreaM2);
  requirePositive("annualGhiKwhM2", input.annualGhiKwhM2);
  requireNonNegative("electricityPriceTryPerKwh", input.electricityPriceTryPerKwh);
  requirePositive("capexTryPerKwp", input.capexTryPerKwp);
  requireNonNegative("annualOpexTry", input.annualOpexTry);
  requirePositive("discountRatePct", input.discountRatePct);

  if (input.pvgis != null && !isPvgisSolarResponse(input.pvgis)) {
    throw new GesValidationError("pvgis geçersiz yanıt", "pvgis");
  }

  const landUseFactor = input.landUseFactor ?? 0.65;
  if (!Number.isFinite(landUseFactor) || landUseFactor <= 0 || landUseFactor > 1) {
    throw new GesValidationError("landUseFactor 0–1 arasında olmalıdır", "landUseFactor");
  }

  const panelWp = input.panelWp ?? 550;
  const panelAreaM2 = input.panelAreaM2 ?? 2.2;
  const pr = input.performanceRatio ?? DEFAULT_PERFORMANCE_RATIO;
  const degradationPctPerYear = input.degradationPctPerYear ?? DEFAULT_DEGRADATION_PCT_YEAR;
  const projectYears = input.projectYears ?? 25;
  const discountRate = input.discountRatePct / 100;
  const formulaTrace: FormulaTraceStep[] = [];

  const usableAreaM2 = input.landAreaM2 * landUseFactor;
  let panelCount = Math.max(1, Math.floor(usableAreaM2 / panelAreaM2));
  let dcCapacityKwp = input.dcCapacityKwp ?? (panelCount * panelWp) / 1000;

  if (input.dcCapacityKwp != null) {
    requirePositive("dcCapacityKwp", input.dcCapacityKwp);
    dcCapacityKwp = input.dcCapacityKwp;
    panelCount = Math.max(1, Math.round((dcCapacityKwp * 1000) / panelWp));
  }

  let dataSource: GesFeasibilityResult["dataSource"] = "ghi_annual_fallback";
  let monthlyIrradiation: number[];

  if (input.pvgis?.monthlyIrradiationKwhM2?.length === 12) {
    monthlyIrradiation = normalizePvgisMonthly(input.pvgis.monthlyIrradiationKwhM2);
    dataSource = "pvgis_monthly";
  } else {
    const annual = input.pvgis?.annualIrradiationKwhM2 ?? input.annualGhiKwhM2;
    monthlyIrradiation = FALLBACK_MONTHLY_SHAPE.map((w) => w * annual);
    dataSource = "ghi_annual_fallback";
  }

  const monthlyProduction = monthlyIrradiation.map((irr) => dcCapacityKwp * irr * pr);
  formulaTrace.push({
    label: "Aylık üretim",
    formula: "E_m = P_dc[kWp] × H_m[kWh/m²] × PR",
    result: monthlyProduction.reduce((a, b) => a + b, 0) / 12,
    unit: "kWh/ay (ortalama)",
  });

  const annualProductionKwh = monthlyProduction.reduce((a, b) => a + b, 0);
  const acKw = dcCapacityKwp * 0.95;
  const capacityFactor = annualProductionKwh / (acKw * HOURS_PER_YEAR);

  const d = degradationPctPerYear / 100;
  const annualEnergyByYear: number[] = [];
  for (let y = 1; y <= projectYears; y++) {
    annualEnergyByYear.push(annualProductionKwh * Math.pow(1 - d, y - 1));
  }

  const capexTry = dcCapacityKwp * input.capexTryPerKwp;
  const yearlyCashFlow: number[] = [];
  let totalNet = -capexTry;
  for (let y = 1; y <= projectYears; y++) {
    const revenue = annualEnergyByYear[y - 1] * input.electricityPriceTryPerKwh;
    const net = revenue - input.annualOpexTry;
    yearlyCashFlow.push(net);
    totalNet += net;
  }

  const npvTry = npv(capexTry, yearlyCashFlow, discountRate);
  const irrDec = irrBisection(capexTry, yearlyCashFlow);
  const irrPct = irrDec != null ? irrDec * 100 : null;
  const opexSeries = Array(projectYears).fill(input.annualOpexTry);
  const lcoeTryPerKwh = lcoe(capexTry, opexSeries, annualEnergyByYear, discountRate);

  let paybackYear: number | null = null;
  let cum = -capexTry;
  for (let y = 1; y <= projectYears; y++) {
    cum += yearlyCashFlow[y - 1];
    if (cum >= 0) {
      paybackYear = y;
      break;
    }
  }

  const simpleRoiPct = capexTry > 0 ? (totalNet / capexTry) * 100 : 0;

  const suitabilityScore = clampScore(
    (input.annualGhiKwhM2 / 20) * 10 + capacityFactor * 120 + (dataSource === "pvgis_monthly" ? 10 : 0),
  );
  const investmentScore = clampScore(
    (irrPct ?? 0) * 1.5 + (npvTry > 0 ? 30 : 0) + Math.min(25, simpleRoiPct / 4),
  );
  const riskScore = clampScore(
    100 -
      suitabilityScore * 0.35 -
      investmentScore * 0.35 -
      (dataSource === "pvgis_monthly" ? 15 : 0),
  );

  const confidence: GesFeasibilityResult["confidence"] =
    dataSource === "pvgis_monthly" ? "medium" : "low";

  const assumptions = [
    `Kullanılabilir alan = arazi × ${(landUseFactor * 100).toFixed(0)}%`,
    `PR = ${(pr * 100).toFixed(1)}% (IEC kayıp yığını özeti)`,
    `Yıllık bozulma = %${degradationPctPerYear}`,
    "Elektrik fiyatı sabit; enflasyon/PPA indekslemesi yok",
    STUDY_LABEL,
  ];

  const limitations = [
    "Bu çıktı bankable fizibilite değildir; ön fizibilite seviyesindedir.",
    "Vergi, kaldıraç, curtailment ve şebeke bağlantı maliyeti modelde yoktur.",
    dataSource === "ghi_annual_fallback"
      ? "PVGIS aylık veri yok — mevsimsel profil GHI üzerinden dağıtıldı."
      : "PVGIS aylık ışınım ile üretim hesaplandı; saatlik simülasyon yok.",
    "Yatırım tavsiyesi değildir.",
  ];

  const result: GesFeasibilityResult = {
    studyLabel: STUDY_LABEL,
    bankable: false,
    dataSource,
    usableAreaM2,
    panelCount,
    dcCapacityKwp,
    annualProductionKwh,
    monthlyProductionKwh: tuple12(monthlyProduction),
    capacityFactor,
    degradationPctPerYear,
    yearlyCashFlow,
    npvTry,
    irrPct,
    lcoeTryPerKwh: Number.isFinite(lcoeTryPerKwh) ? lcoeTryPerKwh : 0,
    simpleRoiPct,
    paybackYear,
    suitabilityScore,
    investmentScore,
    riskScore,
    confidence,
    assumptions,
    limitations,
    formulaTrace,
  };

  assertOutputFinite(result);
  return result;
}
