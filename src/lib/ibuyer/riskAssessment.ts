import {
  LEGAL_RISK_FLAG_LABELS,
  RISK_POINTS,
  type InstantOfferStatus,
  type LegalRiskFlagKey,
  type LegalRiskFlags,
  type OfferDetermination,
  type RiskBreakdownItem,
} from "./types";

export { LEGAL_RISK_FLAG_LABELS, RISK_POINTS };

export function calculateLegalRiskScore(flags: LegalRiskFlags): {
  score: number;
  breakdown: RiskBreakdownItem[];
} {
  const breakdown: RiskBreakdownItem[] = (Object.keys(RISK_POINTS) as LegalRiskFlagKey[]).map(
    (key) => ({
      key,
      points: flags[key] ? RISK_POINTS[key] : 0,
    }),
  );
  const score = breakdown.reduce((sum, item) => sum + item.points, 0);
  return { score, breakdown };
}

/** Mirrors SQL ibuyer_determine_status + inheritance/concordat overrides */
export function determineOfferStatus(
  flags: LegalRiskFlags,
  riskScore: number,
): InstantOfferStatus {
  if (flags.inheritance && flags.concordat) return "REJECTED";
  if (flags.inheritance || flags.concordat) return "LEGAL_REVIEW";
  if (riskScore >= 70) return "REJECTED";
  if (riskScore >= 30) return "LEGAL_REVIEW";
  return "OFFER_GENERATED";
}

export function assessLegalRisk(flags: LegalRiskFlags): OfferDetermination {
  const { score, breakdown } = calculateLegalRiskScore(flags);
  const status = determineOfferStatus(flags, score);
  return { status, riskScore: score, breakdown };
}
