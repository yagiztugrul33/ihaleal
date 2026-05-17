import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { calculateAutomatedOfferAmount, offerExpiresAtIso } from "./offerEngine";
import { assessLegalRisk } from "./riskAssessment";
import type { IBuyerApplicationPayload, InstantOfferResult } from "./types";

function toRpcPayload(payload: IBuyerApplicationPayload) {
  return {
    city: payload.city,
    district: payload.district ?? null,
    address: payload.address ?? null,
    parcelNo: payload.parcelNo ?? null,
    grossM2: payload.grossM2,
    marketValueTry: payload.marketValueTry,
    propertyType: payload.propertyType ?? "konut",
    contactPhone: payload.contactPhone ?? null,
    contactEmail: payload.contactEmail ?? null,
    legalFlags: payload.legalFlags,
    targetOption: payload.targetOption ?? null,
    desiredCity: payload.desiredCity ?? null,
    desiredDistrict: payload.desiredDistrict ?? null,
    desiredBudgetTry: payload.desiredBudgetTry ?? null,
    tradeInNotes: payload.tradeInNotes ?? null,
  };
}

function localDemoSubmit(payload: IBuyerApplicationPayload): InstantOfferResult {
  const assessment = assessLegalRisk(payload.legalFlags);
  const offerAmountTry =
    assessment.status === "OFFER_GENERATED"
      ? calculateAutomatedOfferAmount(payload.marketValueTry, assessment.riskScore)
      : null;
  const expiresAt =
    assessment.status === "OFFER_GENERATED" ? offerExpiresAtIso() : null;

  return {
    ...assessment,
    submissionId: `demo-${Date.now()}`,
    offerRequestId: `demo-offer-${Date.now()}`,
    offerAmountTry,
    marketValueTry: payload.marketValueTry,
    expiresAt,
    demoMode: true,
  };
}

export async function submitInstantOffer(
  payload: IBuyerApplicationPayload,
): Promise<InstantOfferResult> {
  if (!isSupabaseConfigured()) {
    return localDemoSubmit(payload);
  }

  const { data, error } = await supabase.rpc("submit_ibuyer_application", {
    payload: toRpcPayload(payload),
  });

  if (error) {
    console.warn("[ibuyer] RPC failed, falling back to local demo:", error.message);
    return localDemoSubmit(payload);
  }

  const row = data as Record<string, unknown> | null;
  if (!row) {
    return localDemoSubmit(payload);
  }

  return {
    status: String(row.status ?? "PENDING") as InstantOfferResult["status"],
    riskScore: Number(row.riskScore ?? 0),
    breakdown: Array.isArray(row.riskBreakdown)
      ? (row.riskBreakdown as InstantOfferResult["breakdown"])
      : assessLegalRisk(payload.legalFlags).breakdown,
    submissionId: row.submissionId ? String(row.submissionId) : undefined,
    offerRequestId: row.offerRequestId ? String(row.offerRequestId) : undefined,
    offerAmountTry:
      row.offerAmountTry != null ? Number(row.offerAmountTry) : null,
    marketValueTry: Number(row.marketValueTry ?? payload.marketValueTry),
    expiresAt: row.expiresAt ? String(row.expiresAt) : null,
    demoMode: false,
  };
}
