import type { TargetType } from "./tradeOfferTypes";

/** Asset class on a listing used for mutual trade compatibility. */
export type TradeListingType = TargetType;

/**
 * Trade preferences for matchmaker (subset of listing / body JSON).
 * Populate from `listings.body.trade` or defaults when creating offers.
 */
export type TradeMatchListing = {
  type: TradeListingType;
  wantsTrade?: boolean;
  acceptedTradeTypes?: TradeListingType[];
  acceptsVehicleTrade?: boolean;
  acceptsRealEstateTrade?: boolean;
  city?: string | null;
  district?: string | null;
  desiredCity?: string | null;
  desiredDistrict?: string | null;
};

const DEFAULT_ACCEPTS: TradeListingType[] = ["REAL_ESTATE"];

function norm(value: string | null | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase("tr");
}

export function categoryToTradeListingType(category: string | null | undefined): TradeListingType {
  const c = norm(category);
  if (c === "vehicle" || c === "arac" || c === "araç") return "VEHICLE";
  return "REAL_ESTATE";
}

/**
 * Build matchmaker input from a Supabase listing row or auction card.
 */
export function toTradeMatchListing(input: {
  category?: string | null;
  city?: string | null;
  district?: string | null;
  trade?: Partial<TradeMatchListing> | null;
}): TradeMatchListing {
  const trade = input.trade ?? {};
  return {
    type: trade.type ?? categoryToTradeListingType(input.category),
    wantsTrade: trade.wantsTrade ?? false,
    acceptedTradeTypes: trade.acceptedTradeTypes ?? DEFAULT_ACCEPTS,
    acceptsVehicleTrade: trade.acceptsVehicleTrade ?? false,
    acceptsRealEstateTrade: trade.acceptsRealEstateTrade ?? true,
    city: input.city ?? null,
    district: input.district ?? null,
    desiredCity: trade.desiredCity ?? null,
    desiredDistrict: trade.desiredDistrict ?? null,
  };
}

function listingAcceptsType(acceptor: TradeMatchListing, offeredType: TradeListingType): boolean {
  const accepted = acceptor.acceptedTradeTypes ?? [];
  if (accepted.includes(offeredType)) return true;
  if (!acceptor.wantsTrade) return false;
  if (offeredType === "VEHICLE" && acceptor.acceptsVehicleTrade) return true;
  if (offeredType === "REAL_ESTATE" && acceptor.acceptsRealEstateTrade) return true;
  return false;
}

function locationCompatible(acceptor: TradeMatchListing, offered: TradeMatchListing): boolean {
  const wantCity = acceptor.desiredCity?.trim();
  if (wantCity && norm(wantCity) !== norm(offered.city)) return false;
  const wantDistrict = acceptor.desiredDistrict?.trim();
  if (wantDistrict && norm(wantDistrict) !== norm(offered.district)) return false;
  return true;
}

/**
 * İki ilanın takas kriterlerinin karşılıklı uyumunu kontrol eder.
 * @param listingA İlk ilan (ör. teklif sahibinin mülkü)
 * @param listingB İkinci ilan (ör. hedef / talep edilen mülk)
 */
export function checkTradeMatch(listingA: TradeMatchListing, listingB: TradeMatchListing): boolean {
  const matchA =
    listingAcceptsType(listingA, listingB.type) && locationCompatible(listingA, listingB);
  const matchB =
    listingAcceptsType(listingB, listingA.type) && locationCompatible(listingB, listingA);
  return matchA && matchB;
}

/** 0–100 skor: tip uyumu + isteğe bağlı lokasyon (UI önizleme). */
export function tradeMatchScore(listingA: TradeMatchListing, listingB: TradeMatchListing): number {
  if (!checkTradeMatch(listingA, listingB)) return 0;
  let score = 60;
  if (listingA.wantsTrade) score += 10;
  if (listingB.wantsTrade) score += 10;
  if (listingA.desiredCity && norm(listingA.desiredCity) === norm(listingB.city)) score += 10;
  if (listingB.desiredCity && norm(listingB.desiredCity) === norm(listingA.city)) score += 10;
  return Math.min(100, score);
}
