import type { PvgisMonthlyData } from "@/lib/data/pvgisTypes";
import type { GesLandEvaluationInput, GesSlopeAspect } from "@/lib/ges-land/types";

export type GesEngineSlopeAspect = "SOUTH" | "NORTH" | "EAST" | "WEST";

export interface GesEngineInputs {
  totalAreaM2: number;
  /** Default 21 (N-Type premium panel) */
  efficiencyPercent?: number;
  /** Default 14 (inverter, cable, soiling losses) */
  systemLossesPercent?: number;
  distanceToTrafoKm: number;
  trafoCapacityMw: number;
  slopeDegree: number;
  slopeAspect: GesEngineSlopeAspect;
  isMarginalTarimApproved: boolean;
  hasSitAreaConflict: boolean;
  hasMilitaryZoneConflict: boolean;
  hasCadastralRoad: boolean;
  pvgisData?: PvgisMonthlyData[];
}

export const GES_ENGINE_DEFAULTS = {
  efficiencyPercent: 21,
  systemLossesPercent: 14,
} as const;

export function resolveGesEngineInputs(
  input: GesEngineInputs,
): Required<Pick<GesEngineInputs, "efficiencyPercent" | "systemLossesPercent">> &
  GesEngineInputs {
  return {
    ...input,
    efficiencyPercent: input.efficiencyPercent ?? GES_ENGINE_DEFAULTS.efficiencyPercent,
    systemLossesPercent: input.systemLossesPercent ?? GES_ENGINE_DEFAULTS.systemLossesPercent,
  };
}

function toEngineSlope(aspect: GesSlopeAspect): GesEngineSlopeAspect {
  if (aspect === "SOUTH" || aspect === "NORTH" || aspect === "EAST" || aspect === "WEST") {
    return aspect;
  }
  return "SOUTH";
}

export function gesEngineInputsFromLandEvaluation(
  input: GesLandEvaluationInput,
  pvgisData?: PvgisMonthlyData[],
): GesEngineInputs {
  return {
    totalAreaM2: input.totalAreaM2,
    distanceToTrafoKm: input.distanceToTrafoKm,
    trafoCapacityMw: input.trafoCapacityMw ?? 0,
    slopeDegree: input.slopeDegree,
    slopeAspect: toEngineSlope(input.slopeAspect),
    isMarginalTarimApproved: input.isMarginalTarimApproved,
    hasSitAreaConflict: input.hasSitAreaConflict,
    hasMilitaryZoneConflict: input.hasMilitaryZoneConflict,
    hasCadastralRoad: input.hasCadastralRoad,
    pvgisData,
  };
}