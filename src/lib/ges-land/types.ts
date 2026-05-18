/** GES Analiz ve Arazi Degerlendirme — domain types (EPDK/TEIAS on fizibilite) */
export type GesProjectStatus =
  | "DATA_COLLECTION"
  | "ENGINEERING_CALCULATION"
  | "HIGH_VIABILITY"
  | "TECHNICAL_REJECTION"
  | "SUBMITTED_TO_INVESTORS";

export type GesAgriculturalClass = "MARGINAL" | "NORMAL" | "MUTLAK" | "UNKNOWN";

export type GesSlopeAspect = "SOUTH" | "NORTH" | "EAST" | "WEST" | "FLAT" | "MIXED";

export type GesLandEvaluationInput = {
  city: string;
  district: string;
  neighborhood?: string;
  ada?: string;
  parcel?: string;
  totalAreaM2: number;
  distanceToTrafoKm: number;
  trafoName?: string;
  trafoCapacityMw?: number;
  solarIrradianceKwh: number;
  slopeDegree: number;
  slopeAspect: GesSlopeAspect;
  agriculturalClass: GesAgriculturalClass;
  isMarginalTarimApproved: boolean;
  hasCadastralRoad: boolean;
  hasSitAreaConflict: boolean;
  hasMilitaryZoneConflict: boolean;
  hasArchaeologicalSite?: boolean;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
};

export type GesHardKillReason =
  | "SIT_OR_MILITARY"
  | "ABSOLUTE_AGRICULTURE"
  | "NO_CADASTRAL_ROAD"
  | null;

export type GesLandEvaluationResult = {
  projectId: string;
  status: GesProjectStatus;
  gesFeasibilityScore: number;
  technicalViabilityScore: number;
  estimatedCapacityMw: number;
  estimatedAnnualMwh: number;
  estimatedCapexTry: number;
  paybackYears: number | null;
  hardKill: GesHardKillReason;
  rejectionReason: string | null;
  engineeringLog: string[];
  complianceNotes: string[];
};

export const M2_PER_MW_FIXED = 15_000;
export const CAPEX_TRY_PER_MW = 13_500_000;
export const DEFAULT_ELECTRICITY_PRICE_TRY = 2.6;
