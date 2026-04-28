import type { Auction } from "@/types/auction";
import { AUCTIONS } from "@/data/auctions";
import { withListingDefaults } from "@/lib/listingPolicy";

type ListingRow = {
  id: string;
  title: string;
  body: string | null;
  status: string;
};

type DbAuctionRow = {
  id: string;
  status: string;
  starts_at: string;
  ends_at: string;
  current_high: number | string;
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

function parseBodyOverlay(body: string | null): Partial<Auction> {
  if (!body || !body.trim().startsWith("{")) return {};
  try {
    return JSON.parse(body) as Partial<Auction>;
  } catch {
    return {};
  }
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
      currentBid: Number(row.current_high) || 0,
      startingBid: Number(row.current_high) || 0,
    });
  }
  const title = listing.title?.trim() || "İlan";
  const rawBody = listing.body ?? null;
  const overlay = parseBodyOverlay(rawBody);
  const high = Number(row.current_high);
  const startBid = overlay.startingBid != null ? Number(overlay.startingBid) : high;
  const plainDescription =
    rawBody && !rawBody.trim().startsWith("{") ? rawBody : overlay.description ?? TEMPLATE.description;

  return withListingDefaults({
    ...TEMPLATE,
    ...overlay,
    id: row.id,
    title: overlay.title ?? title,
    description: typeof overlay.description === "string" ? overlay.description : plainDescription,
    currentBid: Number.isFinite(high) ? high : TEMPLATE.currentBid,
    startingBid: Number.isFinite(startBid) ? startBid : TEMPLATE.startingBid,
    endDate: new Date(row.ends_at).toISOString(),
    status: mapDbAuctionStatus(row.status),
    estimatedValue: overlay.estimatedValue ?? TEMPLATE.estimatedValue,
    aiPredictedPrice: overlay.aiPredictedPrice ?? TEMPLATE.aiPredictedPrice,
    investmentScore: overlay.investmentScore ?? TEMPLATE.investmentScore,
    pricePerSqm: overlay.pricePerSqm ?? TEMPLATE.pricePerSqm,
    bidderCount: overlay.bidderCount ?? TEMPLATE.bidderCount,
  });
}

export type { DbAuctionRow };
