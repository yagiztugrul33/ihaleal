import type { PvgisMonthlyData } from "@/lib/data/pvgisTypes";
import { resolveGesEngineInputs, type GesEngineInputs } from "./gesEngineInputs";

export type { GesEngineInputs } from "./gesEngineInputs";

/** Turkey average monthly plane-of-array irradiation (kWh/m2) — GEPA-style fallback */
const FALLBACK_MONTHLY_IRRADIATION_KWH_M2: readonly number[] = [
  70, 85, 120, 150, 180, 210, 220, 200, 160, 110, 80, 60,
];

const M2_PER_MW = 15_000;
const USABLE_AREA_FACTOR = 0.7;
const PANEL_KWP = 0.55;
const PERFORMANCE_BRIDGE = 0.75;
const PROJECT_YEARS = 10;
const DISCOUNT_RATE = 0.08;
const DEGRADATION_PER_YEAR = 0.005;
const CAPEX_USD_PER_KWP = 850;
const ELECTRICITY_USD_PER_KWH = 0.09;
const OPEX_PCT_OF_CAPEX = 0.015;
const HOURS_PER_YEAR = 8760;

export interface GesEngineResult {
  usableAreaM2: number;
  panelCount: number;
  dcCapacityKwp: number;
  annualProductionKwh: number;
  monthlyProductionKwh: number[];
  capacityFactor: number;
  degradationEffect: number;
  yearlyCashFlow: number[];
  /** Year-1 net operating cash flow (after OPEX) */
  npmResult: number | null;
  npv: number;
  irr: number | null;
  lcoe: number;
  simpleRoi: number;
  paybackYear: number;
  suitabilityScore: number;
  investmentScore: number;
  riskScore: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  assumptions: string[];
  limitations: string[];
  formulaTrace: Record<string, string>;
}

export class GesEngineValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GesEngineValidationError";
  }
}

function calculateNPV(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce((acc, flow, t) => acc + flow / Math.pow(1 + discountRate, t), 0);
}

/** Newton-Raphson IRR; returns null if non-convergent (no NaN/Infinity leak). */
function calculateIRR(cashFlows: number[]): number | null {
  let guess = 0.1;
  const maxIterations = 100;
  const precision = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let npvVal = 0;
    let dNPV = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npvVal += cashFlows[t] / Math.pow(1 + guess, t);
      dNPV -= (t * cashFlows[t]) / Math.pow(1 + guess, t + 1);
    }
    if (Math.abs(dNPV) < precision) break;
    const nextGuess = guess - npvVal / dNPV;
    if (Math.abs(nextGuess - guess) < precision) {
      return Number.isNaN(nextGuess) || !Number.isFinite(nextGuess) ? null : nextGuess;
    }
    guess = nextGuess;
  }
  return null;
}

function monthlyIrradiation(inputs: GesEngineInputs): number[] {
  if (inputs.pvgisData?.length === 12) {
    return inputs.pvgisData.map((m: PvgisMonthlyData) => m.irradiationKwhM2);
  }
  return [...FALLBACK_MONTHLY_IRRADIATION_KWH_M2];
}

function createRejectedResult(reason: string): GesEngineResult {
  return {
    usableAreaM2: 0,
    panelCount: 0,
    dcCapacityKwp: 0,
    annualProductionKwh: 0,
    monthlyProductionKwh: Array(12).fill(0),
    capacityFactor: 0,
    degradationEffect: 0,
    yearlyCashFlow: [],
    npmResult: 0,
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
    limitations: [reason],
    formulaTrace: {},
  };
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function calculateGesEngineFeasibility(rawInputs: GesEngineInputs): GesEngineResult {
  const inputs = resolveGesEngineInputs(rawInputs);

  if (inputs.totalAreaM2 <= 0 || !Number.isFinite(inputs.totalAreaM2)) {
    throw new GesEngineValidationError("Gecersiz arsa alani girdisi.");
  }

  if (
    inputs.hasSitAreaConflict ||
    inputs.hasMilitaryZoneConflict ||
    !inputs.isMarginalTarimApproved
  ) {
    return createRejectedResult(
      "Mevzuat engeli (SIT, Askeri Alan veya Mutlak Tarim sinifi ihtilafi).",
    );
  }

  const losses = inputs.systemLossesPercent / 100;
  const lossFactor = 1 - losses;

  const usableAreaM2 = inputs.totalAreaM2 * USABLE_AREA_FACTOR;
  const dcCapacityKwp = (usableAreaM2 / M2_PER_MW) * 1000;
  const panelCount = Math.max(0, Math.floor(dcCapacityKwp / PANEL_KWP));

  const monthlyIrr = monthlyIrradiation(inputs);
  const monthlyProductionKwh = monthlyIrr.map((irr) => {
    const prod = dcCapacityKwp * PERFORMANCE_BRIDGE * irr * lossFactor;
    return !Number.isFinite(prod) || Number.isNaN(prod) ? 0 : prod;
  });

  const annualProductionKwh = monthlyProductionKwh.reduce((a, b) => a + b, 0);
  const capacityFactor =
    dcCapacityKwp > 0 ? (annualProductionKwh / (dcCapacityKwp * HOURS_PER_YEAR)) * 100 : 0;

  const initialInvestment = dcCapacityKwp * CAPEX_USD_PER_KWP;
  const yearlyCashFlow: number[] = [-initialInvestment];

  for (let year = 1; year <= PROJECT_YEARS; year++) {
    const degradation = Math.pow(1 - DEGRADATION_PER_YEAR, year - 1);
    const revenue = annualProductionKwh * degradation * ELECTRICITY_USD_PER_KWH;
    const opex = initialInvestment * OPEX_PCT_OF_CAPEX;
    yearlyCashFlow.push(revenue - opex);
  }

  const npvVal = calculateNPV(yearlyCashFlow, DISCOUNT_RATE);
  const irrVal = calculateIRR(yearlyCashFlow);
  const totalProduction10Years = annualProductionKwh * 9.5;
  const lcoeVal =
    totalProduction10Years > 0
      ? (initialInvestment + initialInvestment * OPEX_PCT_OF_CAPEX * PROJECT_YEARS) /
        totalProduction10Years
      : 0;

  const year1Net = yearlyCashFlow[1] ?? 0;
  const simpleRoi = initialInvestment > 0 ? (year1Net / initialInvestment) * 100 : 0;
  const paybackYear =
    year1Net > 0 && Number.isFinite(initialInvestment / year1Net)
      ? initialInvestment / year1Net
      : 0;

  let suitabilityScore = 100;
  if (inputs.distanceToTrafoKm > 5) suitabilityScore -= 20;
  if (inputs.slopeAspect === "NORTH") suitabilityScore -= 30;
  if (!inputs.hasCadastralRoad) suitabilityScore -= 15;
  if (inputs.trafoCapacityMw > 0 && dcCapacityKwp / 1000 > inputs.trafoCapacityMw) {
    suitabilityScore -= 25;
  }

  const dataConfidence: GesEngineResult["confidence"] =
    inputs.pvgisData?.length === 12
      ? "HIGH"
      : inputs.distanceToTrafoKm < 3
        ? "MEDIUM"
        : "LOW";

  return {
    usableAreaM2,
    panelCount,
    dcCapacityKwp,
    annualProductionKwh,
    monthlyProductionKwh,
    capacityFactor: Number.isFinite(capacityFactor) ? capacityFactor : 0,
    degradationEffect: DEGRADATION_PER_YEAR * 100,
    yearlyCashFlow,
    npmResult: Number.isFinite(year1Net) ? year1Net : null,
    npv: Number.isFinite(npvVal) ? npvVal : 0,
    irr: irrVal,
    lcoe: Number.isFinite(lcoeVal) ? lcoeVal : 0,
    simpleRoi: Number.isFinite(simpleRoi) ? simpleRoi : 0,
    paybackYear,
    suitabilityScore: clampScore(suitabilityScore),
    investmentScore: irrVal ? clampScore(irrVal * 400) : 30,
    riskScore: clampScore(inputs.distanceToTrafoKm * 8),
    confidence: dataConfidence,
    assumptions: [
      `Kullanilabilir alan = toplam alan x ${(USABLE_AREA_FACTOR * 100).toFixed(0)}%`,
      `Kurulu guc ~ ${M2_PER_MW.toLocaleString("tr-TR")} m2/MW sabiti`,
      `Panel verimi varsayimi %${inputs.efficiencyPercent} (kayip yigini %${inputs.systemLossesPercent})`,
      `Elektrik satis fiyati ${ELECTRICITY_USD_PER_KWH} USD/kWh`,
      `Yillik panel verim kaybi %${(DEGRADATION_PER_YEAR * 100).toFixed(1)}`,
    ],
    limitations: [
      "Resmi cagri mektubu ve baglanti anlasmasi yerine on kabuller kullanilmistir.",
      "On fizibilite — bankable fizibilite degildir.",
    ],
    formulaTrace: {
      dcCapacity: `Kullanilabilir Alan (${usableAreaM2.toFixed(0)} m2) / ${M2_PER_MW} m2/MW`,
      annualProduction: "Sum(Aylik Isinim x DC Guc x 0.75 x (1 - sistem kayiplari))",
    },
  };
}

/** @deprecated Use calculateGesEngineFeasibility — kept for call-site compatibility */
export const calculateGesFeasibilityFromEngine = calculateGesEngineFeasibility;