import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { runGesLandEvaluation } from "./feasibilityEngine";
import type { GesLandEvaluationInput, GesLandEvaluationResult } from "./types";

export type GesSubmitResult = GesLandEvaluationResult & {
  demoMode: boolean;
  persisted: boolean;
};

function toRpcPayload(input: GesLandEvaluationInput) {
  return {
    city: input.city,
    district: input.district,
    neighborhood: input.neighborhood ?? null,
    ada: input.ada ?? null,
    parcel: input.parcel ?? null,
    totalAreaM2: input.totalAreaM2,
    distanceToTrafoKm: input.distanceToTrafoKm,
    trafoName: input.trafoName ?? null,
    trafoCapacityMw: input.trafoCapacityMw ?? null,
    solarIrradianceKwh: input.solarIrradianceKwh,
    slopeDegree: input.slopeDegree,
    slopeAspect: input.slopeAspect,
    agriculturalClass: input.agriculturalClass,
    isMarginalTarimApproved: input.isMarginalTarimApproved,
    hasCadastralRoad: input.hasCadastralRoad,
    hasSitAreaConflict: input.hasSitAreaConflict,
    hasMilitaryZoneConflict: input.hasMilitaryZoneConflict,
    hasArchaeologicalSite: input.hasArchaeologicalSite ?? false,
    ownerName: input.ownerName ?? null,
    ownerEmail: input.ownerEmail ?? null,
    ownerPhone: input.ownerPhone ?? null,
  };
}

function mapRpcRow(row: Record<string, unknown>, fallback: GesLandEvaluationResult): GesSubmitResult {
  return {
    projectId: String(row.projectId ?? fallback.projectId),
    status: String(row.status ?? fallback.status) as GesSubmitResult["status"],
    gesFeasibilityScore: Number(row.gesFeasibilityScore ?? fallback.gesFeasibilityScore),
    technicalViabilityScore: Number(row.technicalViabilityScore ?? fallback.technicalViabilityScore),
    estimatedCapacityMw: Number(row.estimatedCapacityMw ?? fallback.estimatedCapacityMw),
    estimatedAnnualMwh: Number(row.estimatedAnnualMwh ?? fallback.estimatedAnnualMwh),
    estimatedCapexTry: Number(row.estimatedCapexTry ?? fallback.estimatedCapexTry),
    paybackYears: row.paybackYears != null ? Number(row.paybackYears) : null,
    hardKill: (row.hardKill as GesSubmitResult["hardKill"]) ?? fallback.hardKill,
    rejectionReason: row.rejectionReason != null ? String(row.rejectionReason) : fallback.rejectionReason,
    engineeringLog: Array.isArray(row.engineeringLog)
      ? (row.engineeringLog as string[])
      : fallback.engineeringLog,
    complianceNotes: Array.isArray(row.complianceNotes)
      ? (row.complianceNotes as string[])
      : fallback.complianceNotes,
    demoMode: false,
    persisted: true,
  };
}

function localDemoSubmit(input: GesLandEvaluationInput): GesSubmitResult {
  const result = runGesLandEvaluation(input);
  return { ...result, demoMode: true, persisted: false };
}

export async function submitGesProject(input: GesLandEvaluationInput): Promise<GesSubmitResult> {
  const local = runGesLandEvaluation(input);
  if (!isSupabaseConfigured()) {
    return { ...local, demoMode: true, persisted: false };
  }

  const { data, error } = await supabase.rpc("submit_ges_land_evaluation", {
    payload: toRpcPayload(input),
  });

  if (error) {
    console.warn("[ges-land] RPC failed, falling back to local demo:", error.message);
    return { ...local, demoMode: true, persisted: false };
  }

  const row = data as Record<string, unknown> | null;
  if (!row) {
    return { ...local, demoMode: true, persisted: false };
  }

  return mapRpcRow(row, local);
}
