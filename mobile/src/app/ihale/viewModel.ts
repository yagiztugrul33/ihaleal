import { MOCK_AUCTIONS } from "../ihaleler/data";

export type AuctionDetailViewModel = {
  id: string;
  listingId: string;
  title: string;
  imageUrl: string;
  currentBidTry: number;
  minimumNextBidTry: number;
  statusLabel: "Açık" | "Kapanıyor" | "Kapandı";
  remainingLabel: string;
};

export function toAuctionDetailViewModel(auctionId: string, nowMs = Date.now()): AuctionDetailViewModel | null {
  const row = MOCK_AUCTIONS.find((item) => item.id === auctionId);
  if (!row) return null;

  const remainingMs = new Date(row.endAtIso).getTime() - nowMs;
  const statusLabel = remainingMs <= 0 ? "Kapandı" : remainingMs <= 6 * 60 * 60 * 1000 ? "Kapanıyor" : "Açık";
  const remainingLabel = formatRemainingLabel(remainingMs);
  const minimumNextBidTry = Math.round((row.currentBidTry + 25_000) / 1000) * 1000;

  return {
    id: row.id,
    listingId: row.listingId,
    title: row.title,
    imageUrl: row.imageUrl,
    currentBidTry: row.currentBidTry,
    minimumNextBidTry,
    statusLabel,
    remainingLabel,
  };
}

export function formatRemainingLabel(remainingMs: number): string {
  if (remainingMs <= 0) return "Süre doldu";
  const totalMinutes = Math.floor(remainingMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}s ${minutes}dk`;
}
