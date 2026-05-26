export type AuctionStatus = "open" | "closing" | "closed";

export type AuctionListItem = {
  id: string;
  title: string;
  imageUrl: string;
  currentBidTry: number;
  endAtIso: string;
};

export type AuctionFilters = {
  status: "all" | AuctionStatus;
  minBidTry: number | null;
  maxBidTry: number | null;
  maxRemainingHours: number | null;
  sortBy: "remainingAsc" | "bidDesc" | "bidAsc";
};
