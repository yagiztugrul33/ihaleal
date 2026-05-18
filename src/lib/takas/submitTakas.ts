import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { assessLegalRisk } from "@/lib/ibuyer/riskAssessment";
import type { InstantOfferResult } from "@/lib/ibuyer/types";
import type { TakasApplicationPayload, TakasResult } from "./types";
import { previewMatchScore } from "./matchEngine";

function toRpcPayload(payload: TakasApplicationPayload) {
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
    // Backend forces targetOption to TRADE_IN, but we still send it.
    targetOption: "TRADE_IN" as const,
    desiredCity: payload.desiredCity,
    desiredDistrict: payload.desiredDistrict ?? null,
    desiredPropertyType: payload.desiredPropertyType ?? null,
    desiredBudgetTry: payload.desiredBudgetTry,
    desiredMinM2: payload.desiredMinM2 ?? null,
    desiredMaxM2: payload.desiredMaxM2 ?? null,
    desiredRooms: payload.desiredRooms ?? null,
    timeline: payload.timeline,
    tradeInNotes: payload.tradeInNotes ?? null,
  };
}

function mapRpcRow(
  row: Record<string, unknown>,
  payload: TakasApplicationPayload,
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

export async function submitTakas(
  payload: TakasApplicationPayload,
): Promise<TakasResult> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase yapılandırması eksik. Lütfen daha sonra tekrar deneyin.",
    );
  }

  const { data, error } = await supabase.rpc("submit_takas_application", {
    payload: toRpcPayload(payload),
  });

  if (error) {
    console.error("[takas] submit_takas_application failed:", error);
    throw new Error(
      error.message || "Takas başvurusu gönderilemedi. Lütfen tekrar deneyin.",
    );
  }

  if (data == null) {
    console.error("[takas] submit_takas_application returned empty payload");
    throw new Error("Sunucudan boş yanıt alındı. Lütfen tekrar deneyin.");
  }

  const base = mapRpcRow(data as Record<string, unknown>, payload);
  return {
    ...base,
    matchPreviewScore: previewMatchScore(payload),
  };
}
