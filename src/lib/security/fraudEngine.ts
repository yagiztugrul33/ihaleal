/**
 * Submission fraud / tampering guard — routes suspicious payloads to manual review.
 */

export type FraudAuditInput = {
  landAreaM2?: number;
  grossAreaM2?: number;
  emsal?: number;
  taks?: number;
  marketValueTry?: number;
  estimatedSalesPricePerM2?: number;
  estimatedCostPricePerM2?: number;
  userId?: string;
  source?: string;
};

export type FraudAuditResult = {
  blocked: boolean;
  manualReview: boolean;
  flags: string[];
  severity: "low" | "medium" | "high" | "critical";
};

const MAX_LAND_M2 = 5_000_000;
const MAX_EMSAL = 3.5;
const MAX_TAKS = 1;
const MAX_TRY = 50_000_000_000;

function isBadNumber(v: unknown): boolean {
  return typeof v !== "number" || !Number.isFinite(v) || Number.isNaN(v);
}

export function auditSubmissionData(input: FraudAuditInput): FraudAuditResult {
  const flags: string[] = [];

  if (isBadNumber(input.landAreaM2) && input.landAreaM2 !== undefined) {
    flags.push("INVALID_LAND_AREA");
  }
  if (isBadNumber(input.grossAreaM2) && input.grossAreaM2 !== undefined) {
    flags.push("INVALID_GROSS_AREA");
  }
  if (isBadNumber(input.emsal) && input.emsal !== undefined) {
    flags.push("INVALID_EMSAL");
  }
  if (isBadNumber(input.taks) && input.taks !== undefined) {
    flags.push("INVALID_TAKS");
  }

  const land = input.landAreaM2 ?? input.grossAreaM2;
  if (land != null && Number.isFinite(land)) {
    if (land <= 0) flags.push("NON_POSITIVE_LAND_AREA");
    if (land > MAX_LAND_M2) flags.push("LAND_AREA_EXCEEDS_CAP");
  }

  if (input.emsal != null && Number.isFinite(input.emsal)) {
    if (input.emsal <= 0) flags.push("NON_POSITIVE_EMSAL");
    if (input.emsal > MAX_EMSAL) flags.push("EMSAL_MANIPULATION_SUSPECTED");
  }

  if (input.taks != null && Number.isFinite(input.taks)) {
    if (input.taks <= 0 || input.taks > MAX_TAKS) flags.push("TAKS_OUT_OF_RANGE");
  }

  for (const price of [
    input.marketValueTry,
    input.estimatedSalesPricePerM2,
    input.estimatedCostPricePerM2,
  ]) {
    if (price != null && Number.isFinite(price) && (price < 0 || price > MAX_TRY)) {
      flags.push("PRICE_OUT_OF_RANGE");
      break;
    }
  }

  if (input.emsal != null && input.taks != null && input.emsal > 0 && input.taks > 0) {
    if (input.emsal / input.taks > 12) flags.push("EMSAL_TAKS_RATIO_IMPLAUSIBLE");
  }

  const critical = flags.some((f) =>
    ["EMSAL_MANIPULATION_SUSPECTED", "LAND_AREA_EXCEEDS_CAP", "INVALID_EMSAL"].includes(f),
  );
  const manualReview =
    flags.length > 0 ||
    critical ||
    (input.emsal != null && input.emsal > 2.5) ||
    (land != null && land > 500_000);

  const blocked =
    critical ||
    flags.includes("LAND_AREA_EXCEEDS_CAP") ||
    flags.includes("EMSAL_MANIPULATION_SUSPECTED");

  let severity: FraudAuditResult["severity"] = "low";
  if (blocked) severity = "critical";
  else if (critical) severity = "high";
  else if (manualReview) severity = "medium";

  return { blocked, manualReview, flags, severity };
}