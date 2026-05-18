export type InstantOfferStatus =
  | "PENDING"
  | "LEGAL_REVIEW"
  | "OFFER_GENERATED"
  | "REJECTED"
  | "EXPIRED"
  | "ACCEPTED";

export type IBuyerTargetOption = "CASH_ONLY" | "TRADE_IN" | "BOTH";

export type LegalRiskFlagKey =
  | "inheritance"
  | "concordat"
  | "lien"
  | "urban"
  | "arsaPayi"
  | "familySherh"
  | "veraset"
  | "imar"
  | "katMismatch";

export type LegalRiskFlags = Record<LegalRiskFlagKey, boolean>;

export const LEGAL_RISK_FLAG_LABELS: Record<LegalRiskFlagKey, string> = {
  inheritance: "Veraset / intikal süreci",
  concordat: "Konkordato",
  lien: "İpotek / haciz",
  urban: "Kentsel dönüşüm alanı",
  arsaPayi: "Arsa payı uyuşmazlığı",
  familySherh: "Aile şerhi",
  veraset: "Veraset belgesi eksik",
  imar: "İmar planı sorunu",
  katMismatch: "Kat mülkiyeti uyumsuzluğu",
};

export const RISK_POINTS: Record<LegalRiskFlagKey, number> = {
  inheritance: 40,
  concordat: 35,
  lien: 25,
  urban: 15,
  arsaPayi: 20,
  familySherh: 15,
  veraset: 30,
  imar: 20,
  katMismatch: 15,
};

export type RiskBreakdownItem = {
  key: LegalRiskFlagKey;
  points: number;
};

export type PropertySubmissionInput = {
  city: string;
  district?: string;
  address?: string;
  parcelNo?: string;
  grossM2: number;
  marketValueTry: number;
  propertyType?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type TradeInInput = {
  targetOption: IBuyerTargetOption;
  desiredCity?: string;
  desiredDistrict?: string;
  desiredBudgetTry?: number;
  tradeInNotes?: string;
};

export type IBuyerApplicationPayload = PropertySubmissionInput & {
  legalFlags: LegalRiskFlags;
  targetOption?: IBuyerTargetOption;
  desiredCity?: string;
  desiredDistrict?: string;
  desiredBudgetTry?: number;
  tradeInNotes?: string;
};

export type OfferDetermination = {
  status: InstantOfferStatus;
  riskScore: number;
  breakdown: RiskBreakdownItem[];
};

export type InstantOfferResult = OfferDetermination & {
  submissionId?: string;
  offerRequestId?: string;
  offerAmountTry: number | null;
  marketValueTry: number;
  expiresAt: string | null;
  demoMode?: boolean;
};
