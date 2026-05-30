export type OfferStatus = "pending" | "accepted" | "rejected" | "countered";

export type ListingOfferRow = {
  id: string;
  listing_id: string;
  buyer_id: string;
  amount_try: number;
  counter_amount_try: number | null;
  status: OfferStatus;
  is_sealed: boolean;
  sealed_until: string | null;
  created_at: string;
  listing_title?: string;
};

export function isOfferAmountVisible(
  offer: Pick<ListingOfferRow, "is_sealed" | "sealed_until" | "buyer_id">,
  viewerId: string,
  viewerIsSeller: boolean,
): boolean {
  if (offer.buyer_id === viewerId) return true;
  if (!offer.is_sealed) return true;
  if (!offer.sealed_until) return false;
  return new Date(offer.sealed_until).getTime() <= Date.now();
}

export function maskOfferAmount(): string {
  return "Gizli (kapalı teklif)";
}

export function offerStatusLabel(status: OfferStatus): string {
  switch (status) {
    case "pending":
      return "Bekliyor";
    case "accepted":
      return "Kabul edildi";
    case "rejected":
      return "Reddedildi";
    case "countered":
      return "Karşı teklif";
  }
}
