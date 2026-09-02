import type { Auction, PropertyDetails } from "@/types/auction";
import { AUCTIONS } from "@/data/auctions";
import { withListingDefaults } from "@/lib/listingPolicy";
import { CATEGORY_DB_TO_UI } from "@/lib/listingCategories";

type ListingRow = {
  id: string;
  title: string;
  body: unknown;
  status: string;
  city?: string | null;
  district?: string | null;
  category?: string | null;
  start_price_try?: number | string | null;
  reserve_price_try?: number | string | null;
  buy_now_price_try?: number | string | null;
  is_featured?: boolean | null;
  featured_badge?: string | null;
  view_count?: number | null;
};

/** `listings.body` JSONB'daki düz emlak alanlarının beklenen şekli (bkz. CreateAuction.tsx baseBody). */
type BodyPropertyFields = {
  size_m2?: number;
  rooms?: string;
  bath_count?: number;
  floor?: number;
  total_floors?: number;
  year_built?: number;
};

/** `body.size_m2`/`rooms`/... düz alanlarını gerçek `PropertyDetails` şekline eşler (yoksa şablon değeri kalır). */
function propertyDetailsFromBody(
  body: BodyPropertyFields,
  fallback: PropertyDetails,
): PropertyDetails {
  const currentYear = new Date().getFullYear();
  return {
    ...fallback,
    grossSqm: body.size_m2 ?? fallback.grossSqm,
    roomCount: body.rooms ?? fallback.roomCount,
    bathroom: body.bath_count ?? fallback.bathroom,
    floor: body.floor != null ? String(body.floor) : fallback.floor,
    totalFloors: body.total_floors ?? fallback.totalFloors,
    buildingAge: body.year_built != null ? String(Math.max(0, currentYear - body.year_built)) : fallback.buildingAge,
  };
}

type DbAuctionRow = {
  id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  current_high_bid_try: number | string | null;
  listings: null | ListingRow | ListingRow[];
};

function pickListing(row: DbAuctionRow): ListingRow | null {
  const l = row.listings;
  if (!l) return null;
  return Array.isArray(l) ? l[0] ?? null : l;
}

const TEMPLATE: Auction = withListingDefaults(
  JSON.parse(JSON.stringify(AUCTIONS[0])) as Auction
);

function mapDbAuctionStatus(s: string): Auction["status"] {
  if (s === "live") return "live";
  if (s === "scheduled") return "upcoming";
  if (s === "ended" || s === "cancelled") return "ended";
  return "upcoming";
}

function parseBodyOverlay(body: unknown): Partial<Auction> {
  if (body == null) return {};
  if (typeof body === "object") return body as Partial<Auction>;
  if (typeof body === "string") {
    const t = body.trim();
    if (!t.startsWith("{")) return {};
    try {
      return JSON.parse(t) as Partial<Auction>;
    } catch {
      return {};
    }
  }
  return {};
}

/** DB satırını tam `Auction` şekline dönüştürür (şablondan doldurur). */
export function auctionFromRemoteRow(row: DbAuctionRow): Auction {
  const listing = pickListing(row);
  if (!listing) {
    return withListingDefaults({
      ...TEMPLATE,
      id: row.id,
      title: "İlan",
      endDate: new Date(row.ends_at).toISOString(),
      status: mapDbAuctionStatus(row.status),
      currentBid: Number(row.current_high_bid_try) || 0,
      startingBid: Number(row.current_high_bid_try) || 0,
    });
  }
  const title = listing.title?.trim() || "İlan";
  const rawBody = listing.body ?? null;
  const overlay = parseBodyOverlay(rawBody);
  const bodyFields = (typeof rawBody === "object" && rawBody != null ? rawBody : {}) as BodyPropertyFields;
  const high = Number(row.current_high_bid_try);
  // Gerçek başlangıç fiyatı `listings.start_price_try` kolonunda tutulur — overlay/high'a
  // düşmeden önce bunu tercih et (yoksa yeni gerçek ilanlarda başlangıç fiyatı 0 görünüyordu).
  const realStartPrice = Number(listing.start_price_try);
  const startBid = Number.isFinite(realStartPrice) && realStartPrice > 0
    ? realStartPrice
    : overlay.startingBid != null
      ? Number(overlay.startingBid)
      : high;
  const plainDescription =
    typeof rawBody === "string" && rawBody.trim() && !rawBody.trim().startsWith("{")
      ? rawBody
      : typeof overlay.description === "string"
        ? overlay.description
        : TEMPLATE.description;

  const listingBnRaw =
    listing.buy_now_price_try != null && String(listing.buy_now_price_try).trim() !== ""
      ? Number(listing.buy_now_price_try)
      : NaN;
  const listingBn = Number.isFinite(listingBnRaw) ? listingBnRaw : undefined;

  const propertyDetails = propertyDetailsFromBody(bodyFields, TEMPLATE.propertyDetails);
  const currentBid = Number.isFinite(high) && high > 0 ? high : Number.isFinite(startBid) ? startBid : TEMPLATE.currentBid;
  const pricePerSqm =
    overlay.pricePerSqm ??
    (propertyDetails.grossSqm > 0 ? Math.round(currentBid / propertyDetails.grossSqm) : TEMPLATE.pricePerSqm);

  return withListingDefaults({
    ...TEMPLATE,
    ...overlay,
    id: row.id,
    title: overlay.title ?? title,
    description: typeof overlay.description === "string" ? overlay.description : plainDescription,
    // Gerçek `listings` kolonları — emsal motorunun benzerlik skoru (şehir/ilçe/kategori)
    // buna bağlı; overlay'de yoksa TEMPLATE'e (demo) değil gerçek kolona düşmeli.
    city: listing.city ?? overlay.city ?? TEMPLATE.city,
    district: listing.district ?? overlay.district ?? TEMPLATE.district,
    category: (listing.category && CATEGORY_DB_TO_UI[listing.category]) ?? overlay.category ?? TEMPLATE.category,
    propertyDetails,
    currentBid,
    startingBid: Number.isFinite(startBid) ? startBid : TEMPLATE.startingBid,
    endDate: new Date(row.ends_at).toISOString(),
    status: mapDbAuctionStatus(row.status),
    estimatedValue: overlay.estimatedValue ?? TEMPLATE.estimatedValue,
    aiPredictedPrice: overlay.aiPredictedPrice ?? TEMPLATE.aiPredictedPrice,
    investmentScore: overlay.investmentScore ?? TEMPLATE.investmentScore,
    pricePerSqm,
    bidderCount: overlay.bidderCount ?? TEMPLATE.bidderCount,
    buyNowPriceTry: overlay.buyNowPriceTry ?? listingBn,
    isFeatured: overlay.isFeatured ?? Boolean(listing.is_featured),
    featuredBadge:
      (overlay.featuredBadge as Auction["featuredBadge"]) ??
      (listing.featured_badge as Auction["featuredBadge"]) ??
      null,
    viewCount: overlay.viewCount ?? Number(listing.view_count ?? 0),
  });
}

export type { DbAuctionRow };
