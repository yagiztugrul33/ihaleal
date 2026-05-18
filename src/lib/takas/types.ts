import type {
  InstantOfferResult,
  IBuyerApplicationPayload,
  LegalRiskFlags,
} from "@/lib/ibuyer/types";

export type TakasTimeline = "URGENT" | "M3" | "M6" | "FLEXIBLE";

export const TAKAS_TIMELINE_LABELS: Record<TakasTimeline, string> = {
  URGENT: "Acil (1 ay içinde)",
  M3: "3 ay içinde",
  M6: "6 ay içinde",
  FLEXIBLE: "Esnek (planlama aşaması)",
};

export type TakasPropertyType = "konut" | "ticari" | "arsa" | "ofis" | "depo" | "villa";

export const TAKAS_PROPERTY_LABELS: Record<TakasPropertyType, string> = {
  konut: "Konut",
  ticari: "Ticari",
  arsa: "Arsa",
  ofis: "Ofis",
  depo: "Depo",
  villa: "Villa",
};

export type TakasRooms = "1+0" | "1+1" | "2+1" | "3+1" | "4+1" | "5+";

export type TakasApplicationPayload = IBuyerApplicationPayload & {
  // Required for takas (overrides iBuyer optional)
  desiredCity: string;
  desiredDistrict?: string;
  desiredPropertyType?: TakasPropertyType;
  desiredBudgetTry: number;
  desiredMinM2?: number;
  desiredMaxM2?: number;
  desiredRooms?: TakasRooms;
  timeline: TakasTimeline;
};

export type TakasResult = InstantOfferResult & {
  matchPreviewScore?: number;
};

export type TakasFormState = {
  // Given property
  city: string;
  district: string;
  address: string;
  parcelNo: string;
  grossM2: string;
  marketValueTry: string;
  propertyType: TakasPropertyType;
  contactPhone: string;
  contactEmail: string;
  legalFlags: LegalRiskFlags;
  // Desired
  desiredCity: string;
  desiredDistrict: string;
  desiredPropertyType: TakasPropertyType;
  desiredBudgetTry: string;
  desiredMinM2: string;
  desiredMaxM2: string;
  desiredRooms: TakasRooms | "";
  timeline: TakasTimeline;
  tradeInNotes: string;
};
