import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { clientLogError } from "@/lib/clientLog";
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

function mapRpcRow(
  row: Record<string, unknown>,
  payload: IBuyerApplicationPayload,
): InstantOfferResult {
  return {
    status: String(row.status ?? "PENDING") as InstantOfferResult["status"],
    riskScore: Number(row.riskScore ?? 0),
    breakdown: Array.isArray(row.riskBreakdown)
      ? (row.riskBreakdown as InstantOfferResult["breakdown"])
      : assessLegalRisk(payload.legalFlags).breakdown,
    submissionId: row.submissionId ? String(row.submissionId) : undefined,
    offerRequestId: row.offerRequestId ? String(row.offerRequestId) : undefined,
    offerAmountTry: (() => {
      if (row.offerAmountTry == null) return null;
      const n = Number(row.offerAmountTry);
      return Number.isFinite(n) ? n : null;
    })(),
    marketValueTry: (() => {
      const n = Number(row.marketValueTry ?? payload.marketValueTry);
      return Number.isFinite(n) ? n : 0;
    })(),
    expiresAt: row.expiresAt ? String(row.expiresAt) : null,
  };
}

export async function submitInstantOffer(
  payload: IBuyerApplicationPayload,
): Promise<InstantOfferResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase yapılandırması eksik. Lütfen daha sonra tekrar deneyin.");
  }

  const { data, error } = await supabase.rpc("submit_ibuyer_application", {
    payload: toRpcPayload(payload),
  });

  if (error) {
    clientLogError("ibuyer.submit_ibuyer_application", error);
    throw new Error(error.message || "Teklif gönderilemedi. Lütfen tekrar deneyin.");
  }

  if (data == null) {
    clientLogError("ibuyer.submit_ibuyer_application", new Error("empty payload"));
    throw new Error("Sunucudan boş yanıt alındı. Lütfen tekrar deneyin.");
  }

  return mapRpcRow(data as Record<string, unknown>, payload);
}
