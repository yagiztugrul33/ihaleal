export const LISTING_IMAGE_PLACEHOLDER = "/images/listing-placeholder.svg";

export function normalizeListingImageUrl(input: string | undefined | null): string {
  const raw = String(input ?? "").trim();
  if (!raw) return LISTING_IMAGE_PLACEHOLDER;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\.?\//, "")}`;
}

export function normalizeAuctionImages(images: string[] | undefined | null): string[] {
  const cleaned = (images ?? []).map((u) => normalizeListingImageUrl(u)).filter(Boolean);
  return cleaned.length > 0 ? cleaned : [LISTING_IMAGE_PLACEHOLDER];
}
