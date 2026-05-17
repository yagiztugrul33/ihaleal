/**
 * GES arazi muhendislik + mevzuat motoru.
 * Hard-kill: SIT/askeri, mutlak tarim, kadastro yolu yok.
 * Skor: trafo mesafesi, egim/yon, GEPA onay, trafo kapasitesi.
 */
import {
  CAPEX_TRY_PER_MW,
  DEFAULT_ELECTRICITY_PRICE_TRY,
  M2_PER_MW_FIXED,
  type GesHardKillReason,
  type GesLandEvaluationInput,
  type GesLandEvaluationResult,
  type GesProjectStatus,
  type GesSlopeAspect,
} from "./types";

export class GesLandValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GesLandValidationError";
  }
}

function assertFinitePositive(name: string, v: number): void {
  if (!Number.isFinite(v) || v <= 0) {
    throw new GesLandValidationError(`${name} pozitif ve sonlu olmalidir`);
  }
}

function assertFiniteNonNegative(name: string, v: number): void {
  if (!Number.isFinite(v) || v < 0) {
    throw new GesLandValidationError(`${name} negatif olamaz`);
  }
}

/** Hard-kill — EPDK/Tarim Bakanligi cercevesinde otomatik teknik red */
export function evaluateHardKill(input: GesLandEvaluationInput): {
  kill: GesHardKillReason;
  reason: string | null;
} {
  if (input.hasSitAreaConflict || input.hasMilitaryZoneConflict || input.hasArchaeologicalSite) {
    return {
      kill: "SIT_OR_MILITARY",
      reason:
        "Mevzuat Engeli: SIT alani, arkeolojik sit veya askeri yasak bolge tespiti — GES kurulumu teknik olarak uygun degildir.",
    };
  }
  if (
    input.agriculturalClass === "MUTLAK" ||
    (input.agriculturalClass !== "MARGINAL" && !input.isMarginalTarimApproved)
  ) {
    return {
      kill: "ABSOLUTE_AGRICULTURE",
      reason:
        "Mevzuat Engeli: Mutlak Tarim Arazisi sinifi veya marjinal tarim onayi eksikligi (5403 sayili Kanun cercevesi).",
    };
  }
  if (!input.hasCadastralRoad) {
    return {
      kill: "NO_CADASTRAL_ROAD",
      reason:
        "Kadastro yolu bulunmuyor — panel lojistigi ve agir ekipman erisimi icin resmi yol sartlanamiyor.",
    };
  }
  return { kill: null, reason: null };
}

function slopeAspectPenalty(aspect: GesSlopeAspect, slopeDeg: number): number {
  if (aspect === "NORTH" && slopeDeg > 15) return 20;
  if (aspect === "NORTH") return 10;
  if (slopeDeg > 25) return 15;
  if (aspect === "SOUTH") return -8;
  return 0;
}

/** 0–100 GES fizibilite skoru */
export function calculateGesFeasibilityScore(input: GesLandEvaluationInput, capacityMw: number): number {
  let score = 100;
  if (input.distanceToTrafoKm > 10) score -= 25;
  else if (input.distanceToTrafoKm > 5) score -= 10;
  score -= slopeAspectPenalty(input.slopeAspect, input.slopeDegree);
  const trafoCap = input.trafoCapacityMw ?? capacityMw;
  if (trafoCap < capacityMw) score -= 15;
  if (input.solarIrradianceKwh >= 1700) score += 5;
  if (input.agriculturalClass === "MARGINAL" && input.isMarginalTarimApproved) score += 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function estimateCapacityMw(totalAreaM2: number): number {
  return Math.round((totalAreaM2 / M2_PER_MW_FIXED) * 1000) / 1000;
}

/** Yillik MWh ~ kapasite * CF * 8760 */
export function estimateAnnualMwh(capacityMw: number, irradianceKwhM2: number): number {
  const capacityFactor = Math.min(0.28, Math.max(0.14, (irradianceKwhM2 / 2000) * 0.22));
  return Math.round(capacityMw * capacityFactor * 8760 * 10) / 10;
}

export function estimateCapexTry(capacityMw: number, distanceToTrafoKm: number): number {
  const gridPenalty = distanceToTrafoKm > 10 ? 1.12 : distanceToTrafoKm > 5 ? 1.06 : 1;
  return Math.round(capacityMw * CAPEX_TRY_PER_MW * gridPenalty);
}

export function estimatePaybackYears(
  capexTry: number,
  annualMwh: number,
  priceTryPerKwh = DEFAULT_ELECTRICITY_PRICE_TRY,
): number | null {
  const annualRevenue = annualMwh * 1000 * priceTryPerKwh;
  if (annualRevenue <= 0) return null;
  const years = capexTry / annualRevenue;
  return Number.isFinite(years) ? Math.round(years * 10) / 10 : null;
}

function resolveStatus(score: number, killed: boolean): GesProjectStatus {
  if (killed) return "TECHNICAL_REJECTION";
  if (score >= 75) return "HIGH_VIABILITY";
  return "ENGINEERING_CALCULATION";
}

export function runGesLandEvaluation(input: GesLandEvaluationInput): GesLandEvaluationResult {
  assertFinitePositive("totalAreaM2", input.totalAreaM2);
  assertFiniteNonNegative("distanceToTrafoKm", input.distanceToTrafoKm);
  assertFinitePositive("solarIrradianceKwh", input.solarIrradianceKwh);
  assertFiniteNonNegative("slopeDegree", input.slopeDegree);

  if (!input.city.trim() || !input.district.trim()) {
    throw new GesLandValidationError("Il ve ilce zorunludur");
  }

  const log: string[] = [];
  log.push(
    `[Muhendislik] Tahmini kurulu guc: ${estimateCapacityMw(input.totalAreaM2)} MW (${M2_PER_MW_FIXED} m2/MW sabit sistem).`,
  );

  const { kill, reason } = evaluateHardKill(input);
  const capacityMw = estimateCapacityMw(input.totalAreaM2);
  let score = calculateGesFeasibilityScore(input, capacityMw);
  if (kill) score = Math.min(score, 25);

  const status = resolveStatus(score, kill !== null);
  const annualMwh = estimateAnnualMwh(capacityMw, input.solarIrradianceKwh);
  const capex = estimateCapexTry(capacityMw, input.distanceToTrafoKm);
  const payback = estimatePaybackYears(capex, annualMwh);

  if (input.distanceToTrafoKm > 10) {
    log.push("[TEIAS] Trafo mesafesi >10 km — baglanti maliyeti ve kayip primi uygulandi.");
  }
  if (input.slopeAspect === "SOUTH") {
    log.push("[GEPA] Guney egimli arazi — isinim verimliligi premium.");
  }

  const complianceNotes: string[] = [
    "Bu cikti on fizibilite niteligindedir; EPDK lisans, TEIAS baglanti anlasmasi ve TEDAS dagitim onaylari ayrica gereklidir.",
    "Resmi GEPA/Tarim sinifi dogrulamasi yerel kurum kayitlari ile teyit edilmelidir.",
  ];

  return {
    projectId: crypto.randomUUID(),
    status,
    gesFeasibilityScore: score,
    technicalViabilityScore: score,
    estimatedCapacityMw: capacityMw,
    estimatedAnnualMwh: annualMwh,
    estimatedCapexTry: capex,
    paybackYears: payback,
    hardKill: kill,
    rejectionReason: reason,
    engineeringLog: log,
    complianceNotes,
  };
}
