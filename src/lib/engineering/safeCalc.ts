import {
  calculateGesEngineFeasibility,
  GesEngineValidationError,
  type GesEngineInputs,
  type GesEngineResult,
} from "./ges/gesEngineFeasibility";
import {
  calculateParcelFeasibility,
  type ParcelInputs,
  type ParcelFeasibilityResult,
} from "./parcel/parcelEngineFeasibility";
import {
  calculateGesFeasibility,
  GesValidationError,
  type GesFeasibilityInput,
  type GesFeasibilityResult,
} from "./gesEngine";

export const PRE_FEASIBILITY_LABEL = "On Fizibilite (Pre-Feasibility)" as const;
export const PRE_FEASIBILITY_DISCLAIMER_TR =
  "Kesinlikle yatirim tavsiyesi degildir. Girdilere dayali on fizibilitedir.";

export function sanitizeFinite(value: number | null | undefined, fallback = 0): number {
  if (value == null || !Number.isFinite(value) || Number.isNaN(value)) return fallback;
  return value;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(sanitizeFinite(n))));
}

function sanitizeGesEngineResult(result: GesEngineResult): GesEngineResult {
  return {
    ...result,
    usableAreaM2: sanitizeFinite(result.usableAreaM2),
    panelCount: Math.max(0, Math.floor(sanitizeFinite(result.panelCount))),
    dcCapacityKwp: sanitizeFinite(result.dcCapacityKwp),
    annualProductionKwh: sanitizeFinite(result.annualProductionKwh),
    monthlyProductionKwh: result.monthlyProductionKwh.map((v) => sanitizeFinite(v)),
    capacityFactor: sanitizeFinite(result.capacityFactor),
    degradationEffect: sanitizeFinite(result.degradationEffect),
    yearlyCashFlow: result.yearlyCashFlow.map((v) => sanitizeFinite(v)),
    npmResult:
      result.npmResult == null || !Number.isFinite(result.npmResult) ? null : sanitizeFinite(result.npmResult),
    npv: sanitizeFinite(result.npv),
    irr:
      result.irr == null || !Number.isFinite(result.irr) || Number.isNaN(result.irr) ? null : sanitizeFinite(result.irr),
    lcoe: sanitizeFinite(result.lcoe),
    simpleRoi: sanitizeFinite(result.simpleRoi),
    paybackYear: sanitizeFinite(result.paybackYear),
    suitabilityScore: clampScore(result.suitabilityScore),
    investmentScore: clampScore(result.investmentScore),
    riskScore: clampScore(result.riskScore),
  };
}

export function safeCalculateGesEngineFeasibility(inputs: GesEngineInputs): GesEngineResult {
  try {
    return sanitizeGesEngineResult(calculateGesEngineFeasibility(inputs));
  } catch (e) {
    const reason = e instanceof GesEngineValidationError ? e.message : "GES hesaplamasi basarisiz.";
    return sanitizeGesEngineResult({
      usableAreaM2: 0,
      panelCount: 0,
      dcCapacityKwp: 0,
      annualProductionKwh: 0,
      monthlyProductionKwh: Array(12).fill(0),
      capacityFactor: 0,
      degradationEffect: 0,
      yearlyCashFlow: [],
      npmResult: null,
      npv: 0,
      irr: null,
      lcoe: 0,
      simpleRoi: 0,
      paybackYear: 0,
      suitabilityScore: 0,
      investmentScore: 0,
      riskScore: 100,
      confidence: "LOW",
      assumptions: [],
      limitations: [reason, PRE_FEASIBILITY_DISCLAIMER_TR],
      formulaTrace: {},
    });
  }
}

function sanitizeGesLegacyResult(result: GesFeasibilityResult): GesFeasibilityResult {
  return {
    ...result,
    annualProductionKwh: sanitizeFinite(result.annualProductionKwh),
    npvTry: sanitizeFinite(result.npvTry),
    irrPct: result.irrPct == null || !Number.isFinite(result.irrPct) ? null : sanitizeFinite(result.irrPct),
    lcoeTryPerKwh: sanitizeFinite(result.lcoeTryPerKwh),
    suitabilityScore: clampScore(result.suitabilityScore),
    investmentScore: clampScore(result.investmentScore),
    riskScore: clampScore(result.riskScore),
    paybackYear: result.paybackYear == null || !Number.isFinite(result.paybackYear) ? null : sanitizeFinite(result.paybackYear),
  };
}

export function safeCalculateGesFeasibility(input: GesFeasibilityInput): GesFeasibilityResult {
  try {
    return sanitizeGesLegacyResult(calculateGesFeasibility(input));
  } catch (e) {
    const reason = e instanceof GesValidationError ? e.message : "GES hesaplamasi basarisiz.";
    return sanitizeGesLegacyResult({
      studyLabel: "ön fizibilite",
      dataSource: "ghi_annual_fallback",
      annualProductionKwh: 0,
      npvTry: 0,
      irrPct: null,
      lcoeTryPerKwh: 0,
      suitabilityScore: 0,
      investmentScore: 0,
      riskScore: 100,
      paybackYear: null,
      bankable: false,
      usableAreaM2: 0,
      panelCount: 0,
      dcCapacityKwp: 0,
      monthlyProductionKwh: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      capacityFactor: 0,
      degradationPctPerYear: 0,
      yearlyCashFlow: [],
      simpleRoiPct: 0,
      confidence: "low",
      assumptions: [],
      limitations: [reason, PRE_FEASIBILITY_DISCLAIMER_TR],
      formulaTrace: [],
    });
  }
}

function sanitizeParcelResult(result: ParcelFeasibilityResult): ParcelFeasibilityResult {
  return {
    ...result,
    maxConstructionArea: sanitizeFinite(result.maxConstructionArea),
    footprint: sanitizeFinite(result.footprint),
    requiredFloors: Math.max(0, Math.floor(sanitizeFinite(result.requiredFloors))),
    sellableGrossArea: sanitizeFinite(result.sellableGrossArea),
    netArea: sanitizeFinite(result.netArea),
    estimatedUnitCount: Math.max(0, Math.floor(sanitizeFinite(result.estimatedUnitCount))),
    parkingSpotsRequired: Math.max(0, Math.floor(sanitizeFinite(result.parkingSpotsRequired))),
    technicalAreaM2: sanitizeFinite(result.technicalAreaM2),
    bunkerAreaM2: sanitizeFinite(result.bunkerAreaM2),
    landownerShareM2: sanitizeFinite(result.landownerShareM2),
    contractorShareM2: sanitizeFinite(result.contractorShareM2),
    totalRevenue: sanitizeFinite(result.totalRevenue),
    totalCost: sanitizeFinite(result.totalCost),
    contractorProfit: sanitizeFinite(result.contractorProfit),
    profitMarginPercent: sanitizeFinite(result.profitMarginPercent),
    feasibilityScore: clampScore(result.feasibilityScore),
  };
}

export function safeCalculateParcelFeasibility(inputs: ParcelInputs): ParcelFeasibilityResult {
  try {
    return sanitizeParcelResult(calculateParcelFeasibility(inputs));
  } catch {
    return sanitizeParcelResult({
      maxConstructionArea: 0,
      footprint: 0,
      requiredFloors: 0,
      isHeightLimitExceeded: false,
      sellableGrossArea: 0,
      netArea: 0,
      estimatedUnitCount: 0,
      parkingSpotsRequired: 0,
      technicalAreaM2: 0,
      bunkerAreaM2: 0,
      landownerShareM2: 0,
      contractorShareM2: 0,
      totalRevenue: 0,
      totalCost: 0,
      contractorProfit: 0,
      profitMarginPercent: 0,
      feasibilityScore: 0,
      warnings: [PRE_FEASIBILITY_DISCLAIMER_TR],
    });
  }
}

export function safeAutomatedOfferAmount(marketValueTry: number, riskScore: number): number | null {
  try {
    if (!Number.isFinite(marketValueTry) || marketValueTry <= 0) return null;
    const score = sanitizeFinite(riskScore, 0);
    const raw = marketValueTry * 0.82 - marketValueTry * (score / 100) * 0.15;
    if (!Number.isFinite(raw) || Number.isNaN(raw)) return null;
    return Math.round(raw * 100) / 100;
  } catch {
    return null;
  }
}