import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { CreateTradeOfferInput, TradeOfferRow } from "./tradeOfferTypes";

function mapRow(row: Record<string, unknown>): TradeOfferRow {
  return {
    id: String(row.id),
    listing_id: String(row.listing_id),
    proposer_id: String(row.proposer_id),
    target_type: row.target_type as TradeOfferRow["target_type"],
    offered_listing_id: row.offered_listing_id ? String(row.offered_listing_id) : null,
    offered_asset_details: (row.offered_asset_details as TradeOfferRow["offered_asset_details"]) ?? null,
    cash_difference: Number(row.cash_difference ?? 0),
    currency: String(row.currency ?? "TRY"),
    status: row.status as TradeOfferRow["status"],
    is_legal_approved: Boolean(row.is_legal_approved),
    is_deposit_blocked: Boolean(row.is_deposit_blocked),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function assertSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase yapılandırması eksik.");
  }
}

export async function createTradeOffer(input: CreateTradeOfferInput): Promise<TradeOfferRow> {
  assertSupabase();

  const { data, error } = await supabase.rpc("create_trade_offer", {
    payload: {
      listingId: input.listingId,
      targetType: input.targetType,
      offeredListingId: input.offeredListingId ?? null,
      offeredAssetDetails: input.offeredAssetDetails ?? null,
      cashDifference: input.cashDifference ?? 0,
      currency: input.currency ?? "TRY",
      legalFlags: input.legalFlags ?? {},
      skipLegalCheck: input.skipLegalCheck ?? false,
    },
  });

  if (error) {
    throw new Error(error.message || "Takas teklifi oluşturulamadı.");
  }

  return mapRow(data as Record<string, unknown>);
}

export async function respondTradeOffer(offerId: string, accept: boolean): Promise<TradeOfferRow> {
  assertSupabase();

  const { data, error } = await supabase.rpc("respond_trade_offer", {
    p_offer_id: offerId,
    p_accept: accept,
  });

  if (error) {
    throw new Error(error.message || "Takas teklifi yanıtlanamadı.");
  }

  return mapRow(data as Record<string, unknown>);
}

export async function cancelTradeOffer(offerId: string): Promise<TradeOfferRow> {
  assertSupabase();

  const { data, error } = await supabase.rpc("cancel_trade_offer", {
    p_offer_id: offerId,
  });

  if (error) {
    throw new Error(error.message || "Takas teklifi iptal edilemedi.");
  }

  return mapRow(data as Record<string, unknown>);
}
