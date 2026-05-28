import type { AuctionListItem } from "./types";

const now = Date.now();
const hourMs = 60 * 60 * 1000;

export const MOCK_AUCTIONS: AuctionListItem[] = [
  {
    id: "demo-ihale-1",
    listingId: "demo-listing-1",
    title: "Kadıköy 3+1 daire",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&auto=format&fit=crop",
    currentBidTry: 6_250_000,
    endAtIso: new Date(now + 2 * hourMs).toISOString(),
  },
  {
    id: "demo-ihale-2",
    listingId: "demo-listing-2",
    title: "Bodrum müstakil villa",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop",
    currentBidTry: 12_900_000,
    endAtIso: new Date(now + 30 * hourMs).toISOString(),
  },
  {
    id: "demo-ihale-3",
    listingId: "demo-listing-3",
    title: "Ankara Çankaya ofis",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop",
    currentBidTry: 4_400_000,
    endAtIso: new Date(now - 8 * hourMs).toISOString(),
  },
  {
    id: "demo-ihale-4",
    listingId: "demo-listing-4",
    title: "İzmir Urla arsa",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&auto=format&fit=crop",
    currentBidTry: 3_150_000,
    endAtIso: new Date(now + 10 * hourMs).toISOString(),
  },
];

export async function fetchMockAuctions(): Promise<AuctionListItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 240));
  return MOCK_AUCTIONS;
}
