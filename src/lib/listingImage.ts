export const LISTING_IMAGE_PLACEHOLDER =
  "https://placehold.co/1600x1000/0b1220/5eead4/png?text=ihaleal";

export function normalizeAuctionImages(images: string[] | undefined | null): string[] {
  const cleaned = (images ?? []).map((u) => String(u ?? "").trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : [LISTING_IMAGE_PLACEHOLDER];
}
