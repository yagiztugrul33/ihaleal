import type { LegalRiskFlags } from "@/lib/ibuyer/types";

export type TradeStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "LEGAL_REVIEW"
  | "COMPLETED";

export type TargetType = "REAL_ESTATE" | "VEHICLE";

export type OfferedAssetDetails = {
  titleDeedInfo?: Record<string, unknown>;
  vehicleKm?: number;
  modelYear?: number;
  make?: string;
  model?: string;
  notes?: string;
};

export type TradeOfferRow = {
  id: string;
  listing_id: string;
  proposer_id: string;
  target_type: TargetType;
  offered_listing_id: string | null;
  offered_asset_details: OfferedAssetDetails | null;
  cash_difference: number;
  currency: string;
  status: TradeStatus;
  is_legal_approved: boolean;
  is_deposit_blocked: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateTradeOfferInput = {
  listingId: string;
  targetType: TargetType;
  offeredListingId?: string;
  offeredAssetDetails?: OfferedAssetDetails;
  cashDifference?: number;
  currency?: string;
  legalFlags?: LegalRiskFlags;
  skipLegalCheck?: boolean;
};
