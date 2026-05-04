/** Emlakci hak edis politikasi stub — avukat ve ledger ile baglanir */

import { REALTOR_B2B_RATE, VAT_RATE } from "@/lib/fees";

export const REFERRING_AGENT_RATE_ON_DEAL = REALTOR_B2B_RATE;
export const VAT_ON_AGENT_COMMISSION = VAT_RATE;

export type RealtorDealOrdinal = number;

export interface RealtorPayoutEligibilityInput {
  closingOrdinal: RealtorDealOrdinal;
  deedOrContractVerified: boolean;
  invoiceMatched: boolean;
  riskClearance: boolean;
}

export interface RealtorPayoutDecision {
  allowOutboundTransfer: boolean;
  retainInEscrow: boolean;
  reasonCodes: string[];
}

export const POLICY_FIRST_CLOSING_AGENT_SHARE_HELD_IN_POOL = true;
export const SUBSEQUENT_DEAL_PAYOUT_HOLD_DAYS = 30;

export function evaluateRealtorPayoutStub(input: RealtorPayoutEligibilityInput): RealtorPayoutDecision {
  const codes: string[] = [];
  if (!input.deedOrContractVerified) codes.push("DEED_OR_CONTRACT_UNVERIFIED");
  if (!input.invoiceMatched) codes.push("INVOICE_MISMATCH");
  if (!input.riskClearance) codes.push("RISK_OR_MANUAL_REVIEW");

  if (codes.length > 0) {
    return { allowOutboundTransfer: false, retainInEscrow: true, reasonCodes: codes };
  }

  if (POLICY_FIRST_CLOSING_AGENT_SHARE_HELD_IN_POOL && input.closingOrdinal === 1) {
    return {
      allowOutboundTransfer: false,
      retainInEscrow: true,
      reasonCodes: ["FIRST_CLOSING_HELD_PER_POLICY"],
    };
  }

  return {
    allowOutboundTransfer: true,
    retainInEscrow: false,
    reasonCodes: ["OK_SUBSEQUENT_OR_POLICY_DISABLED"],
  };
}

export function formatReferringAgentFeeLabel(): string {
  return "Ortak emlakci getiri payi (hedef): %" + (REFERRING_AGENT_RATE_ON_DEAL * 100).toFixed(0) + " + KDV %" + (VAT_ON_AGENT_COMMISSION * 100).toFixed(0) + " (matrah)";
}